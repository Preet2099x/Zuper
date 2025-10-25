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
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📅 My Bookings</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
            Search More Vehicles
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ {successMessage}
          </div>
        )}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No bookings yet</p>
            <p className="text-gray-500">Start by searching for vehicles to book</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Vehicle Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {booking.vehicle?.images && booking.vehicle.images.length > 0 ? (
                    <img
                      src={booking.vehicle.images[0]}
                      alt={`${booking.vehicle.brand} ${booking.vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-4xl mb-2">🚗</div>
                      <p>No image available</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Vehicle Title and Status */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {booking.vehicle?.year} {booking.vehicle?.brand} {booking.vehicle?.model}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Vehicle Details */}
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">License:</span> {booking.vehicle?.registrationNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    <span className="font-medium">Provider:</span> {booking.provider?.firstName} {booking.provider?.lastName}
                  </p>

                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Booking Period:</span>
                      <span className="font-medium text-gray-900">
                        {booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Start:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">End:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(booking.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                      <span className="font-semibold text-gray-900">Total Cost:</span>
                      <span className="text-lg font-bold text-blue-600">₹{booking.totalCost}</span>
                    </div>
                  </div>

                  {/* Customer Note */}
                  {booking.customerNote && (
                    <div className="bg-blue-50 rounded p-3 mb-4 border-l-4 border-blue-400 text-sm">
                      <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Your Note</p>
                      <p className="text-gray-700">{booking.customerNote}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                        Cancel Request
                      </button>
                    )}
                    {booking.status !== 'pending' && (
                      <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                        Contact Provider
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{bookings.reduce((sum, b) => sum + b.totalCost, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerMyVehicles;