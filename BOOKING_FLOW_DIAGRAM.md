# 📊 Booking Flow State Diagram

## Visual State Machine

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BOOKING FLOW WITHOUT PAYMENT                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  CUSTOMER BOOKS  │
│     VEHICLE      │
└────────┬─────────┘
         │
         │ POST /api/bookings
         │ {vehicleId, startDate, endDate}
         ▼
┌────────────────────┐
│ PENDING_PROVIDER   │ ◄──────────────┐
│                    │                │
│ Waiting for        │                │
│ provider response  │                │
└────────┬───────────┘                │
         │                            │
         │                            │ Customer can cancel
    ┌────┴────┐                       │ PUT /customer/:id/cancel
    │         │                       │
    │         │                       │
    ▼         ▼                       │
┌─────────┐ ┌────────────┐           │
│ APPROVE │ │   REJECT   │           │
└────┬────┘ └─────┬──────┘           │
     │            │                  │
     │            │                  │
     │            └──────┐           │
     │                   │           │
     │                   ▼           │
     │            ┌─────────────┐    │
     │            │  CANCELLED  │    │
     │            │             │    │
     │            │ Flow stops  │    │
     │            └─────────────┘    │
     │                               │
     │ PUT /provider/:id/approve     │
     │                               │
     ▼                               │
┌────────────────────┐               │
│ PROVIDER_ACCEPTED  │───────────────┘
│                    │
│ + Contract Created │
│ + Provider Signed  │
└────────┬───────────┘
         │
         │ Contract status: PENDING_CUSTOMER
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌────────────┐
│  SIGN   │ │   REJECT   │
│CONTRACT │ │  CONTRACT  │
└────┬────┘ └─────┬──────┘
     │            │
     │            │
     │            │
     │            ▼
     │     ┌──────────────┐        ┌──────────────┐
     │     │  CONTRACT    │        │   BOOKING    │
     │     │    VOID      │◄───────┤  CANCELLED   │
     │     └──────────────┘        └──────────────┘
     │            
     │ PUT /contracts/:id/sign
     │
     ▼
┌────────────────────┐
│    CONFIRMED       │
│                    │
│ ✅ Contract SIGNED │
│ ✅ Vehicle RENTED  │
│ ✅ Added to        │
│    My Vehicles     │
└────────────────────┘
         │
         │
         ▼
    SUCCESS! 🎉
```

---

## Contract States Flow

```
                        PROVIDER ACCEPTS BOOKING
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   CONTRACT CREATED       │
                    │                          │
                    │ Status: PENDING_CUSTOMER │
                    │ Provider: ✅ Auto-signed │
                    │ Customer: ⏳ Pending     │
                    └────────────┬─────────────┘
                                 │
                            ┌────┴────┐
                            │         │
                            ▼         ▼
                    ┌──────────┐  ┌──────────┐
                    │  SIGN    │  │  REJECT  │
                    └─────┬────┘  └─────┬────┘
                          │             │
                          ▼             ▼
                    ┌──────────┐  ┌──────────┐
                    │  SIGNED  │  │   VOID   │
                    │          │  │          │
                    │ Provider:│  │ Booking  │
                    │ ✅ Signed│  │ Cancelled│
                    │ Customer:│  └──────────┘
                    │ ✅ Signed│
                    └──────────┘
```

---

## Status Values Quick Reference

### Booking Statuses
| Status | Description | Next Actions |
|--------|-------------|--------------|
| `PENDING_PROVIDER` | Waiting for provider to accept/reject | Provider: Approve or Reject<br>Customer: Cancel |
| `PROVIDER_ACCEPTED` | Provider approved, contract pending | Customer: Sign or Reject Contract<br>Customer: Cancel |
| `CONFIRMED` | Contract signed, booking active | None (rental active) |
| `CANCELLED` | Booking cancelled/rejected | None (terminal state) |

### Contract Statuses
| Status | Description | Next Actions |
|--------|-------------|--------------|
| `PENDING_CUSTOMER` | Waiting for customer signature | Customer: Sign or Reject |
| `SIGNED` | Both parties signed | None (active contract) |
| `VOID` | Contract rejected/voided | None (terminal state) |

---

## Timeline Example

```
📅 Day 1, 10:00 AM
   Customer books vehicle
   Status: PENDING_PROVIDER
   ↓

