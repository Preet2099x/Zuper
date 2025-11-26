import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../../components/PaymentComponent';

const CustomerMyVehicles = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [signingContract, setSigningContract] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    fetchCustomerBookings();
  }, []);

  const fetchCustomerBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/customer/login';
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/bookings/customer/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Failed to load your bookings');
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    setCancelling(bookingId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/customer/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }

      // Remove cancelled booking from the list or update its status
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      setSuccessMessage('Booking cancelled successfully');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Cancel booking error:', err);
      alert('Failed to cancel booking: ' + err.message);
    } finally {
      setCancelling(null);
    }
  };

  const handleContactProvider = (providerId) => {
    console.log('handleContactProvider called with:', providerId);
    if (!providerId) {
      console.error('handleContactProvider - No provider ID provided!');
      alert('Provider information not available');
      return;
    }
    console.log('handleContactProvider - Navigating to messages with providerId:', providerId);
    // Navigate to messages page with provider ID to open/create conversation
    navigate('/dashboard/customer/messages', { state: { providerId } });
  };

  const handleViewContract = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/contracts/${booking.contract}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }

      const contractData = await response.json();
      setSelectedContract({ ...contractData, bookingId: booking._id });
      setShowContractModal(true);
    } catch (err) {
      console.error('Fetch contract error:', err);
      alert('Failed to load contract: ' + err.message);
    }
  };

  const handleSignContract = async () => {
    if (!selectedContract) return;

    setSigningContract(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/contracts/${selectedContract._id}/sign`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to sign contract');
      }

      const data = await response.json();
      
      // Check if payment is required
      if (data.nextStep === 'payment_required') {
        // Close contract modal and open payment modal
        setShowContractModal(false);
        
        // Prepare payment details
        const booking = bookings.find(b => b._id === selectedContract.bookingId);
        setPaymentDetails({
          contractId: selectedContract._id,
          bookingId: selectedContract.bookingId,
          vehicleName: `${booking?.vehicle?.year} ${booking?.vehicle?.brand} ${booking?.vehicle?.model}`,
          numberOfDays: booking?.numberOfDays || 0,
          dailyRate: booking?.dailyRate || 0,
          totalCost: booking?.totalCost || 0,
          customerName: booking?.customer?.name || '',
          customerEmail: booking?.customer?.email || '',
          customerPhone: booking?.customer?.phone || ''
        });
        
        setShowPaymentModal(true);
        setSuccessMessage('✍️ Contract signed! Please complete payment to confirm booking.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        // Old flow (if payment is disabled)
        setBookings(prev =>
          prev.map(b => (b._id === selectedContract.bookingId ? { ...b, status: 'CONFIRMED' } : b))
        );
        setShowContractModal(false);
        setSelectedContract(null);
        setSuccessMessage('🎉 Contract signed! Vehicle confirmed and ready for pickup!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Sign contract error:', err);
      alert('Failed to sign contract: ' + err.message);
    } finally {
      setSigningContract(false);
    }
  };

  const handleRejectContract = async () => {
    if (!selectedContract) return;
    
    if (!window.confirm('Are you sure you want to reject this contract? This will cancel your booking.')) {
      return;
    }

    setSigningContract(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/contracts/${selectedContract._id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reject contract');
      }

      // Remove cancelled booking
      setBookings(prev => prev.filter(b => b._id !== selectedContract.bookingId));
      
      setShowContractModal(false);
      setSelectedContract(null);
      setSuccessMessage('Contract rejected. Booking cancelled.');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Reject contract error:', err);
      alert('Failed to reject contract: ' + err.message);
    } finally {
      setSigningContract(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (payment) => {
    setShowPaymentModal(false);
    setPaymentDetails(null);
    setSelectedContract(null);
    
    // Update booking status to CONFIRMED
    setBookings(prev =>
      prev.map(b => 
        b._id === payment.booking?._id 
          ? { ...b, status: 'CONFIRMED' } 
          : b
      )
    );
    
    setSuccessMessage('🎉 Payment successful! Booking confirmed. Vehicle ready for pickup!');
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Refresh bookings to get latest data
    fetchCustomerBookings();
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setError('Payment failed: ' + error.message + '. Please try again.');
    setTimeout(() => setError(''), 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return 'bg-yellow-300 border-yellow-600';
      case 'PROVIDER_ACCEPTED':
        return 'bg-blue-300 border-blue-600';
      case 'PAYMENT_PENDING':
        return 'bg-orange-300 border-orange-600';
      case 'CONFIRMED':
        return 'bg-green-300 border-green-600';
      case 'CANCELLED':
        return 'bg-gray-300 border-gray-600';
      default:
        return 'bg-gray-300 border-gray-600';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'PENDING_PROVIDER': return '⏰';
      case 'PROVIDER_ACCEPTED': return '📋';
      case 'PAYMENT_PENDING': return '💳';
      case 'CONFIRMED': return '✅';
      case 'CANCELLED': return '🚫';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="brutal-card bg-white p-12 text-center">
        <div className="inline-block animate-spin text-6xl mb-3">⏳</div>
        <p className="font-black uppercase text-sm">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="brutal-heading text-3xl">MY BOOKINGS 🚗</h1>
        <button className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-4 text-xs">
          🔍 SEARCH MORE
        </button>
      </div>

      {error && (
        <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-5 flex items-start gap-2">
          <span className="text-xl">❌</span>
          <p className="font-black uppercase text-xs">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="brutal-card-sm bg-green-300 border-green-600 p-3 mb-5 flex items-start gap-2">
          <span className="text-xl">✅</span>
          <p className="font-black uppercase text-xs">{successMessage}</p>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="brutal-card bg-white p-12 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="brutal-heading text-xl mb-2">NO BOOKINGS YET</h3>
          <p className="font-bold text-sm">Start by searching for vehicles to book!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="brutal-card bg-white p-4">
              {/* Vehicle Image */}
              <div className="h-40 bg-gray-200 border-3 border-black mb-3 flex items-center justify-center overflow-hidden">
                {booking.vehicle?.images && booking.vehicle.images.length > 0 ? (
                  <img
                    src={booking.vehicle.images[0]}
                    alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-2">🚗</div>
                    <p className="text-xs font-black uppercase">No image</p>
                  </div>
                )}
              </div>

              {/* Vehicle Title and Status */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="brutal-heading text-base">
                  {booking.vehicle?.year} {booking.vehicle?.brand} {booking.vehicle?.model}
                </h3>
              </div>

              <div className={`brutal-badge mb-3 ${getStatusColor(booking.status)}`}>
                {getStatusEmoji(booking.status)} {booking.status.toUpperCase()}
              </div>

              {/* Vehicle Details */}
              <p className="font-bold text-xs mb-2">
                🔑 {booking.vehicle?.registrationNumber || 'N/A'}
              </p>
              <p className="text-xs font-bold mb-3">
                🏢 {booking.provider?.firstName} {booking.provider?.lastName}
              </p>

              {/* Booking Details */}
              <div className="bg-gray-100 border-2 border-black p-3 mb-3 text-xs">
                <div className="flex justify-between mb-2">
                  <span className="font-bold">📅 Period:</span>
                  <span className="font-black">
                    {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">🟢 Start:</span>
                  <span className="font-black">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-bold">🔴 End:</span>
                  <span className="font-black">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-black pt-2 mt-2">
                  <span className="font-black">💰 TOTAL:</span>
                  <span className="text-lg font-black">₹{booking.totalCost}</span>
                </div>
              </div>

              {/* Customer Note */}
              {booking.customerNote && (
                <div className="bg-yellow-100 border-2 border-black p-3 mb-3 text-xs">
                  <p className="font-black uppercase mb-1">📝 Your Note</p>
                  <p className="font-bold">{booking.customerNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {booking.status === 'PROVIDER_ACCEPTED' && booking.contract && (
                  <button 
                    onClick={() => handleViewContract(booking)}
                    className="flex-1 brutal-btn bg-green-300 hover:bg-green-400 py-2 text-xs font-black"
                  >
                    ✍️ SIGN CONTRACT
                  </button>
                )}
                {booking.status === 'PAYMENT_PENDING' && booking.contract && (
                  <button 
                    onClick={() => {
                      setPaymentDetails({
                        contractId: booking.contract,
                        bookingId: booking._id,
                        vehicleName: `${booking.vehicle?.year} ${booking.vehicle?.brand} ${booking.vehicle?.model}`,
                        numberOfDays: booking.numberOfDays,
                        dailyRate: booking.dailyRate,
                        totalCost: booking.totalCost,
                        customerName: booking.customer?.name || '',
                        customerEmail: booking.customer?.email || '',
                        customerPhone: booking.customer?.phone || ''
                      });
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 brutal-btn bg-orange-300 hover:bg-orange-400 py-2 text-xs font-black"
                  >
                    💳 COMPLETE PAYMENT
                  </button>
                )}
                {booking.status === 'PENDING_PROVIDER' && (
                  <>
                    <button className="flex-1 brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 text-xs">
                      👁️ VIEW
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancelling === booking._id}
                      className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 py-2 text-xs disabled:opacity-50"
                    >
                      {cancelling === booking._id ? '⏳' : '❌ CANCEL'}
                    </button>
                  </>
                )}
                {booking.status === 'PROVIDER_ACCEPTED' && booking.contract && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancelling === booking._id}
                    className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 py-2 text-xs disabled:opacity-50"
                  >
                    {cancelling === booking._id ? '⏳' : '❌ CANCEL'}
                  </button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <>
                    <button className="flex-1 brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 text-xs">
                      👁️ VIEW
                    </button>
                    <button 
                      onClick={() => {
                        console.log('Contact button clicked - Full Booking object:', JSON.stringify(booking, null, 2));
                        console.log('Contact button clicked - booking.provider:', booking.provider);
                        console.log('Contact button clicked - booking.vehicle:', booking.vehicle);
                        console.log('Contact button clicked - booking.vehicle?.provider:', booking.vehicle?.provider);
                        // Try both ways to get provider ID
                        const providerId = booking.vehicle?.provider?._id || booking.vehicle?.provider || booking.provider?._id || booking.provider;
                        console.log('Contact button clicked - Final Provider ID:', providerId);
                        handleContactProvider(providerId);
                      }}
                      className="flex-1 brutal-btn bg-purple-300 hover:bg-purple-400 py-2 text-xs"
                    >
                      💬 CONTACT
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {bookings.length > 0 && (
        <div className="brutal-card bg-white p-6 mt-5">
          <h2 className="brutal-heading text-xl mb-4">BOOKING SUMMARY 📊</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center brutal-card-sm bg-cyan-200 border-cyan-600 p-3">
              <p className="text-3xl font-black">{bookings.length}</p>
              <p className="text-xs font-black uppercase mt-1">Total</p>
            </div>
            <div className="text-center brutal-card-sm bg-green-200 border-green-600 p-3">
              <p className="text-3xl font-black">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </p>
              <p className="text-xs font-black uppercase mt-1">Confirmed</p>
            </div>
            <div className="text-center brutal-card-sm bg-yellow-200 border-yellow-600 p-3">
              <p className="text-3xl font-black">
                {bookings.filter(b => b.status === 'PENDING_PROVIDER' || b.status === 'PROVIDER_ACCEPTED' || b.status === 'PAYMENT_PENDING').length}
              </p>
              <p className="text-xs font-black uppercase mt-1">Pending</p>
            </div>
            <div className="text-center brutal-card-sm bg-purple-200 border-purple-600 p-3">
              <p className="text-3xl font-black">
                ₹{bookings.reduce((sum, b) => sum + b.totalCost, 0).toLocaleString()}
              </p>
              <p className="text-xs font-black uppercase mt-1">Total Spent</p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="brutal-card bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-400 border-b-3 border-black p-6 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <h2 className="brutal-heading text-2xl">📋 RENTAL CONTRACT</h2>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="text-3xl font-black hover:text-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contract Status */}
              <div className="brutal-card-sm bg-blue-100 border-blue-600 p-4">
                <p className="font-black uppercase text-xs mb-2">📊 CONTRACT STATUS</p>
                <div className="flex items-center gap-3">
                  <span className="brutal-badge bg-green-300 text-xs">
                    ✅ PROVIDER SIGNED
                  </span>
                  <span className="brutal-badge bg-yellow-300 text-xs">
                    ⏳ AWAITING YOUR SIGNATURE
                  </span>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="brutal-card-sm bg-white p-5">
                <h3 className="brutal-heading text-lg mb-3">🚗 VEHICLE DETAILS</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Vehicle</p>
                    <p className="font-bold">{selectedContract.vehicle?.company} {selectedContract.vehicle?.model}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Year</p>
                    <p className="font-bold">{selectedContract.vehicle?.year}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">License Plate</p>
                    <p className="font-bold">{selectedContract.vehicle?.licensePlate}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Daily Rate</p>
                    <p className="font-bold text-purple-600">₹{selectedContract.vehicle?.dailyRate}</p>
                  </div>
                </div>
              </div>

              {/* Rental Period */}
              <div className="brutal-card-sm bg-white p-5">
                <h3 className="brutal-heading text-lg mb-3">📅 RENTAL PERIOD</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Start Date</p>
                    <p className="font-bold">{new Date(selectedContract.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">End Date</p>
                    <p className="font-bold">{new Date(selectedContract.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Provider Details */}
              <div className="brutal-card-sm bg-white p-5">
                <h3 className="brutal-heading text-lg mb-3">👤 PROVIDER INFORMATION</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Provider</p>
                    <p className="font-bold">{selectedContract.provider?.businessName || selectedContract.provider?.name}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Email</p>
                    <p className="font-bold">{selectedContract.provider?.email}</p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-gray-600">Provider Signed At</p>
                    <p className="font-bold text-green-600">
                      ✅ {new Date(selectedContract.providerSignedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="brutal-card-sm bg-yellow-50 border-yellow-600 p-5">
                <h3 className="brutal-heading text-lg mb-3">📜 TERMS & CONDITIONS</h3>
                <div className="text-sm font-bold space-y-2 bg-white p-4 border-2 border-black">
                  <p>{selectedContract.terms}</p>
                  <ul className="list-disc list-inside space-y-1 mt-3 text-xs">
                    <li>You agree to return the vehicle in the same condition as received</li>
                    <li>Any damage to the vehicle will be your responsibility</li>
                    <li>Late returns may incur additional charges</li>
                    <li>Vehicle must not be used for illegal activities</li>
                    <li>You must have a valid driver's license</li>
                    <li>Insurance coverage is included in the rental rate</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="brutal-card-sm bg-gray-100 border-gray-600 p-5">
                <p className="font-black uppercase text-xs mb-3 text-center">
                  ⚠️ By signing, you agree to all terms and conditions above
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRejectContract}
                    disabled={signingContract}
                    className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 disabled:opacity-50 py-3 text-sm"
                  >
                    ❌ REJECT CONTRACT
                  </button>
                  <button
                    onClick={handleSignContract}
                    disabled={signingContract}
                    className="flex-1 brutal-btn bg-green-300 hover:bg-green-400 disabled:opacity-50 py-3 text-sm"
                  >
                    {signingContract ? '⏳ SIGNING...' : '✍️ SIGN & CONFIRM'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentDetails && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentDetails(null);
          }}
          contractId={paymentDetails.contractId}
          bookingDetails={paymentDetails}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

export default CustomerMyVehicles;