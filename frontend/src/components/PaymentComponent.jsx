import React, { useState, useEffect } from 'react';

/**
 * Payment Modal Component for Razorpay Integration
 * 
 * This component handles the payment flow after contract signing:
 * 1. Creates payment order
 * 2. Opens Razorpay checkout
 * 3. Verifies payment on backend
 * 4. Confirms booking
 */

const PaymentModal = ({ isOpen, onClose, contractId, bookingDetails, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay script on mount
  useEffect(() => {
    const loadScript = () => {
      if (window.Razorpay) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        setError('Failed to load payment gateway');
        setScriptLoaded(false);
      };
      document.body.appendChild(script);
    };

    if (isOpen) {
      loadScript();
    }
  }, [isOpen]);

  // Create payment order
  const createPaymentOrder = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/payments/create-order/${contractId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Payment order creation failed');
    }
  };

  // Verify payment on backend
  const verifyPayment = async (paymentDetails) => {
    try {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentDetails)
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (err) {
      throw new Error(err.message || 'Payment verification failed');
    }
  };

  // Handle payment process
  const handlePayment = async () => {
    if (!scriptLoaded) {
      setError('Payment gateway not loaded yet. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment order
      const orderData = await createPaymentOrder();

      // Razorpay options
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Zuper Vehicle Rentals',
        description: 'Vehicle Rental Payment',
        order_id: orderData.order.id,
        
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verificationResult = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verificationResult.success) {
              setLoading(false);
              onSuccess && onSuccess(verificationResult.payment);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setError(err.message);
            setLoading(false);
            onFailure && onFailure(err);
          }
        },
        
        prefill: {
          name: bookingDetails?.customerName || localStorage.getItem('customerName') || '',
          email: bookingDetails?.customerEmail || localStorage.getItem('customerEmail') || '',
          contact: bookingDetails?.customerPhone || localStorage.getItem('customerPhone') || ''
        },
        
        theme: {
          color: '#3399cc'
        },
        
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment cancelled by user');
            onFailure && onFailure(new Error('Payment cancelled'));
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      setError(err.message);
      setLoading(false);
      onFailure && onFailure(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card bg-white max-w-md w-full">
        {/* Header */}
        <div className="bg-purple-400 border-b-3 border-black p-6">
          <div className="flex justify-between items-center">
            <h2 className="brutal-heading text-2xl">💳 PAYMENT</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-3xl font-black hover:text-red-600 transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          <div className="brutal-card-sm bg-green-100 border-green-600 p-4">
            <p className="font-black uppercase text-xs mb-2">✅ CONTRACT SIGNED!</p>
            <p className="text-sm font-bold">
              Complete payment to confirm your booking
            </p>
          </div>

          {/* Booking Details */}
          {bookingDetails && (
            <div className="brutal-card-sm bg-blue-100 border-blue-600 p-4">
              <p className="font-black uppercase text-xs mb-3">📋 BOOKING DETAILS</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-bold">Vehicle:</span>
                  <span className="font-black">{bookingDetails.vehicleName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Duration:</span>
                  <span className="font-black">{bookingDetails.numberOfDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Daily Rate:</span>
                  <span className="font-black">₹{bookingDetails.dailyRate}</span>
                </div>
                <div className="flex justify-between border-t-2 border-black pt-2 mt-2">
                  <span className="font-black text-lg">TOTAL:</span>
                  <span className="font-black text-xl text-purple-600">₹{bookingDetails.totalCost}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="brutal-card-sm bg-yellow-100 border-yellow-600 p-4">
            <p className="font-black uppercase text-xs mb-2">ℹ️ PAYMENT INFO</p>
            <ul className="text-xs font-bold space-y-1">
              <li>✓ Secure payment via Razorpay</li>
              <li>✓ All major cards accepted</li>
              <li>✓ Booking confirmed instantly</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="brutal-card-sm bg-red-100 border-red-600 p-4">
              <p className="font-black uppercase text-xs mb-1">❌ ERROR</p>
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Payment Button */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading || !scriptLoaded}
              className="w-full brutal-btn bg-green-300 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
            >
              {loading ? '⏳ PROCESSING...' : !scriptLoaded ? '⏳ LOADING...' : `💳 PAY ₹${bookingDetails?.totalCost || 0}`}
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full brutal-btn bg-gray-300 hover:bg-gray-400 disabled:opacity-50 py-2 text-sm"
            >
              CANCEL
            </button>
          </div>

          <p className="text-xs font-bold text-center text-gray-600 mt-3">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