📅 Day 1, 2:30 PM
   Provider approves
   Status: PROVIDER_ACCEPTED
   Contract created (PENDING_CUSTOMER)
   providerSignedAt: 2025-11-26T14:30:00Z
   ↓

📅 Day 1, 5:15 PM
   Customer signs contract
   Status: CONFIRMED
   Contract: SIGNED
   customerSignedAt: 2025-11-26T17:15:00Z
   Vehicle: rented
   ↓

📅 Day 2 - Day 10
   Rental period (vehicle in use)
   ↓

📅 Day 10 (Future feature)
   Customer returns vehicle
   (Not yet implemented)
```

---

## API Endpoints Map

```
CUSTOMER ACTIONS:
├── POST   /api/bookings                          → Create booking
├── GET    /api/bookings/customer/my-bookings     → List bookings
├── PUT    /api/bookings/customer/:id/cancel      → Cancel booking
├── GET    /api/bookings/customer/contracts       → List contracts
├── GET    /api/bookings/contracts/:id            → View contract
├── PUT    /api/bookings/contracts/:id/sign       → Sign contract ✅
└── PUT    /api/bookings/contracts/:id/reject     → Reject contract ❌

PROVIDER ACTIONS:
├── GET    /api/bookings/provider/messages         → List requests
├── PUT    /api/bookings/provider/:id/approve     → Approve booking ✅
└── PUT    /api/bookings/provider/:id/reject      → Reject booking ❌
```

---

## Error Handling Flow

```
❌ INVALID STATE TRANSITION
   Example: Customer tries to sign already SIGNED contract
   Response: 400 Bad Request
            "Contract is already SIGNED"

❌ UNAUTHORIZED ACTION
   Example: Wrong customer tries to sign contract
   Response: 403 Forbidden
            "Not authorized to sign this contract"

❌ MISSING RESOURCE
   Example: Contract ID doesn't exist
   Response: 404 Not Found
            "Contract not found"

✅ SUCCESS
   Response: 200 OK
            {message, booking, contract}
```

---

## Database Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Customer   │◄────────│   Booking   │────────►│  Provider   │
└──────┬──────┘         └──────┬──────┘         └─────────────┘
       │                       │                         
       │                       │                         
       │                ┌──────▼──────┐                 
       │                │  Contract   │                 
       │                └──────┬──────┘                 
       │                       │                         
       │                       ▼                         
       │                ┌─────────────┐                 
       └───────────────►│   Vehicle   │                 
        (contracts[])   └─────────────┘                 
```

---

## Success Criteria Checklist

✅ Customer can create booking
✅ Provider receives notification (messages)
✅ Provider can approve → Creates contract
✅ Provider can reject → Cancels booking
✅ Contract auto-signs for provider
✅ Customer receives contract to review
✅ Customer can sign → Confirms booking
✅ Customer can reject → Cancels booking
✅ Vehicle marked as rented after signing
✅ Contract added to customer's vehicles
✅ All state transitions validated
✅ Timestamps recorded for audit trail
✅ Proper error handling for invalid states
✅ Authorization checks on all endpoints

---

## Integration Points

### Frontend Components Needed
1. **Booking Request Modal** - Customer creates booking
2. **Provider Messages** - Lists pending requests
3. **Contract Review Modal** - Customer reviews & signs
4. **Booking Status Badge** - Shows current state
5. **My Vehicles** - Shows confirmed rentals

### Backend Integration
- ✅ Authentication (JWT) - Already integrated
- ✅ Database (MongoDB) - Schemas updated
- ✅ File Storage (Azure) - Vehicle images
- 🔜 Email Service - Notifications (future)
- 🔜 Payment Gateway - Stripe/Razorpay (future)

---

## Testing Scenarios

### Happy Path ✅
1. Customer books → PENDING_PROVIDER
2. Provider approves → PROVIDER_ACCEPTED + Contract
3. Customer signs → CONFIRMED + Vehicle rented

### Provider Rejection ❌
1. Customer books → PENDING_PROVIDER
2. Provider rejects → CANCELLED
3. Flow stops

### Customer Rejection ❌
1. Customer books → PENDING_PROVIDER
2. Provider approves → PROVIDER_ACCEPTED + Contract
3. Customer rejects contract → CANCELLED + Contract VOID

### Early Cancellation ❌
1. Customer books → PENDING_PROVIDER
2. Customer cancels → CANCELLED
3. Flow stops

---

**End of State Diagram** 🎯
```
