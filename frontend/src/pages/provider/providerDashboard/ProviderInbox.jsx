import React, { useState, useEffect } from 'react';

const ProviderInbox = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseNote, setResponseNote] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/provider/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings/provider/inbox', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking requests');
      }

      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Failed to load booking requests');
      setLoading(false);
    }
  };

  const handleApproveBooking = async () => {
    if (!selectedBooking) return;

    setResponding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/bookings/provider/${selectedBooking._id}/approve`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ providerNote: responseNote })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to approve booking');
      }

      const data = await response.json();
      setBookings(prev =>
        prev.map(b => (b._id === selectedBooking._id ? data.booking : b))
      );
      setShowDetailModal(false);
      setSelectedBooking(null);
      setResponseNote('');
      alert('Booking approved successfully!');
    } catch (err) {
      console.error('Approve booking error:', err);
      alert('Failed to approve booking: ' + err.message);
    } finally {
      setResponding(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking) return;

    setResponding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/bookings/provider/${selectedBooking._id}/reject`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ providerNote: responseNote })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reject booking');
      }

      const data = await response.json();
      setBookings(prev =>
        prev.map(b => (b._id === selectedBooking._id ? data.booking : b))
      );
      setShowDetailModal(false);
      setSelectedBooking(null);
      setResponseNote('');
      alert('Booking rejected');
    } catch (err) {
      console.error('Reject booking error:', err);
      alert('Failed to reject booking: ' + err.message);
    } finally {
      setResponding(false);
    }
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
    setResponseNote('');
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '⚪';
    }
  };

  const filteredBookings = bookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📥 Booking Requests</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['pending', 'approved', 'rejected', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 capitalize ${
                    filterStatus === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status} ({bookings.filter(b => b.status === status).length})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Booking Requests List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No {filterStatus} booking requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getStatusIcon(booking.status)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Vehicle</p>
                        <p className="font-medium text-gray-900">
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Cost</p>
                        <p className="font-medium text-blue-600">₹{booking.totalCost}</p>
                      </div>
                    </div>

                    {booking.customerNote && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border-l-4 border-blue-400">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Customer Note</p>
                        <p className="text-gray-700 text-sm">{booking.customerNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {booking.status === 'pending' ? (
                      <button
                        onClick={() => openDetailModal(booking)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => openDetailModal(booking)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Booking Details</h2>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedBooking.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{selectedBooking.customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year</p>
                      <p className="font-medium text-gray-900">{selectedBooking.vehicle?.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registration</p>
                      <p className="font-medium text-gray-900">{selectedBooking.vehicle?.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Daily Rate</p>
                      <p className="font-medium text-blue-600">₹{selectedBooking.dailyRate}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.startDate).toLocaleDateString()} {new Date(selectedBooking.startDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedBooking.endDate).toLocaleDateString()} {new Date(selectedBooking.endDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Days</p>
                      <p className="font-medium text-gray-900">{selectedBooking.numberOfDays}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="font-medium text-lg text-blue-600">₹{selectedBooking.totalCost}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.customerNote && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Note</h3>
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-700">{selectedBooking.customerNote}</p>
                    </div>
                  </div>
                )}

                {/* Provider Response - Only show for pending bookings */}
                {selectedBooking.status === 'pending' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Response</h3>
                    <textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="Add any notes for the customer (optional)..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  {selectedBooking.status === 'pending' ? (
                    <>
                      <button
                        onClick={handleApproveBooking}
                        disabled={responding}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded transition-colors duration-200"
                      >
                        {responding ? 'Processing...' : '✅ Approve Booking'}
                      </button>
                      <button
                        onClick={handleRejectBooking}
                        disabled={responding}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded transition-colors duration-200"
                      >
                        {responding ? 'Processing...' : '❌ Reject Booking'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closeDetailModal}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded transition-colors duration-200"
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderInbox;