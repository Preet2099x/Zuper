import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderMyVehicles = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/provider/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/vehicles/my-vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch vehicles error:', err);
      setError('Failed to load vehicles');
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      // Refresh the list
      fetchVehicles();
    } catch (err) {
      console.error('Delete vehicle error:', err);
      alert('Failed to delete vehicle');
    }
  };

  // Remove static data
  const staticVehicles = [
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
  // End of static data (to be removed)

  const filteredVehicles = filterStatus === 'all'
    ? vehicles
    : vehicles.filter(vehicle => vehicle.status === filterStatus);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

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

  const getVehicleEmoji = (type) => {
    switch (type?.toLowerCase()) {
      case 'bike':
        return '🏍️';
      case 'scooter':
        return '🛵';
      case 'car':
      default:
        return '🚗';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <button 
            onClick={() => navigate('/dashboard/provider/list-vehicle')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
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
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Vehicles Yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first vehicle to get started!</p>
            <button 
              onClick={() => navigate('/dashboard/provider/list-vehicle')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-200"
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                  {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.company} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">{getVehicleEmoji(vehicle.type)}</div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusIcon(vehicle.status)} {vehicle.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {vehicle.year} {vehicle.company} {vehicle.model}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">₹{vehicle.dailyRate}/day</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">📍 {vehicle.location}</p>
                    <p className="text-gray-600">{getVehicleEmoji(vehicle.type)} {vehicle.licensePlate}</p>
                    <p className="text-gray-600 capitalize">🏷️ {vehicle.type}</p>
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {vehicle.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            +{vehicle.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {vehicle.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vehicle.description}</p>
                  )}

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fleet Summary */}
        {vehicles.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default ProviderMyVehicles;