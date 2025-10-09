import React, { useState } from 'react';

const ProviderMyVehicles = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  // Static vehicle data for provider
  const vehicles = [
    {
      id: 1,
      make: 'Maruti Suzuki',
      model: 'Swift',
      year: 2023,
      licensePlate: 'DL-01-AB-1234',
      status: 'rented',
      dailyRate: '₹2,500',
      location: 'Connaught Place Branch',
      currentBooking: {
        customer: 'Rajesh Kumar',
        endDate: '2024-01-18'
      },
      image: '/api/placeholder/300/200',
      mileage: '15,420 km',
      rating: 4.8,
      totalBookings: 24
    },
    {
      id: 2,
      make: 'Hyundai',
      model: 'Creta',
      year: 2023,
      licensePlate: 'MH-12-CD-5678',
      status: 'available',
      dailyRate: '₹3,200',
      location: 'IGI Airport Branch',
      currentBooking: null,
      image: '/api/placeholder/300/200',
      mileage: '8,950 km',
      rating: 4.9,
      totalBookings: 18
    },
    {
      id: 3,
      make: 'Tata',
      model: 'Nexon',
      year: 2022,
      licensePlate: 'KA-05-EF-9012',
      status: 'available',
      dailyRate: '₹2,200',
      location: 'Rajouri Garden',
      currentBooking: null,
      image: '/api/placeholder/300/200',
      mileage: '22,180 km',
      rating: 4.6,
      totalBookings: 31
    },
    {
      id: 4,
      make: 'Mahindra',
      model: 'Scorpio',
      year: 2023,
      licensePlate: 'TN-09-GH-3456',
      status: 'rented',
      dailyRate: '₹3,500',
      location: 'Eco Branch',
      currentBooking: {
        customer: 'Kavita Patel',
        endDate: '2024-01-19'
      },
      image: '/api/placeholder/300/200',
      mileage: '12,340 km',
      rating: 4.9,
      totalBookings: 15
    },
    {
      id: 5,
      make: 'Kia',
      model: 'Seltos',
      year: 2023,
      licensePlate: 'UP-32-IJ-7890',
      status: 'maintenance',
      dailyRate: '₹2,800',
      location: 'Adventure Branch',
      currentBooking: null,
      image: '/api/placeholder/300/200',
      mileage: '18,720 km',
      rating: 4.7,
      totalBookings: 22
    },
    {
      id: 6,
      make: 'Honda',
      model: 'City',
      year: 2022,
      licensePlate: 'GJ-01-KL-1111',
      status: 'available',
      dailyRate: '₹1,800',
      location: 'Suburban Branch',
      currentBooking: null,
      image: '/api/placeholder/300/200',
      mileage: '28,450 km',
      rating: 4.4,
      totalBookings: 28
    }
  ];

  const filteredVehicles = filterStatus === 'all'
    ? vehicles
    : vehicles.filter(vehicle => vehicle.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'rented':
        return '🔵';
      case 'maintenance':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
            Add New Vehicle
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterStatus === 'available'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Available ({vehicles.filter(v => v.status === 'available').length})
            </button>
            <button
              onClick={() => setFilterStatus('rented')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterStatus === 'rented'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rented ({vehicles.filter(v => v.status === 'rented').length})
            </button>
            <button
              onClick={() => setFilterStatus('maintenance')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                filterStatus === 'maintenance'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Maintenance ({vehicles.filter(v => v.status === 'maintenance').length})
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                <img
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {getStatusIcon(vehicle.status)} {vehicle.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-lg font-bold text-blue-600">{vehicle.dailyRate}/day</p>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-600">📍 {vehicle.location}</p>
                  <p className="text-gray-600">🚗 {vehicle.licensePlate}</p>
                  <p className="text-gray-600">📊 {vehicle.mileage}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">⭐ {vehicle.rating}</span>
                    <span className="text-sm text-gray-600">📅 {vehicle.totalBookings} bookings</span>
                  </div>
                </div>

                {vehicle.currentBooking && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-900">Current Booking</p>
                    <p className="text-sm text-blue-700">{vehicle.currentBooking.customer}</p>
                    <p className="text-xs text-blue-600">Until: {vehicle.currentBooking.endDate}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                    Edit Details
                  </button>
                  <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                    View Bookings
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fleet Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              <p className="text-sm text-gray-600">Total Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'available').length}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => v.status === 'rented').length}</p>
              <p className="text-sm text-gray-600">Currently Rented</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              <p className="text-sm text-gray-600">In Maintenance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderMyVehicles;