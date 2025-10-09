import React, { useState } from 'react';
import CustomerSidebar from './CustomerSidebar';

const CustomerSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    vehicleType: '',
    priceRange: '',
    availability: ''
  });

  // Static vehicle search results
  const searchResults = [
    {
      id: 1,
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2023,
      price: '$85/day',
      location: 'Downtown Branch',
      features: ['GPS', 'Bluetooth', 'Leather Seats'],
      image: '/api/placeholder/300/200',
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      make: 'Audi',
      model: 'A4',
      year: 2023,
      price: '$75/day',
      location: 'Airport Branch',
      features: ['Navigation', 'Heated Seats', 'Premium Sound'],
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviews: 89
    },
    {
      id: 3,
      make: 'BMW',
      model: '3 Series',
      year: 2023,
      price: '$90/day',
      location: 'City Center',
      features: ['Adaptive Cruise', 'Parking Assist', 'Sunroof'],
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviews: 156
    },
    {
      id: 4,
      make: 'Volkswagen',
      model: 'Golf',
      year: 2022,
      price: '$45/day',
      location: 'Suburban Branch',
      features: ['Fuel Efficient', 'Compact', 'Easy Parking'],
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 67
    },
    {
      id: 5,
      make: 'Jeep',
      model: 'Wrangler',
      year: 2023,
      price: '$110/day',
      location: 'Adventure Branch',
      features: ['4WD', 'Off-Road Ready', 'Roof Rack'],
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviews: 203
    },
    {
      id: 6,
      make: 'Tesla',
      model: 'Model Y',
      year: 2023,
      price: '$120/day',
      location: 'Eco Branch',
      features: ['Electric', 'Autopilot', 'Supercharger Access'],
      image: '/api/placeholder/300/200',
      rating: 4.9,
      reviews: 312
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // In a real app, this would trigger an API call with filters
    console.log('Searching with filters:', searchFilters);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CustomerSidebar logo="/zuper.png" />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Vehicles</h1>

          {/* Search Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  name="location"
                  value={searchFilters.location}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Locations</option>
                  <option value="downtown">Downtown</option>
                  <option value="airport">Airport</option>
                  <option value="city-center">City Center</option>
                  <option value="suburban">Suburban</option>
                </select>
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
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="electric">Electric</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  name="priceRange"
                  value={searchFilters.priceRange}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Price</option>
                  <option value="0-50">$0 - $50/day</option>
                  <option value="50-100">$50 - $100/day</option>
                  <option value="100+">$100+/day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  name="availability"
                  value={searchFilters.availability}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Time</option>
                  <option value="today">Available Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Search Vehicles
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{vehicle.price}</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span>{vehicle.rating} ({vehicle.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{vehicle.location}</p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      Book Now
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200">
              Load More Vehicles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearch;