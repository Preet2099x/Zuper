import React, { useState, useEffect } from 'react';

const AdminAccounts = () => {
  const [customers, setCustomers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [expandedProvider, setExpandedProvider] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      // Fetch customers
      const customersResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch providers
      const providersResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/providers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData);
      }

      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        setProviders(providersData);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setCustomers(customers.filter(customer => customer._id !== id));
        setExpandedCustomer(null);
      } else {
        alert('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;

    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setProviders(providers.filter(provider => provider._id !== id));
        setExpandedProvider(null);
      } else {
        alert('Failed to delete provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Error deleting provider');
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer._id);
    setEditForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      dob: customer.dob ? customer.dob.split('T')[0] : '',
      address: customer.address || '',
      isEmailVerified: customer.isEmailVerified || false
    });
  };

  const handleEditProvider = (provider) => {
    setEditingProvider(provider._id);
    setEditForm({
      name: provider.name || '',
      email: provider.email || '',
      phone: provider.phone || '',
      businessName: provider.businessName || '',
      contactEmail: provider.contactEmail || '',
      businessAddress: provider.businessAddress || '',
      businessDescription: provider.businessDescription || '',
      website: provider.website || '',
      taxId: provider.taxId || '',
      insuranceProvider: provider.insuranceProvider || '',
      policyNumber: provider.policyNumber || '',
      licenseNumber: provider.licenseNumber || '',
      operatingHours: provider.operatingHours || '',
      bankName: provider.bankName || '',
      accountNumber: provider.accountNumber || '',
      routingNumber: provider.routingNumber || '',
      paypalEmail: provider.paypalEmail || '',
      autoPayout: provider.autoPayout || false,
      payoutSchedule: provider.payoutSchedule || '',
      isEmailVerified: provider.isEmailVerified || false
    });
  };

  const handleSaveCustomer = async () => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/customers/${editingCustomer}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        setCustomers(customers.map(customer =>
          customer._id === editingCustomer ? result.customer : customer
        ));
        setEditingCustomer(null);
        setEditForm({});
      } else {
        alert('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating customer');
    }
  };

  const handleSaveProvider = async () => {
    try {
      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/providers/${editingProvider}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        setProviders(providers.map(provider =>
          provider._id === editingProvider ? result.provider : provider
        ));
        setEditingProvider(null);
        setEditForm({});
      } else {
        alert('Failed to update provider');
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Error updating provider');
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditingProvider(null);
    setEditForm({});
  };

  const getStatusBadge = (isVerified) => {
    return (
      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${
        isVerified ? 'bg-green-300' : 'bg-yellow-300'
      }`}>
        {isVerified ? '✓ VERIFIED' : '⏳ PENDING'}
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
          <h3 className="text-2xl font-black uppercase">📊 ACCOUNT MANAGEMENT</h3>
          <div className="flex space-x-4">
            <div className="bg-blue-200 border-3 border-black px-4 py-2 font-black text-sm">
              👥 CUSTOMERS: {customers.length}
            </div>
            <div className="bg-green-200 border-3 border-black px-4 py-2 font-black text-sm">
              🏢 PROVIDERS: {providers.length}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Section */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-blue-300 px-6 py-4 border-b-4 border-black">
          <h4 className="text-xl font-black uppercase">👥 CUSTOMERS ({customers.length})</h4>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div key={customer._id} className="hover:bg-gray-50">
                  {/* Customer Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedCustomer(expandedCustomer === customer._id ? null : customer._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {customer.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(customer.isEmailVerified)}
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedCustomer === customer._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Customer Details */}
                  {expandedCustomer === customer._id && (
                    <div className="px-6 pb-4 bg-gray-50">
                      {editingCustomer === customer._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name</label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                              <input
                                type="date"
                                value={editForm.dob}
                                onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <textarea
                              value={editForm.address}
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              rows={2}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isEmailVerified}
                              onChange={(e) => setEditForm({...editForm, isEmailVerified: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Email Verified</label>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveCustomer}
                              className="px-4 py-2 bg-green-400 border-3 border-black font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                              ✓ SAVE
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
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Phone:</strong> {customer.phone}</div>
                            <div><strong>DOB:</strong> {customer.dob ? new Date(customer.dob).toLocaleDateString() : 'N/A'}</div>
                            <div className="col-span-2"><strong>Address:</strong> {customer.address || 'N/A'}</div>
                            <div><strong>Joined:</strong> {new Date(customer.createdAt).toLocaleDateString()}</div>
                            <div><strong>Status:</strong> {getStatusBadge(customer.isEmailVerified)}</div>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => handleEditCustomer(customer)}
                              className="px-4 py-2 bg-yellow-300 border-3 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer._id)}
                              className="px-4 py-2 bg-red-400 border-3 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
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

      {/* Providers Section */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-green-300 px-6 py-4 border-b-4 border-black">
          <h4 className="text-xl font-black uppercase">🏢 PROVIDERS ({providers.length})</h4>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No providers found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <div key={provider._id} className="hover:bg-gray-50">
                  {/* Provider Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedProvider(expandedProvider === provider._id ? null : provider._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">
                            {provider.businessName?.charAt(0).toUpperCase() || provider.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{provider.businessName || provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(provider.isEmailVerified)}
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          expandedProvider === provider._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Provider Details */}
                  {expandedProvider === provider._id && (
                    <div className="px-6 pb-4 bg-gray-50">
                      {editingProvider === provider._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name</label>
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Name</label>
                              <input
                                type="text"
                                value={editForm.businessName}
                                onChange={(e) => setEditForm({...editForm, businessName: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                              <input
                                type="email"
                                value={editForm.contactEmail}
                                onChange={(e) => setEditForm({...editForm, contactEmail: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Website</label>
                              <input
                                type="url"
                                value={editForm.website}
                                onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Business Address</label>
                            <textarea
                              value={editForm.businessAddress}
                              onChange={(e) => setEditForm({...editForm, businessAddress: e.target.value})}
                              rows={2}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Business Description</label>
                            <textarea
                              value={editForm.businessDescription}
                              onChange={(e) => setEditForm({...editForm, businessDescription: e.target.value})}
                              rows={2}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isEmailVerified}
                              onChange={(e) => setEditForm({...editForm, isEmailVerified: e.target.checked})}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">Email Verified</label>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveProvider}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Phone:</strong> {provider.phone}</div>
                            <div><strong>Contact:</strong> {provider.contactEmail || 'N/A'}</div>
                            <div><strong>Business:</strong> {provider.businessName || 'N/A'}</div>
                            <div><strong>Website:</strong> {provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a> : 'N/A'}</div>
                            <div className="col-span-2"><strong>Address:</strong> {provider.businessAddress || 'N/A'}</div>
                            <div><strong>Joined:</strong> {new Date(provider.createdAt).toLocaleDateString()}</div>
                            <div><strong>Status:</strong> {getStatusBadge(provider.isEmailVerified)}</div>
                          </div>
                          {provider.businessDescription && (
                            <div className="text-sm">
                              <strong>Description:</strong> {provider.businessDescription}
                            </div>
                          )}
                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => handleEditProvider(provider)}
                              className="px-4 py-2 bg-yellow-300 border-3 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            >
                              ✏️ EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider._id)}
                              className="px-4 py-2 bg-red-400 border-3 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
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

export default AdminAccounts;