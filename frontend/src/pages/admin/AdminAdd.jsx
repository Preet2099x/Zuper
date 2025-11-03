import React, { useState } from 'react';

const AdminAdd = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Account form state
  const [accountForm, setAccountForm] = useState({
    type: 'customer',
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
    password: 'TempPass123!' // Default password
  });

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    company: '',
    model: '',
    year: '',
    licensePlate: '',
    dailyRate: '',
    location: '',
    description: '',
    type: 'car',
    providerId: ''
  });

  const handleAccountChange = (e) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value
    });
  };

  const handleVehicleChange = (e) => {
    setVehicleForm({
      ...vehicleForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = accountForm.type === 'customer'
        ? 'http://localhost:5000/api/auth/customer/signup'
        : 'http://localhost:5000/api/auth/provider/signup';

      const payload = accountForm.type === 'customer'
        ? {
            name: accountForm.name,
            email: accountForm.email,
            phone: accountForm.phone,
            password: accountForm.password,
            address: accountForm.address
          }
        : {
            name: accountForm.name,
            email: accountForm.email,
            phone: accountForm.phone,
            password: accountForm.password,
            businessName: accountForm.businessName,
            businessAddress: accountForm.address
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      setMessage(`${accountForm.type} account created successfully!`);
      setAccountForm({
        type: 'customer',
        name: '',
        email: '',
        phone: '',
        businessName: '',
        address: '',
        password: 'TempPass123!'
      });
    } catch (err) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch('http://localhost:5000/api/vehicles/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(vehicleForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create vehicle');
      }

      setMessage('Vehicle created successfully!');
      setVehicleForm({
        company: '',
        model: '',
        year: '',
        licensePlate: '',
        dailyRate: '',
        location: '',
        description: '',
        type: 'car',
        providerId: ''
      });
    } catch (err) {
      console.error('Vehicle creation error:', err);
      setError(err.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Add New Records</h3>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'account'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Account
          </button>
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vehicle'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add Vehicle
          </button>
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Account Form */}
      {activeTab === 'account' && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Create New Account</h4>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="type"
                  value={accountForm.type}
                  onChange={handleAccountChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="provider">Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={accountForm.phone}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {accountForm.type === 'provider' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={accountForm.businessName}
                    onChange={handleAccountChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className={accountForm.type === 'provider' ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {accountForm.type === 'provider' ? 'Business Address' : 'Address'}
                </label>
                <input
                  type="text"
                  name="address"
                  value={accountForm.address}
                  onChange={handleAccountChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Form */}
      {activeTab === 'vehicle' && (
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Create New Vehicle</h4>
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={vehicleForm.company}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Maruti Suzuki"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={vehicleForm.model}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Swift"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={vehicleForm.year}
                  onChange={handleVehicleChange}
                  required
                  min="2000"
                  max="2030"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  name="type"
                  value={vehicleForm.type}
                  onChange={handleVehicleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={vehicleForm.licensePlate}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Rate (₹) *
                </label>
                <input
                  type="number"
                  name="dailyRate"
                  value={vehicleForm.dailyRate}
                  onChange={handleVehicleChange}
                  required
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={vehicleForm.location}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Connaught Place, New Delhi"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={vehicleForm.description}
                  onChange={handleVehicleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the vehicle..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAdd;