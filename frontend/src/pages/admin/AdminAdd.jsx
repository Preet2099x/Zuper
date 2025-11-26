import React, { useState, useEffect } from 'react';

const AdminAdd = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState([]);

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

  useEffect(() => {
    if (activeTab === 'vehicle') {
      fetchProviders();
    }
  }, [activeTab]);

  const fetchProviders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/providers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const providersData = await response.json();
        setProviders(providersData);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

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
        ? `${import.meta.env.VITE_API_BASE}/api/user/customers`
        : `${import.meta.env.VITE_API_BASE}/api/user/providers`;

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

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/admin/create`, {
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
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-2xl font-black uppercase">➕ ADD NEW RECORDS</h3>
      </div>

      {/* Tab Navigation */}
      <div className="border-b-4 border-black">
        <nav className="-mb-1 flex space-x-8">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-4 border-b-4 font-black text-sm uppercase transition-all ${
              activeTab === 'account'
                ? 'border-orange-400 bg-orange-100 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            👥 ADD ACCOUNT
          </button>
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`py-2 px-4 border-b-4 font-black text-sm uppercase transition-all ${
              activeTab === 'vehicle'
                ? 'border-orange-400 bg-orange-100 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'border-transparent text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
          >
            🚗 ADD VEHICLE
          </button>
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-300 border-3 border-black px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="bg-green-300 border-3 border-black px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ✓ {message}
        </div>
      )}

      {/* Account Form */}
      {activeTab === 'account' && (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h4 className="text-lg font-black uppercase text-gray-900 mb-4 pb-3 border-b-3 border-black">🔑 CREATE NEW ACCOUNT</h4>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  ACCOUNT TYPE
                </label>
                <select
                  name="type"
                  value={accountForm.type}
                  onChange={handleAccountChange}
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
                >
                  <option value="customer">Customer</option>
                  <option value="provider">Provider</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  EMAIL *
                </label>
                <input
                  type="email"
                  name="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  PHONE *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={accountForm.phone}
                  onChange={handleAccountChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {accountForm.type === 'provider' && (
                <div>
                  <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                    BUSINESS NAME
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={accountForm.businessName}
                    onChange={handleAccountChange}
                    className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}

              <div className={accountForm.type === 'provider' ? '' : 'md:col-span-2'}>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  {accountForm.type === 'provider' ? 'BUSINESS ADDRESS' : 'ADDRESS'}
                </label>
                <input
                  type="text"
                  name="address"
                  value={accountForm.address}
                  onChange={handleAccountChange}
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-400 py-2 px-6 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ CREATING...' : '✓ CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicle Form */}
      {activeTab === 'vehicle' && (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h4 className="text-lg font-black uppercase text-gray-900 mb-4 pb-3 border-b-3 border-black">🚙 CREATE NEW VEHICLE</h4>
          <form onSubmit={handleVehicleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  COMPANY *
                </label>
                <input
                  type="text"
                  name="company"
                  value={vehicleForm.company}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g., Maruti Suzuki"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  MODEL *
                </label>
                <input
                  type="text"
                  name="model"
                  value={vehicleForm.model}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g., Swift"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  YEAR *
                </label>
                <input
                  type="number"
                  name="year"
                  value={vehicleForm.year}
                  onChange={handleVehicleChange}
                  required
                  min="2000"
                  max="2030"
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  VEHICLE TYPE
                </label>
                <select
                  name="type"
                  value={vehicleForm.type}
                  onChange={handleVehicleChange}
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  LICENSE PLATE *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={vehicleForm.licensePlate}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g., ABC-1234"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  DAILY RATE (₹) *
                </label>
                <input
                  type="number"
                  name="dailyRate"
                  value={vehicleForm.dailyRate}
                  onChange={handleVehicleChange}
                  required
                  min="1"
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  LOCATION *
                </label>
                <input
                  type="text"
                  name="location"
                  value={vehicleForm.location}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="e.g., Connaught Place, New Delhi"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  name="description"
                  value={vehicleForm.description}
                  onChange={handleVehicleChange}
                  rows={3}
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  placeholder="Describe the vehicle..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                  PROVIDER *
                </label>
                <select
                  name="providerId"
                  value={vehicleForm.providerId}
                  onChange={handleVehicleChange}
                  required
                  className="w-full p-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name} - {provider.businessName || provider.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 py-2 px-6 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ CREATING...' : '✓ CREATE VEHICLE'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminAdd;