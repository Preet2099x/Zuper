import React, { useState, useEffect } from 'react';

const CustomerMyVehicles = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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

      const response = await fetch('http://localhost:5000/api/bookings/customer/my-bookings', {
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
        `http://localhost:5000/api/bookings/customer/${bookingId}/cancel`,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-300 border-yellow-600';
      case 'approved':
        return 'bg-green-300 border-green-600';
      case 'rejected':
        return 'bg-red-300 border-red-600';
      case 'cancelled':
        return 'bg-gray-300 border-gray-600';
      default:
        return 'bg-gray-300 border-gray-600';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending': return '⏰';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'cancelled': return '🚫';
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
        <div className="brutal-card bg-white p-12 text-center rotate-1">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="brutal-heading text-xl mb-2">NO BOOKINGS YET</h3>
          <p className="font-bold text-sm">Start by searching for vehicles to book!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="brutal-card bg-white p-4 hover:rotate-1 transition-transform">
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
                <button className="flex-1 brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 text-xs">
                  👁️ VIEW
                </button>
                {booking.status === 'pending' && (
                  <button 
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancelling === booking._id}
                    className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 py-2 text-xs disabled:opacity-50"
                  >
                    {cancelling === booking._id ? '⏳' : '❌ CANCEL'}
                  </button>
                )}
                {booking.status !== 'pending' && (
                  <button className="flex-1 brutal-btn bg-purple-300 hover:bg-purple-400 py-2 text-xs">
                    💬 CONTACT
                  </button>
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
                {bookings.filter(b => b.status === 'approved').length}
              </p>
              <p className="text-xs font-black uppercase mt-1">Approved</p>
            </div>
            <div className="text-center brutal-card-sm bg-yellow-200 border-yellow-600 p-3">
              <p className="text-3xl font-black">
                {bookings.filter(b => b.status === 'pending').length}
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
    </div>
  );
};

export default CustomerMyVehicles;