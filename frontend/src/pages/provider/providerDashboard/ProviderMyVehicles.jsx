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

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/my-vehicles`, {
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
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${vehicleId}`, {
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

  const handleEditVehicle = (vehicleId) => {
    navigate(`/dashboard/provider/edit-vehicle/${vehicleId}`);
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
        <div className="text-center brutal-card bg-white p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-4"></div>
          <p className="font-black uppercase text-sm text-gray-900">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-300';
      case 'rented':
        return 'bg-blue-300';
      case 'maintenance':
        return 'bg-yellow-300';
      default:
        return 'bg-gray-300';
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-6 brutal-card bg-red-300 border-3 border-black p-4">
          <span className="font-black uppercase text-sm text-black">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="brutal-heading text-3xl">🚗 MY VEHICLES</h1>
        <button 
          onClick={() => navigate('/dashboard/provider/list-vehicle')}
          className="brutal-btn bg-purple-300 hover:bg-purple-400 text-black px-6 py-3"
        >
          ➕ ADD NEW VEHICLE
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="brutal-card bg-white p-5 mb-8">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`brutal-btn text-xs px-4 py-2 ${
              filterStatus === 'all'
                ? 'bg-purple-400'
                : 'bg-white hover:bg-purple-100'
            }`}
          >
            ALL VEHICLES ({vehicles.length})
          </button>
          <button
            onClick={() => setFilterStatus('available')}
            className={`brutal-btn text-xs px-4 py-2 ${
              filterStatus === 'available'
                ? 'bg-purple-400'
                : 'bg-white hover:bg-green-100'
            }`}
          >
            ✅ AVAILABLE ({vehicles.filter(v => v.status === 'available').length})
          </button>
          <button
            onClick={() => setFilterStatus('rented')}
            className={`brutal-btn text-xs px-4 py-2 ${
              filterStatus === 'rented'
                ? 'bg-purple-400'
                : 'bg-white hover:bg-blue-100'
            }`}
          >
            🔵 RENTED ({vehicles.filter(v => v.status === 'rented').length})
          </button>
          <button
            onClick={() => setFilterStatus('maintenance')}
            className={`brutal-btn text-xs px-4 py-2 ${
              filterStatus === 'maintenance'
                ? 'bg-purple-400'
                : 'bg-white hover:bg-yellow-100'
            }`}
          >
            🟡 MAINTENANCE ({vehicles.filter(v => v.status === 'maintenance').length})
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="brutal-card bg-purple-100 p-12 text-center">
          <div className="text-7xl mb-6">🚗</div>
          <h3 className="brutal-heading text-2xl mb-3">NO VEHICLES YET</h3>
          <p className="font-bold text-sm text-gray-700 uppercase mb-6">Start by adding your first vehicle to get started!</p>
          <button 
            onClick={() => navigate('/dashboard/provider/list-vehicle')}
            className="brutal-btn bg-purple-300 hover:bg-purple-400 text-black py-4 px-8"
          >
            ➕ ADD YOUR FIRST VEHICLE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="brutal-card-sm bg-white overflow-hidden hover:bg-purple-50 transition-colors">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center relative">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.company} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-7xl">{getVehicleEmoji(vehicle.type)}</div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`brutal-badge ${getStatusColor(vehicle.status)} text-black border-2 border-black text-xs px-3 py-1.5`}>
                    {getStatusIcon(vehicle.status)} {vehicle.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black uppercase text-sm text-gray-900">
                    {vehicle.year} {vehicle.company} {vehicle.model}
                  </h3>
                  <p className="font-black text-sm text-purple-600">₹{vehicle.dailyRate}/day</p>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-bold text-gray-700">📍 {vehicle.location}</p>
                  <p className="text-xs font-bold text-gray-700">{getVehicleEmoji(vehicle.type)} {vehicle.licensePlate}</p>
                  <p className="text-xs font-bold text-gray-700 capitalize">🏷️ {vehicle.type}</p>
                  {vehicle.features && vehicle.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {vehicle.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="brutal-badge bg-purple-200 text-[10px] px-2 py-1">
                          {feature}
                        </span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="brutal-badge bg-purple-200 text-[10px] px-2 py-1">
                          +{vehicle.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {vehicle.description && (
                  <p className="text-xs font-bold text-gray-600 mb-4 line-clamp-2">{vehicle.description}</p>
                )}

                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditVehicle(vehicle._id)}
                    className="flex-1 brutal-btn bg-cyan-300 hover:bg-cyan-400 text-black py-2 px-3 text-xs"
                  >
                    ✏️ EDIT
                  </button>
                  <button 
                    onClick={() => handleDeleteVehicle(vehicle._id)}
                    className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 text-black py-2 px-3 text-xs"
                  >
                    ❌ DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fleet Summary */}
      {vehicles.length > 0 && (
        <div className="brutal-card bg-white p-8 mt-8">
          <h2 className="brutal-heading text-xl mb-6">📊 FLEET SUMMARY</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="brutal-card-sm bg-purple-100 text-center p-5">
              <p className="text-4xl font-black text-gray-900 mb-2">{vehicles.length}</p>
              <p className="font-black uppercase text-xs text-gray-700">Total Vehicles</p>
            </div>
            <div className="brutal-card-sm bg-green-200 text-center p-5">
              <p className="text-4xl font-black text-green-700 mb-2">{vehicles.filter(v => v.status === 'available').length}</p>
              <p className="font-black uppercase text-xs text-gray-700">Available</p>
            </div>
            <div className="brutal-card-sm bg-blue-200 text-center p-5">
              <p className="text-4xl font-black text-blue-700 mb-2">{vehicles.filter(v => v.status === 'rented').length}</p>
              <p className="font-black uppercase text-xs text-gray-700">Currently Rented</p>
            </div>
            <div className="brutal-card-sm bg-yellow-200 text-center p-5">
              <p className="text-4xl font-black text-yellow-700 mb-2">{vehicles.filter(v => v.status === 'maintenance').length}</p>
              <p className="font-black uppercase text-xs text-gray-700">In Maintenance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderMyVehicles;