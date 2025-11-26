# 🔄 Booking Flow Migration Guide

## Overview
This guide helps migrate existing bookings to the new state machine flow.

---

## Database Migration Steps

### Step 1: Update Existing Bookings

Run this MongoDB script to migrate existing booking statuses:

```javascript
// Connect to your MongoDB database
use zuper_database;

// Migrate booking statuses
db.bookingrequests.updateMany(
  { status: "pending" },
  { $set: { status: "PENDING_PROVIDER" } }
);

db.bookingrequests.updateMany(
  { status: "approved" },
  { $set: { status: "CONFIRMED" } }
);

db.bookingrequests.updateMany(
  { status: "rejected" },
  { $set: { status: "CANCELLED" } }
);

db.bookingrequests.updateMany(
  { status: "cancelled" },
  { $set: { status: "CANCELLED" } }
);

// Add providerAcceptedAt for confirmed bookings
db.bookingrequests.updateMany(
  { status: "CONFIRMED", providerAcceptedAt: { $exists: false } },
  { $set: { providerAcceptedAt: new Date() } }
);
```

### Step 2: Update Existing Contracts

```javascript
// Migrate contract statuses
db.contracts.updateMany(
  { status: "active" },
  { 
    $set: { 
      status: "SIGNED",
      providerSignedAt: new Date(),
      customerSignedAt: new Date()
    } 
  }
);

db.contracts.updateMany(
  { status: "cancelled" },
  { $set: { status: "VOID" } }
);

// Add booking reference to existing contracts
// Note: This requires manual mapping or script to match contracts to bookings
```

### Step 3: Verify Migration

```javascript
// Check booking status distribution
db.bookingrequests.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]);

// Check contract status distribution
db.contracts.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
]);

// Verify all CONFIRMED bookings have providerAcceptedAt
db.bookingrequests.find({
  status: "CONFIRMED",
  providerAcceptedAt: null
}).count();
```

---

## Rollback Plan

If you need to rollback to the old schema:

```javascript
// Revert booking statuses
db.bookingrequests.updateMany(
  { status: "PENDING_PROVIDER" },
  { $set: { status: "pending" } }
);

db.bookingrequests.updateMany(
  { status: "PROVIDER_ACCEPTED" },
  { $set: { status: "pending" } }
);

db.bookingrequests.updateMany(
  { status: "CONFIRMED" },
  { $set: { status: "approved" } }
);

db.bookingrequests.updateMany(
  { status: "CANCELLED" },
  { $set: { status: "cancelled" } }
);

// Revert contract statuses
db.contracts.updateMany(
  { status: "SIGNED" },
  { $set: { status: "active" } }
);

db.contracts.updateMany(
  { status: "VOID" },
  { $set: { status: "cancelled" } }
);

db.contracts.updateMany(
  { status: "PENDING_CUSTOMER" },
  { $set: { status: "active" } }
);
```

---

## Testing After Migration

### Test Cases

1. **New Bookings Work Correctly**
   ```bash
   # Create new booking as customer
   POST /api/bookings
   # Verify status is PENDING_PROVIDER
   ```

2. **Provider Actions Work**
   ```bash
   # Approve booking as provider
   PUT /api/bookings/provider/:bookingId/approve
   # Verify contract created with PENDING_CUSTOMER status
   ```

3. **Customer Contract Actions Work**
   ```bash
   # Sign contract as customer
   PUT /api/bookings/contracts/:contractId/sign
   # Verify booking status is CONFIRMED
   ```

4. **Existing Data is Accessible**
   ```bash
   # Get customer bookings
   GET /api/bookings/customer/my-bookings
   # Verify old bookings display correctly
   ```

---

## Common Issues & Solutions

### Issue: Existing contracts missing booking reference

**Solution**: Run this script to link contracts to bookings:

```javascript
// Get all contracts without booking reference
const contracts = db.contracts.find({ booking: null });

contracts.forEach(contract => {
  // Find matching booking
  const booking = db.bookingrequests.findOne({
    customer: contract.customer,
    provider: contract.provider,
    vehicle: contract.vehicle,
    contract: contract._id
  });
  
  if (booking) {
    db.contracts.updateOne(
      { _id: contract._id },
      { $set: { booking: booking._id } }
    );
  }
});
```

### Issue: Timestamps missing on old records

**Solution**: Backfill with created timestamps:

```javascript
// Set providerSignedAt to contract createdAt for old contracts
db.contracts.find({ providerSignedAt: null }).forEach(contract => {
  db.contracts.updateOne(
    { _id: contract._id },
    { $set: { providerSignedAt: contract.createdAt } }
  );
});

// Set customerSignedAt to contract createdAt for SIGNED contracts
db.contracts.find({ 
  status: "SIGNED", 
  customerSignedAt: null 
}).forEach(contract => {
  db.contracts.updateOne(
    { _id: contract._id },
    { $set: { customerSignedAt: contract.createdAt } }
  );
});
```

---

## Deployment Checklist

- [ ] Backup database before migration
- [ ] Run migration scripts in staging environment first
- [ ] Test all API endpoints after migration
- [ ] Verify existing bookings are accessible
- [ ] Test new booking flow end-to-end
- [ ] Update frontend to handle new status values
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor error logs for 24 hours
- [ ] Document any issues encountered

---

## Frontend Updates Required

Update status checks in frontend code:

### Before:
```javascript
if (booking.status === 'pending') { /* ... */ }
if (booking.status === 'approved') { /* ... */ }
```

### After:
```javascript
if (booking.status === 'PENDING_PROVIDER') { /* ... */ }
if (booking.status === 'CONFIRMED') { /* ... */ }
```

---

## Support

If you encounter issues during migration:
1. Check MongoDB logs for errors
2. Verify schema changes applied correctly
3. Test API endpoints individually
4. Roll back if critical issues found
5. Document issues for future reference
