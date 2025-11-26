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
      available: { color: 'bg-green-300', label: '✓ AVAILABLE' },
      booked: { color: 'bg-yellow-300', label: '📌 BOOKED' },
      maintenance: { color: 'bg-red-300', label: '🔧 MAINTENANCE' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-300', label: status.toUpperCase() };
    return (
      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-6xl animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase">🚗 VEHICLE MANAGEMENT</h3>
          <div className="bg-cyan-200 border-3 border-black px-4 py-2 font-black text-sm">
            TOTAL: {vehicles.length}
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-cyan-300 px-6 py-4 border-b-4 border-black">
          <h4 className="text-xl font-black uppercase">🚙 ALL VEHICLES</h4>
        </div>
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No vehicles found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="border-b-4 border-black last:border-b-0 hover:bg-cyan-50">
                  {/* Vehicle Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedVehicle(expandedVehicle === vehicle._id ? null : vehicle._id)}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Vehicle Image */}
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
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
                          <div className="text-sm font-black uppercase text-gray-900">
                            {vehicle.company} {vehicle.model}
                          </div>
                          <div className="text-sm font-bold text-gray-600">
                            {vehicle.year} • {vehicle.licensePlate}
                          </div>
                          {getStatusBadge(vehicle.status)}
                        </div>
                        <div className="text-sm font-bold text-gray-700 mt-1">
                          📍 {vehicle.location} • ₹{vehicle.dailyRate}/day
                        </div>
                        <div className="text-xs font-bold text-gray-600 mt-1">
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
                    <div className="px-6 pb-4 bg-cyan-50 border-t-3 border-black">
                      {editingVehicle === vehicle._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Company</label>
                              <input
                                type="text"
                                value={editForm.company}
                                onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Model</label>
                              <input
                                type="text"
                                value={editForm.model}
                                onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Year</label>
                              <input
                                type="number"
                                value={editForm.year}
                                onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">License Plate</label>
                              <input
                                type="text"
                                value={editForm.licensePlate}
                                onChange={(e) => setEditForm({...editForm, licensePlate: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Daily Rate (₹)</label>
                              <input
                                type="number"
                                value={editForm.dailyRate}
                                onChange={(e) => setEditForm({...editForm, dailyRate: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Location</label>
                              <input
                                type="text"
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Type</label>
                              <select
                                value={editForm.type}
                                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              >
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                                <option value="truck">Truck</option>
                                <option value="van">Van</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-black uppercase text-gray-900">Status</label>
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              >
                                <option value="available">Available</option>
                                <option value="booked">Booked</option>
                                <option value="maintenance">Maintenance</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-gray-900">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              rows={3}
                              className="mt-1 block w-full border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveVehicle}
                              className="px-4 py-2 bg-green-400 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                              ✓ SAVE
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-300 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                              ✕ CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                            <div><span className="uppercase">Type:</span> {vehicle.type}</div>
                            <div><span className="uppercase">Status:</span> {getStatusBadge(vehicle.status)}</div>
                            <div><span className="uppercase">Daily Rate:</span> ₹{vehicle.dailyRate}</div>
                            <div><span className="uppercase">Year:</span> {vehicle.year}</div>
                            <div className="col-span-2"><span className="uppercase">License Plate:</span> {vehicle.licensePlate}</div>
                            <div className="col-span-2"><span className="uppercase">Location:</span> {vehicle.location}</div>
                            <div><span className="uppercase">Images:</span> {vehicle.images?.length || 0}</div>
                            <div><span className="uppercase">Added:</span> {new Date(vehicle.createdAt).toLocaleDateString()}</div>
                          </div>
                          {vehicle.description && (
                            <div className="text-sm font-bold">
                              <span className="uppercase">Description:</span> {vehicle.description}
                            </div>
                          )}
                          {vehicle.features && vehicle.features.length > 0 && (
                            <div className="text-sm font-bold">
                              <span className="uppercase">Features:</span> {vehicle.features.join(', ')}
                            </div>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => handleEditVehicle(vehicle)}
                              className="px-3 py-1 bg-yellow-300 border-3 border-black font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(vehicle._id)}
                              className="px-3 py-1 bg-red-400 border-3 border-black font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                              🗑️ DELETE
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