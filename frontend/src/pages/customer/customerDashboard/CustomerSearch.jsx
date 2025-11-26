import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleDetailsModal from '../../../components/VehicleDetailsModal';
import BookingModal from '../../../components/BookingModal';

const CustomerSearch = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    vehicleType: '',
    minRate: '',
    maxRate: '',
    company: ''
  });
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [waitingBookings, setWaitingBookings] = useState([]);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleBookClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleBookingSuccess = (booking) => {
    setWaitingBookings(prev => [...prev, booking]);
    setBookingSuccess('Booking request sent! You will be notified once the provider accepts.');
    setTimeout(() => setBookingSuccess(''), 5000);
  };

  const handleContactProvider = (providerId) => {
    if (!providerId) {
      alert('Provider information not available for this vehicle');
      return;
    }
    console.log('Navigating to messages with provider ID:', providerId);
    navigate('/dashboard/customer/messages', { state: { providerId } });
  };

  // Fetch all available vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.vehicleType) queryParams.append('type', filters.vehicleType);
      if (filters.company) queryParams.append('company', filters.company);
      if (filters.minRate) queryParams.append('minRate', filters.minRate);
      if (filters.maxRate) queryParams.append('maxRate', filters.maxRate);

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // Parse price range if selected
    let filters = { ...searchFilters };
    
    if (searchFilters.priceRange) {
      const [min, max] = searchFilters.priceRange.split('-');
      filters.minRate = min;
      if (max && max !== '+') {
        filters.maxRate = max;
      }
    }
    
    fetchVehicles(filters);
  };

  const handleClearFilters = () => {
    setSearchFilters({
      location: '',
      vehicleType: '',
      minRate: '',
      maxRate: '',
      company: ''
    });
    fetchVehicles();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="brutal-heading text-3xl mb-5">SEARCH VEHICLES 🔍</h1>

      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-5 brutal-card-sm bg-green-300 border-green-600 p-3 flex items-start gap-2">
          <span className="text-xl">✅</span>
          <p className="font-black uppercase text-xs">{bookingSuccess}</p>
        </div>
      )}

      {/* Search Filters */}
      <div className="brutal-card bg-white p-5 mb-6">
          <h2 className="brutal-heading text-xl mb-4">SEARCH FILTERS 🎯</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-black uppercase text-xs mb-2">📍 Location</label>
              <input
                type="text"
                name="location"
                value={searchFilters.location}
                onChange={handleFilterChange}
                placeholder="Delhi, Mumbai..."
                className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-xs mb-2">🚗 Vehicle Type</label>
              <select
                name="vehicleType"
                value={searchFilters.vehicleType}
                onChange={handleFilterChange}
                className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm uppercase"
              >
                <option value="">All Types</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-xs mb-2">💰 Price Range</label>
              <select
                name="priceRange"
                value={searchFilters.priceRange}
                onChange={handleFilterChange}
                className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm"
              >
                <option value="">Any Price</option>
                <option value="0-2000">₹0 - ₹2,000/day</option>
                <option value="2000-3000">₹2,000 - ₹3,000/day</option>
                <option value="3000-5000">₹3,000 - ₹5,000/day</option>
                <option value="5000+">₹5,000+/day</option>
              </select>
            </div>

            <div>
              <label className="block font-black uppercase text-xs mb-2">🏢 Company</label>
              <input
                type="text"
                name="company"
                value={searchFilters.company}
                onChange={handleFilterChange}
                placeholder="Maruti, Hyundai..."
                className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleClearFilters}
              className="brutal-btn bg-gray-300 hover:bg-gray-400 px-4 py-2 text-xs"
            >
              🔄 CLEAR
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="brutal-btn bg-yellow-400 hover:bg-yellow-500 px-6 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ SEARCHING...' : '🔍 SEARCH'}
            </button>
          </div>
        </div>

      {/* Error Message */}
      {error && (
        <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-5 flex items-start gap-2">
          <span className="text-xl">❌</span>
          <p className="font-black uppercase text-xs">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="brutal-card bg-white p-8 text-center">
          <div className="inline-block animate-spin text-6xl">⏳</div>
          <p className="mt-3 font-black uppercase text-sm">Loading vehicles...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && vehicles.length === 0 && (
        <div className="brutal-card bg-white p-8 text-center">
          <div className="text-6xl mb-3">🔍</div>
          <h3 className="brutal-heading text-xl mb-2">NO VEHICLES FOUND</h3>
          <p className="font-bold text-sm">Try adjusting your filters!</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && !error && vehicles.length > 0 && (
        <>
          <div className="mb-4">
            <p className="font-black uppercase text-sm">Found {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} 🎉</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="brutal-card bg-white p-4">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 border-3 border-black mb-3 flex items-center justify-center">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.company} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {vehicle.type === 'bike' && '🏍️'}
                        {vehicle.type === 'scooter' && '🛵'}
                        {vehicle.type === 'car' && '🚗'}
                        {!vehicle.type && '🚗'}
                      </div>
                      <p className="text-xs font-black uppercase">No image</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="brutal-heading text-base">
                    {vehicle.year} {vehicle.company} {vehicle.model}
                  </h3>
                  <div className="text-right">
                    <p className="text-xl font-black">₹{vehicle.dailyRate}</p>
                    <p className="text-xs font-bold">/day</p>
                  </div>
                </div>

                <div className={`brutal-badge mb-2 ${
                  vehicle.status === 'available' ? 'bg-green-300 border-green-600' :
                  vehicle.status === 'rented' ? 'bg-yellow-300 border-yellow-600' :
                  'bg-red-300 border-red-600'
                }`}>
                  {vehicle.status === 'available' && '✅'}
                  {vehicle.status === 'rented' && '⏰'}
                  {vehicle.status === 'maintenance' && '🔧'}
                  {' '}{vehicle.status.toUpperCase()}
                </div>

                <p className="font-bold text-xs mb-2 flex items-center">
                  📍 {vehicle.location}
                </p>

                <p className="text-xs font-bold mb-2 uppercase">
                  {vehicle.type} | {vehicle.licensePlate}
                </p>

                {vehicle.description && (
                  <p className="text-xs mb-2 line-clamp-2">{vehicle.description}</p>
                )}

                {vehicle.features && vehicle.features.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="bg-gray-200 border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="bg-gray-200 border-2 border-black px-2 py-0.5 text-xs font-black">
                        +{vehicle.features.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {vehicle.provider && (
                  <p className="text-xs font-bold mb-3">
                    🏢 {vehicle.provider.businessName || vehicle.provider.name}
                  </p>
                )}

                <div className="flex gap-2">
                  {vehicle.status === 'available' ? (
                    <>
                      <button 
                        onClick={() => handleBookClick(vehicle)}
                        className="flex-1 brutal-btn bg-yellow-400 hover:bg-yellow-500 py-2 text-xs"
                      >
                        📅 BOOK NOW
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Contact button clicked - Vehicle:', vehicle);
                          console.log('Contact button clicked - Provider ID:', vehicle.provider?._id);
                          handleContactProvider(vehicle.provider?._id);
                        }}
                        className="brutal-btn bg-purple-300 hover:bg-purple-400 py-2 px-3 text-xs"
                        title="Contact Provider"
                      >
                        💬
                      </button>
                    </>
                  ) : (
                    <button 
                      className="flex-1 brutal-btn bg-gray-300 py-2 text-xs opacity-50 cursor-not-allowed"
                      disabled
                    >
                      ❌ UNAVAILABLE
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(vehicle)}
                    className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-3 text-xs"
                    title="View Details"
                  >
                    ℹ️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal 
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Booking Modal */}
      {isBookingModalOpen && selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          onClose={handleCloseBookingModal}
          onBook={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default CustomerSearch;