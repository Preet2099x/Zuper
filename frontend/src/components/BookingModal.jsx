import React, { useState } from 'react';

const BookingModal = ({ vehicle, onClose, onBook }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    customerNote: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Calculate total cost if both dates are set
    if (name === 'startDate' || name === 'endDate') {
      const newFormData = { ...formData, [name]: value };
      if (newFormData.startDate && newFormData.endDate) {
        const start = new Date(newFormData.startDate);
        const end = new Date(newFormData.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setTotalCost(days * vehicle.dailyRate);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate dates
      if (!formData.startDate || !formData.endDate) {
        setError('Please select both start and end dates');
        setLoading(false);
        return;
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start >= end) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }

      if (start < new Date()) {
        setError('Start date cannot be in the past');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: vehicle._id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          customerNote: formData.customerNote
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create booking');
      }

      const data = await response.json();
      onBook(data.booking);
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="brutal-card bg-white w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-3xl font-black hover:text-red-600 transition-colors z-10"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="bg-cyan-300 border-b-3 border-black p-6">
          <h2 className="brutal-heading text-2xl">📅 BOOK VEHICLE</h2>
        </div>

        <div className="p-6">
          {/* Vehicle Summary */}
          <div className="brutal-card-sm bg-purple-200 p-4 mb-6">
            <h3 className="font-black text-sm mb-2 uppercase">
              {vehicle.year} {vehicle.company} {vehicle.model}
            </h3>
            <p className="text-xs font-bold mb-1">📍 {vehicle.location}</p>
            <p className="text-sm font-black text-purple-600">₹{vehicle.dailyRate}/day</p>
          </div>

          {error && (
            <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-4">
              <p className="text-xs font-black uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2">
                🟢 CHECK-IN DATE *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleDateChange}
                min={today}
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2">
                🔴 CHECK-OUT DATE *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleDateChange}
                min={formData.startDate || today}
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-2">
                💬 MESSAGE (OPTIONAL)
              </label>
              <textarea
                name="customerNote"
                value={formData.customerNote}
                onChange={handleInputChange}
                placeholder="Add any special requests..."
                rows={3}
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-cyan-400"
              />
            </div>

            {/* Cost Summary */}
            {totalCost > 0 && (
              <div className="brutal-card-sm bg-green-200 border-green-600 p-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold">Days:</span>
                  <span className="font-black">
                    {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-bold">Daily Rate:</span>
                  <span className="font-black">₹{vehicle.dailyRate}</span>
                </div>
                <div className="border-t-2 border-black pt-2 flex justify-between">
                  <span className="font-black uppercase">Total Cost:</span>
                  <span className="font-black text-lg text-green-600">₹{totalCost}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 brutal-btn bg-gray-300 hover:bg-gray-400 py-3 text-sm"
                onClick={onClose}
              >
                ❌ CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 brutal-btn bg-cyan-300 hover:bg-cyan-400 disabled:opacity-50 py-3 text-sm"
              >
                {loading ? '⏳ BOOKING...' : '✅ SEND REQUEST'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;