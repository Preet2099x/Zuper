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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6">Book Vehicle</h2>

        {/* Vehicle Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            {vehicle.year} {vehicle.company} {vehicle.model}
          </h3>
          <p className="text-sm text-gray-600 mb-1">📍 {vehicle.location}</p>
          <p className="text-sm font-semibold text-blue-600">₹{vehicle.dailyRate}/day</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleDateChange}
              min={today}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleDateChange}
              min={formData.startDate || today}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              name="customerNote"
              value={formData.customerNote}
              onChange={handleInputChange}
              placeholder="Add any special requests or questions..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Cost Summary */}
          {totalCost > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Days:</span>
                <span className="font-semibold text-gray-900">
                  {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Daily Rate:</span>
                <span className="font-semibold text-gray-900">₹{vehicle.dailyRate}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total Cost:</span>
                <span className="font-bold text-blue-600 text-lg">₹{totalCost}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {loading ? 'Booking...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
