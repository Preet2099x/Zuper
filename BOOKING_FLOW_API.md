# 🚗 Booking Flow API Documentation (Without Payment)

## Overview
This document describes the complete booking flow with contract signing, implemented without payment integration.

---

## 📊 State Machine

### Booking States
1. **PENDING_PROVIDER** - Initial state after customer creates booking
2. **PROVIDER_ACCEPTED** - Provider approved, contract created
3. **CONFIRMED** - Customer signed contract, booking confirmed
4. **CANCELLED** - Booking cancelled (by rejection or cancellation)

### Contract States
1. **PENDING_CUSTOMER** - Waiting for customer signature
2. **SIGNED** - Customer signed, contract active
3. **VOID** - Contract rejected/voided

---

## 🔄 Complete Flow

### Success Path
```
1. Customer clicks "Book"
   └─> Booking created with status: PENDING_PROVIDER

2. Provider Accepts
   └─> Booking status: PROVIDER_ACCEPTED
   └─> Contract created with status: PENDING_CUSTOMER
   └─> Provider auto-signed (providerSignedAt timestamp)

3. Customer Signs Contract
   └─> Contract status: SIGNED
   └─> Booking status: CONFIRMED
   └─> Vehicle status: rented (unavailable)
   └─> Contract added to customer's "My Vehicles"
```

### Failure Paths

#### Provider Rejects
```
Provider rejects booking
└─> Booking status: CANCELLED
└─> Flow stops
```

#### Customer Rejects Contract
```
Customer rejects contract
└─> Contract status: VOID
└─> Booking status: CANCELLED
└─> Flow stops
```

---

## 🔌 API Endpoints

### 1. Customer Creates Booking Request

**POST** `/api/bookings`

**Auth**: Customer token required

**Body**:
```json
{
  "vehicleId": "vehicle_id_here",
  "startDate": "2025-12-01",
  "endDate": "2025-12-10",
  "customerNote": "Optional note to provider"
}
```

**Response**:
```json
{
  "message": "Booking request created successfully",
  "booking": {
    "_id": "booking_id",
    "status": "PENDING_PROVIDER",
    "customer": {...},
    "provider": {...},
    "vehicle": {...},
    "startDate": "2025-12-01",
    "endDate": "2025-12-10",
    "numberOfDays": 9,
    "dailyRate": 2500,
    "totalCost": 22500
  }
}
```

---

### 2. Provider Approves Booking

**PUT** `/api/bookings/provider/:bookingId/approve`

**Auth**: Provider token required

**Body**:
```json
{
  "providerNote": "Optional response to customer"
}
```

**Response**:
```json
{
  "message": "Booking approved. Contract sent to customer for signature.",
  "booking": {
    "_id": "booking_id",
    "status": "PROVIDER_ACCEPTED",
    "providerAcceptedAt": "2025-11-26T10:30:00Z",
    "contract": "contract_id"
  },
  "contract": {
    "_id": "contract_id",
    "status": "PENDING_CUSTOMER",
    "providerSignedAt": "2025-11-26T10:30:00Z",
    "customerSignedAt": null
  }
}
```

**Side Effects**:
- Booking status → `PROVIDER_ACCEPTED`
- Contract created with status `PENDING_CUSTOMER`
- Provider auto-signed (`providerSignedAt` timestamp)

---

### 3. Provider Rejects Booking

**PUT** `/api/bookings/provider/:bookingId/reject`

**Auth**: Provider token required

**Body**:
```json
{
  "providerNote": "Reason for rejection"
}
```

**Response**:
```json
{
  "message": "Booking request rejected. Booking cancelled.",
  "booking": {
    "_id": "booking_id",
    "status": "CANCELLED"
  }
}
```

**Side Effects**:
- Booking status → `CANCELLED`
- Flow stops

---

### 4. Customer Signs Contract

**PUT** `/api/bookings/contracts/:contractId/sign`

**Auth**: Customer token required

**Response**:
```json
{
  "message": "Contract signed successfully! Booking confirmed.",
  "contract": {
    "_id": "contract_id",
    "status": "SIGNED",
    "providerSignedAt": "2025-11-26T10:30:00Z",
    "customerSignedAt": "2025-11-26T11:00:00Z"
  },
  "booking": {
    "_id": "booking_id",
    "status": "CONFIRMED"
  }
}
```

**Side Effects**:
- Contract status → `SIGNED`
- Customer signed timestamp added
- Booking status → `CONFIRMED`
- Vehicle status → `rented` (unavailable)
- Contract added to customer's contracts array

---

### 5. Customer Rejects Contract

**PUT** `/api/bookings/contracts/:contractId/reject`

**Auth**: Customer token required

**Response**:
```json
{
  "message": "Contract rejected. Booking cancelled.",
  "contract": {
    "_id": "contract_id",
    "status": "VOID"
  },
  "booking": {
    "_id": "booking_id",
    "status": "CANCELLED"
  }
}
```

**Side Effects**:
- Contract status → `VOID`
- Booking status → `CANCELLED`
- Flow stops

---

### 6. Get Contract Details

**GET** `/api/bookings/contracts/:contractId`

**Auth**: Customer or Provider token required

**Response**:
```json
{
  "_id": "contract_id",
  "booking": {...},
  "customer": {...},
  "provider": {...},
  "vehicle": {...},
  "status": "PENDING_CUSTOMER",
  "providerSignedAt": "2025-11-26T10:30:00Z",
  "customerSignedAt": null,
  "terms": "Standard vehicle rental agreement...",
  "startDate": "2025-12-01",
  "endDate": "2025-12-10"
}
```

---

### 7. Get Customer's Contracts

**GET** `/api/bookings/customer/contracts`

**Auth**: Customer token required

**Response**:
```json
[
  {
    "_id": "contract_id",
    "status": "SIGNED",
    "vehicle": {...},
    "provider": {...},
    "startDate": "2025-12-01",
    "endDate": "2025-12-10"
  }
]
```

---

### 8. Get Customer's Bookings

**GET** `/api/bookings/customer/my-bookings`

**Auth**: Customer token required

**Response**:
```json
[
  {
    "_id": "booking_id",
    "status": "CONFIRMED",
    "vehicle": {...},
    "provider": {...},
    "contract": "contract_id",
    "totalCost": 22500
  }
]
```

---

### 9. Get Provider's Booking Requests (Messages)

**GET** `/api/bookings/provider/messages`

**Auth**: Provider token required

**Response**:
```json
[
  {
    "_id": "booking_id",
    "status": "PENDING_PROVIDER",
    "customer": {...},
    "vehicle": {...},
    "totalCost": 22500
  }
]
```

---

### 10. Customer Cancels Booking

**PUT** `/api/bookings/customer/:bookingId/cancel`

**Auth**: Customer token required

**Allowed States**: `PENDING_PROVIDER`, `PROVIDER_ACCEPTED`

**Response**:
```json
{
  "message": "Booking request cancelled",
  "booking": {
    "_id": "booking_id",
    "status": "CANCELLED"
  }
}
```

**Side Effects**:
- Booking status → `CANCELLED`
- If contract exists, contract status → `VOID`

---

## 🗄️ Database Schema Changes

### BookingRequest Model
```javascript
{
  status: {
    type: String,
    enum: ["PENDING_PROVIDER", "PROVIDER_ACCEPTED", "CONFIRMED", "CANCELLED"],
    default: "PENDING_PROVIDER"
  },
  contract: {
    type: ObjectId,
    ref: "Contract"
  },
  providerAcceptedAt: {
    type: Date,
    default: null
  }
}
```

### Contract Model
```javascript
{
  booking: {
    type: ObjectId,
    ref: "BookingRequest",
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING_CUSTOMER", "SIGNED", "VOID"],
    default: "PENDING_CUSTOMER"
  },
  providerSignedAt: {
    type: Date,
    required: true // Auto-set when provider accepts
  },
  customerSignedAt: {
    type: Date,
    default: null
  },
  terms: {
    type: String,
    default: "Standard vehicle rental agreement..."
  }
}
```

---

## 📝 Usage Examples

### Frontend Flow Implementation

#### Step 1: Customer Books Vehicle
```javascript
const bookVehicle = async (vehicleId, startDate, endDate) => {
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vehicleId,
      startDate,
      endDate,
      customerNote: "Looking forward to renting!"
    })
  });
  const data = await response.json();
  // Booking created with status: PENDING_PROVIDER
};
```

#### Step 2: Provider Reviews & Approves
```javascript
const approveBooking = async (bookingId) => {
  const response = await fetch(`${API_BASE}/api/bookings/provider/${bookingId}/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${providerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      providerNote: "Vehicle is ready for you!"
    })
  });
  const data = await response.json();
  // Contract created, waiting for customer signature
  const contractId = data.contract._id;
};
```

#### Step 3: Customer Signs Contract
```javascript
const signContract = async (contractId) => {
  const response = await fetch(`${API_BASE}/api/bookings/contracts/${contractId}/sign`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  // Booking confirmed! Vehicle added to customer's vehicles
};
```

---

## ✅ Testing Checklist

- [ ] Customer can create booking request
- [ ] Provider receives booking in messages
- [ ] Provider can approve booking → contract created
- [ ] Provider can reject booking → booking cancelled
- [ ] Customer receives contract after provider approval
- [ ] Customer can sign contract → booking confirmed
- [ ] Customer can reject contract → booking cancelled
- [ ] Vehicle marked as rented after contract signed
- [ ] Contract appears in customer's "My Vehicles"
- [ ] Customer can cancel before contract signed
- [ ] Status transitions follow state machine
- [ ] Timestamps recorded correctly (providerAcceptedAt, providerSignedAt, customerSignedAt)

---

## 🚀 Next Steps (Future Enhancements)

1. **Payment Integration**: Add payment step before contract confirmation
2. **Email Notifications**: Notify users at each state transition
3. **Contract PDF Generation**: Generate downloadable PDF contracts
4. **Vehicle Return Flow**: Add return confirmation and vehicle status updates
5. **Review System**: Allow customers to review after rental completion
6. **Dispute Resolution**: Handle contract disputes and modifications

---

## 🐛 Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Resource created
- **400**: Bad request (invalid data, wrong state)
- **403**: Forbidden (not authorized)
- **404**: Resource not found
- **500**: Server error

Example error response:
```json
{
  "message": "Booking request is already CONFIRMED"
}
```
