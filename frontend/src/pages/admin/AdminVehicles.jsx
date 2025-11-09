import React, { useState, useEffect } from 'react';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVehicle, setExpandedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setVehicles(vehicles.filter(vehicle => vehicle._id !== id));
        setExpandedVehicle(null);
      } else {
        alert('Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error deleting vehicle');
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle._id);
    setEditForm({
      company: vehicle.company || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      licensePlate: vehicle.licensePlate || '',
      dailyRate: vehicle.dailyRate || '',
      location: vehicle.location || '',
      type: vehicle.type || 'car',
      description: vehicle.description || '',
      status: vehicle.status || 'available'
    });
  };

  const handleSaveVehicle = async () => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${editingVehicle}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        setVehicles(vehicles.map(vehicle =>
          vehicle._id === editingVehicle ? result.vehicle : vehicle
        ));
        setEditingVehicle(null);
        setEditForm({});
      } else {
        alert('Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Error updating vehicle');
    }
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setEditForm({});
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', label: 'Available' },
      booked: { color: 'bg-yellow-100 text-yellow-800', label: 'Booked' },
      maintenance: { color: 'bg-red-100 text-red-800', label: 'Maintenance' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Vehicle Management</h3>
        <div className="text-sm text-gray-600">
          Total Vehicles: {vehicles.length}
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No vehicles found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="hover:bg-gray-50">
                  {/* Vehicle Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedVehicle(expandedVehicle === vehicle._id ? null : vehicle._id)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Vehicle Image */}
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img
                            src={vehicle.images[0]}
                            alt={`${vehicle.company} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl text-gray-400">🚗</span>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.company} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.licensePlate}
                          </div>
                          {getStatusBadge(vehicle.status)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          📍 {vehicle.location} • ₹{vehicle.dailyRate}/day
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Provider: {vehicle.provider?.businessName || vehicle.provider?.name || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedVehicle === vehicle._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Vehicle Details */}
                  {expandedVehicle === vehicle._id && (
                    <div className="px-6 pb-4 bg-gray-50">
                      {editingVehicle === vehicle._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Company</label>
                              <input
                                type="text"
                                value={editForm.company}
                                onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Model</label>
                              <input
                                type="text"
                                value={editForm.model}
                                onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Year</label>
                              <input
                                type="number"
                                value={editForm.year}
                                onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">License Plate</label>
                              <input
                                type="text"
                                value={editForm.licensePlate}
                                onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Daily Rate (₹)</label>
                              <input
                                type="number"
                                value={editForm.dailyRate}
                                onChange={(e) => setEditForm({...editForm, dailyRate: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Location</label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Type</label>
                              <select
                                value={editForm.type}
                                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                                <option value="truck">Truck</option>
                                <option value="van">Van</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Status</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              rows={3}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveVehicle}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Type:</strong> {vehicle.type}</div>
                            <div><strong>Status:</strong> {getStatusBadge(vehicle.status)}</div>
                            <div><strong>Daily Rate:</strong> ₹{vehicle.dailyRate}</div>
                            <div><strong>Year:</strong> {vehicle.year}</div>
                            <div className="col-span-2"><strong>License Plate:</strong> {vehicle.licensePlate}</div>
                            <div className="col-span-2"><strong>Location:</strong> {vehicle.location}</div>
                            <div><strong>Images:</strong> {vehicle.images?.length || 0}</div>
                            <div><strong>Added:</strong> {new Date(vehicle.createdAt).toLocaleDateString()}</div>
                          </div>
                          {vehicle.description && (
                            <div className="text-sm">
                              <strong>Description:</strong> {vehicle.description}
                            </div>
                          )}
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="text-sm">
                              <strong>Features:</strong> {vehicle.features.join(', ')}
                            </div>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVehicles;