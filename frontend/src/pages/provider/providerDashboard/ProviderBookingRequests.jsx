import React, { useState, useEffect } from 'react';

const ProviderBookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING_PROVIDER');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [responseNote, setResponseNote] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('providerToken');
      if (!token) {
        window.location.href = '/provider/login';
        return;
      }

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/bookings/provider/messages`, {
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
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/provider/${selectedBooking._id}/approve`,
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
      const token = localStorage.getItem('providerToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/api/bookings/provider/${selectedBooking._id}/reject`,
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
      case 'PENDING_PROVIDER':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROVIDER_ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_PROVIDER':
        return '⏳';
      case 'PROVIDER_ACCEPTED':
        return '📋';
      case 'CONFIRMED':
        return '✅';
      case 'CANCELLED':
        return '🚫';
      default:
        return '⚪';
    }
  };

  const filteredBookings = bookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="brutal-card p-8 bg-yellow-200 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="font-black uppercase">LOADING BOOKING REQUESTS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="brutal-heading text-3xl mb-8">📥 BOOKING REQUESTS</h1>

        {error && (
          <div className="brutal-card mb-6 p-4 bg-red-200">
            <p className="font-black text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="brutal-card p-5 mb-6 bg-purple-100">
          <div className="flex flex-wrap gap-4">
            {['PENDING_PROVIDER', 'PROVIDER_ACCEPTED', 'CONFIRMED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`brutal-btn text-[10px] px-5 py-3 ${
                  filterStatus === status
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                {status.replace('_', ' ')} ({bookings.filter(b => b.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Booking Requests List */}
        {filteredBookings.length === 0 ? (
          <div className="brutal-card p-12 text-center bg-gray-100">
            <p className="font-black text-lg uppercase">🚫 NO {filterStatus} BOOKING REQUESTS</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="brutal-card p-6 bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{getStatusIcon(booking.status)}</span>
                      <h3 className="font-black text-sm uppercase">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </h3>
                      <span className={`brutal-badge ${
                        booking.status === 'PENDING_PROVIDER' ? 'bg-yellow-200' :
                        booking.status === 'PROVIDER_ACCEPTED' ? 'bg-blue-200' :
                        booking.status === 'CONFIRMED' ? 'bg-green-200' :
                        'bg-gray-200'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] font-black uppercase">🚗 VEHICLE</p>
                        <p className="font-bold">
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase">📅 START</p>
                        <p className="font-bold">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase">📆 END</p>
                        <p className="font-bold">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase">💰 TOTAL</p>
                        <p className="font-black text-sm">₹{booking.totalCost}</p>
                      </div>
                    </div>

                    {booking.customerNote && (
                      <div className="mt-3 brutal-card-sm p-3 bg-blue-100">
                        <p className="text-[10px] font-black uppercase">📝 CUSTOMER NOTE</p>
                        <p className="text-xs font-bold mt-1">{booking.customerNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {booking.status === 'PENDING_PROVIDER' ? (
                      <button
                        onClick={() => openDetailModal(booking)}
                        className="brutal-btn bg-cyan-400 text-xs px-5 py-3"
                      >
                        🔎 REVIEW
                      </button>
                    ) : (
                      <button
                        onClick={() => openDetailModal(booking)}
                        className="brutal-btn bg-purple-300 text-xs px-5 py-3"
                      >
                        📝 DETAILS
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/30 backdrop-blur-sm border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-purple-400 border-b-3 border-black p-6 flex justify-between items-center">
                <h2 className="brutal-heading text-2xl">📝 BOOKING DETAILS</h2>
                <button
                  onClick={closeDetailModal}
                  className="brutal-btn bg-red-300 text-xl px-4 py-2"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Customer Info */}
                <div>
                  <h3 className="brutal-heading text-lg mb-4">👤 CUSTOMER INFO</h3>
                  <div className="brutal-card-sm p-5 bg-blue-100 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-black uppercase">NAME</p>
                      <p className="font-bold">
                        {selectedBooking.customer?.firstName} {selectedBooking.customer?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">EMAIL</p>
                      <p className="font-bold">{selectedBooking.customer?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">PHONE</p>
                      <p className="font-bold">{selectedBooking.customer?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">STATUS</p>
                      <span className={`brutal-badge ${
                        selectedBooking.status === 'PENDING_PROVIDER' ? 'bg-yellow-200' :
                        selectedBooking.status === 'PROVIDER_ACCEPTED' ? 'bg-blue-200' :
                        selectedBooking.status === 'CONFIRMED' ? 'bg-green-200' :
                        'bg-gray-200'
                      }`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div>
                  <h3 className="brutal-heading text-lg mb-4">🚗 VEHICLE DETAILS</h3>
                  <div className="brutal-card-sm p-5 bg-green-100 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-black uppercase">VEHICLE</p>
                      <p className="font-bold">
                        {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">YEAR</p>
                      <p className="font-bold">{selectedBooking.vehicle?.year}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">REGISTRATION</p>
                      <p className="font-bold">{selectedBooking.vehicle?.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">DAILY RATE</p>
                      <p className="font-black text-sm">₹{selectedBooking.dailyRate}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="brutal-heading text-lg mb-4">📅 BOOKING DETAILS</h3>
                  <div className="brutal-card-sm p-5 bg-yellow-100 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] font-black uppercase">START DATE</p>
                      <p className="font-bold">
                        {new Date(selectedBooking.startDate).toLocaleDateString()} {new Date(selectedBooking.startDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">END DATE</p>
                      <p className="font-bold">
                        {new Date(selectedBooking.endDate).toLocaleDateString()} {new Date(selectedBooking.endDate).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">DAYS</p>
                      <p className="font-bold">{selectedBooking.numberOfDays}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">TOTAL COST</p>
                      <p className="font-black text-lg">₹{selectedBooking.totalCost}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedBooking.customerNote && (
                  <div>
                    <h3 className="brutal-heading text-lg mb-4">📝 CUSTOMER NOTE</h3>
                    <div className="brutal-card-sm p-5 bg-pink-100">
                      <p className="text-xs font-bold">{selectedBooking.customerNote}</p>
                    </div>
                  </div>
                )}

                {/* Provider Response - Only show for pending bookings */}
                {selectedBooking.status === 'PENDING_PROVIDER' && (
                  <div>
                    <h3 className="brutal-heading text-lg mb-4">✍️ YOUR RESPONSE</h3>
                    <textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      placeholder="Add any notes for the customer (optional)..."
                      className="w-full px-5 py-4 border-3 border-black uppercase text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      rows="4"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-5">
                  {selectedBooking.status === 'PENDING_PROVIDER' ? (
                    <>
                      <button
                        onClick={handleApproveBooking}
                        disabled={responding}
                        className="flex-1 brutal-btn bg-green-300 text-xs px-5 py-3"
                      >
                        {responding ? '⏳ PROCESSING...' : '✅ APPROVE BOOKING'}
                      </button>
                      <button
                        onClick={handleRejectBooking}
                        disabled={responding}
                        className="flex-1 brutal-btn bg-red-300 text-xs px-5 py-3"
                      >
                        {responding ? '⏳ PROCESSING...' : '❌ REJECT BOOKING'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={closeDetailModal}
                      className="w-full brutal-btn bg-gray-300 text-xs px-5 py-3"
                    >
                      CLOSE
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

export default ProviderBookingRequests;
