# 💳 Payment Integration with Razorpay

## Overview
Payment is now required after contract signing to confirm the booking. The integration uses Razorpay for secure payment processing.

---

## 🔄 Updated Booking Flow

### Complete Flow with Payment

```
1. Customer creates booking request
   └─> Booking status: PENDING_PROVIDER

2. Provider accepts booking
   └─> Booking status: PROVIDER_ACCEPTED
   └─> Contract created: PENDING_CUSTOMER
   └─> Provider auto-signed

3. Customer signs contract
   └─> Contract status: SIGNED
   └─> Booking status: PAYMENT_PENDING
   └─> Customer directed to payment

4. Customer completes payment
   └─> Payment verified via Razorpay
   └─> Booking status: CONFIRMED
   └─> Vehicle status: rented
   └─> Contract added to "My Vehicles"
```

---

## 🔌 Payment API Endpoints

### 1. Create Payment Order

**POST** `/api/payments/create-order/:contractId`

**Auth**: Customer token required

**Description**: Creates a Razorpay order after contract is signed

**Response**:
```json
{
  "message": "Payment order created successfully",
  "order": {
    "id": "order_MNxyz123456789",
    "amount": 2250000,
    "currency": "INR"
  },
  "payment": {
    "_id": "payment_id",
    "contract": "contract_id",
    "booking": "booking_id",
    "customer": "customer_id",
    "amount": 22500,
    "currency": "INR",
    "razorpayOrderId": "order_MNxyz123456789",
    "status": "pending"
  },
  "razorpayKeyId": "rzp_test_RkMBGpXG4ZHb6s"
}
```

---

### 2. Verify Payment

**POST** `/api/payments/verify`

**Auth**: Customer token required

**Description**: Verifies payment signature and completes booking

**Body**:
```json
{
  "razorpayOrderId": "order_MNxyz123456789",
  "razorpayPaymentId": "pay_MNxyz123456789",
  "razorpaySignature": "signature_hash_here"
}
```

**Response**:
```json
{
  "message": "Payment verified and booking confirmed successfully",
  "payment": {
    "_id": "payment_id",
    "contract": {...},
    "booking": {...},
    "amount": 22500,
    "status": "paid",
    "razorpayPaymentId": "pay_MNxyz123456789"
  },
  "success": true
}
```

**Side Effects**:
- Payment status → `paid`
- Booking status → `CONFIRMED`
- Vehicle status → `rented`
- Contract added to customer's contracts

---

### 3. Get Payment by Contract

**GET** `/api/payments/contract/:contractId`

**Auth**: Customer token required

**Description**: Retrieves payment details for a specific contract

**Response**:
```json
{
  "_id": "payment_id",
  "contract": {...},
  "booking": {...},
  "customer": {...},
  "amount": 22500,
  "currency": "INR",
  "status": "paid",
  "razorpayOrderId": "order_MNxyz123456789",
  "razorpayPaymentId": "pay_MNxyz123456789"
}
```

---

### 4. Get Customer Payment History

**GET** `/api/payments/customer/history`

**Auth**: Customer token required

**Description**: Retrieves all payments made by the customer

**Response**:
```json
[
  {
    "_id": "payment_id",
    "contract": {...},
    "booking": {...},
    "amount": 22500,
    "status": "paid",
    "createdAt": "2025-11-26T10:00:00Z"
  }
]
```

---

### 5. Razorpay Webhook Handler

**POST** `/api/payments/webhook`

**Auth**: None (Razorpay signature verification)

**Description**: Handles Razorpay webhook events for payment status updates

**Events Handled**:
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed

---

## 📱 Frontend Integration

### Step 1: Customer Signs Contract

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
  
  if (data.nextStep === 'payment_required') {
    // Redirect to payment flow
    initiatePayment(contractId);
  }
};
```

---

### Step 2: Create Payment Order

```javascript
const initiatePayment = async (contractId) => {
  const response = await fetch(`${API_BASE}/api/payments/create-order/${contractId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  // Open Razorpay checkout
  openRazorpayCheckout(data);
};
```

---

### Step 3: Razorpay Checkout Integration

```javascript
const openRazorpayCheckout = (paymentData) => {
  const options = {
    key: paymentData.razorpayKeyId,
    amount: paymentData.order.amount,
    currency: paymentData.order.currency,
    name: "Zuper Vehicle Rentals",
    description: "Vehicle Rental Payment",
    order_id: paymentData.order.id,
    
    handler: async function (response) {
      // Payment successful - verify on backend
      await verifyPayment({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      });
    },
    
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone
    },
    
    theme: {
      color: "#3399cc"
    },
    
    modal: {
      ondismiss: function() {
        // Payment cancelled by user
        alert("Payment cancelled");
      }
    }
  };
  
  const razorpay = new Razorpay(options);
  razorpay.open();
};
```

---

### Step 4: Verify Payment

```javascript
const verifyPayment = async (paymentDetails) => {
  const response = await fetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${customerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentDetails)
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Payment verified and booking confirmed!
    alert("Booking confirmed successfully!");
    // Redirect to dashboard or booking details
  } else {
    alert("Payment verification failed");
  }
};
```

---

## 🎨 Frontend Setup

### Include Razorpay Script

Add this to your `index.html`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

Or install via npm:

```bash
npm install react-razorpay
```

---

## 🗄️ Database Schema Updates

### BookingRequest Model
```javascript
status: {
  type: String,
  enum: [
    "PENDING_PROVIDER",
    "PROVIDER_ACCEPTED",
    "PAYMENT_PENDING",    // New status
    "CONFIRMED",
    "CANCELLED"
  ]
}
```

### Contract Model
```javascript
{
  payment: {
    type: ObjectId,
    ref: "Payment",
    default: null
  }
}
```

### Payment Model
```javascript
{
  contract: { type: ObjectId, ref: "Contract", required: true },
  booking: { type: ObjectId, ref: "BookingRequest", required: true },
  customer: { type: ObjectId, ref: "Customer", required: true },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }
}
```

---

## 🔐 Environment Variables

Required in `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_RkMBGpXG4ZHb6s
RAZORPAY_KEY_SECRET=vmCM2OoMlnzdfEjghyay5mwg
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here (optional)
```

---

## 🧪 Testing Flow

### Test Successful Payment

1. **Create Booking**
   ```bash
   POST /api/bookings
   ```

2. **Provider Approves**
   ```bash
   PUT /api/bookings/provider/:bookingId/approve
   ```

3. **Customer Signs Contract**
   ```bash
   PUT /api/bookings/contracts/:contractId/sign
   ```
   Response: `nextStep: "payment_required"`

4. **Create Payment Order**
   ```bash
   POST /api/payments/create-order/:contractId
   ```

5. **Complete Payment** (use Razorpay test cards)
   - Use Razorpay's test checkout
   - Card: 4111 1111 1111 1111
   - Any future expiry, any CVV

6. **Verify Payment**
   ```bash
   POST /api/payments/verify
   ```

7. **Check Booking Status**
   ```bash
   GET /api/bookings/customer/my-bookings
   ```
   Status should be: `CONFIRMED`

---

## 💳 Razorpay Test Cards

### Successful Payment
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Failed Payment
- **Card Number**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVV**: Any 3 digits

---

## 🔔 Webhook Setup (Optional but Recommended)

### Configure Webhook in Razorpay Dashboard

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy webhook secret and add to `.env`:
   ```env
   RAZORPAY_WEBHOOK_SECRET=your_secret_here
   ```

### Events Handled
- **payment.captured**: Automatically confirms booking
- **payment.failed**: Marks payment as failed

---

## 🛡️ Security Features

1. **Signature Verification**: All payments verified using Razorpay signature
2. **Order Validation**: Amount and order ID validated on backend
3. **Duplicate Prevention**: Checks for existing paid payments
4. **Webhook Security**: Optional webhook signature verification
5. **Authorization**: Only contract owner can initiate payment

---

## 📊 Payment Status Flow

```
┌─────────────┐
│   pending   │ ← Payment order created
└──────┬──────┘
       │
       ├─── Payment Successful ──→ ┌──────┐
       │                           │ paid │
       │                           └──────┘
       │
       └─── Payment Failed ──────→ ┌────────┐
                                   │ failed │
                                   └────────┘
```

---

## ✅ Checklist

- [x] Razorpay package installed
- [x] Payment model updated with Razorpay fields
- [x] Payment controller created
- [x] Payment routes registered
- [x] Contract model updated with payment reference
- [x] Booking flow updated for payment
- [x] PAYMENT_PENDING status added
- [ ] Frontend payment integration
- [ ] Test with Razorpay test cards
- [ ] Configure webhooks (optional)

---

## 🔄 Complete API Flow Summary

```
POST   /api/bookings                          → Create booking (PENDING_PROVIDER)
PUT    /api/bookings/provider/:id/approve    → Approve (PROVIDER_ACCEPTED)
PUT    /api/bookings/contracts/:id/sign      → Sign contract (PAYMENT_PENDING)
POST   /api/payments/create-order/:id        → Create Razorpay order
       [User completes payment on Razorpay]
POST   /api/payments/verify                  → Verify & confirm (CONFIRMED)
```

---

## 🐛 Troubleshooting

### Payment verification fails
- Check Razorpay key/secret are correct
- Verify signature generation matches Razorpay format
- Check order ID matches

### Booking not confirmed after payment
- Check payment status in database
- Verify booking status updated to CONFIRMED
- Check vehicle status updated to 'rented'

### Webhook not working
- Verify webhook secret matches Razorpay dashboard
- Check webhook URL is publicly accessible
- Ensure webhook route doesn't require authentication

---

## 🚀 Next Steps

1. **Frontend Integration**: Implement Razorpay checkout in React
2. **Email Notifications**: Send payment confirmation emails
3. **Refund System**: Add refund handling for cancellations
4. **Invoice Generation**: Generate PDF invoices after payment
5. **Payment Analytics**: Track payment success rates
