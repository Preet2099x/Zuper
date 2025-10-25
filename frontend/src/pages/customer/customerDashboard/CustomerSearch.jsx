import React, { useState, useEffect } from 'react';
import VehicleDetailsModal from '../../../components/VehicleDetailsModal';
import BookingModal from '../../../components/BookingModal';

const CustomerSearch = () => {
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

      const response = await fetch(`http://localhost:5000/api/vehicles/search?${queryParams.toString()}`);
      
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Vehicles</h1>

          {/* Success Message */}
          {bookingSuccess && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              ✓ {bookingSuccess}
            </div>
          )}

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={searchFilters.location}
                  onChange={handleFilterChange}
                  placeholder="e.g., Delhi, Mumbai"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={searchFilters.vehicleType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹/day)</label>
                <select
                  name="priceRange"
                  value={searchFilters.priceRange}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Price</option>
                  <option value="0-2000">₹0 - ₹2,000/day</option>
                  <option value="2000-3000">₹2,000 - ₹3,000/day</option>
                  <option value="3000-5000">₹3,000 - ₹5,000/day</option>
                  <option value="5000+">₹5,000+/day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={searchFilters.company}
                  onChange={handleFilterChange}
                  placeholder="e.g., Maruti, Hyundai"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleClearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Clear Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search Vehicles'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && vehicles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No vehicles found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search filters or check back later.</p>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && vehicles.length > 0 && (
            <>
              <div className="mb-4">
                <p className="text-gray-600">Found {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={vehicle.images[0]}
                          alt={`${vehicle.company} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-8xl mb-2">
                            {vehicle.type === 'bike' && '🏍️'}
                            {vehicle.type === 'scooter' && '🛵'}
                            {vehicle.type === 'car' && '🚗'}
                            {!vehicle.type && '🚗'}
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No image available</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {vehicle.year} {vehicle.company} {vehicle.model}
                        </h3>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">₹{vehicle.dailyRate}/day</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {vehicle.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {vehicle.location}
                      </p>

                      <p className="text-sm text-gray-500 mb-3 capitalize">
                        Type: {vehicle.type} | License: {vehicle.licensePlate}
                      </p>

                      {vehicle.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vehicle.description}</p>
                      )}

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {vehicle.features.slice(0, 4).map((feature, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                {feature}
                              </span>
                            ))}
                            {vehicle.features.length > 4 && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                                +{vehicle.features.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {vehicle.provider && (
                        <p className="text-xs text-gray-500 mb-3">
                          Provider: {vehicle.provider.businessName || vehicle.provider.name}
                        </p>
                      )}

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleBookClick(vehicle)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm disabled:opacity-50"
                          disabled={vehicle.status !== 'available'}
                        >
                          {vehicle.status === 'available' ? 'Book Now' : 'Not Available'}
                        </button>
                        <button 
                          onClick={() => handleViewDetails(vehicle)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
      </div>

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