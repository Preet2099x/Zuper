import React from 'react';
import CustomerSidebar from './CustomerSidebar';

const CustomerMyVehicles = () => {
  // Static vehicle data
  const vehicles = [
    {
      id: 1,
      make: 'Maruti Suzuki',
      model: 'Swift',
      year: 2020,
      licensePlate: 'DL-01-AB-1234',
      status: 'active',
      contractEnd: '2024-06-15',
      provider: 'Delhi Premium Rentals',
      image: '/api/placeholder/150/100'
    },
    {
      id: 2,
      make: 'Hyundai',
      model: 'i20',
      year: 2019,
      licensePlate: 'MH-12-CD-5678',
      status: 'maintenance',
      contractEnd: '2024-08-20',
      provider: 'Mumbai Car Care',
      image: '/api/placeholder/150/100'
    },
    {
      id: 3,
      make: 'Tata',
      model: 'Nexon',
      year: 2021,
      licensePlate: 'KA-05-EF-9012',
      status: 'active',
      contractEnd: '2024-12-10',
      provider: 'Bangalore SUV Services',
      image: '/api/placeholder/150/100'
    },
    {
      id: 4,
      make: 'Mahindra',
      model: 'Scorpio',
      year: 2022,
      licensePlate: 'TN-09-GH-3456',
      status: 'active',
      contractEnd: '2025-03-25',
      provider: 'Chennai Luxury Vehicles',
      image: '/api/placeholder/150/100'
    },
    {
      id: 5,
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      licensePlate: 'TSL-999',
      status: 'pending',
      contractEnd: '2025-01-15',
      provider: 'Electric Vehicle Pros',
      image: '/api/placeholder/150/100'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <CustomerSidebar logo="/zuper.png" />

      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
              Add New Vehicle
            </button>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-2">License: {vehicle.licensePlate}</p>
                  <p className="text-sm text-gray-500 mb-3">Provider: {vehicle.provider}</p>

                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>Contract ends: {vehicle.contractEnd}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition duration-200 text-sm">
                      Contact Provider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Fleet Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
                <p className="text-sm text-gray-600">Total Vehicles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
                <p className="text-sm text-gray-600">In Maintenance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{vehicles.filter(v => v.status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMyVehicles;