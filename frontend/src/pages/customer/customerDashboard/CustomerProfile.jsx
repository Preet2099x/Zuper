import React, { useState, useEffect } from 'react';

const CustomerProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [originalData, setOriginalData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [documentNumbers, setDocumentNumbers] = useState({
    aadhar: '',
    license: ''
  });

  const [profileData, setProfileData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    },
    documents: {
      driversLicense: {
        number: 'DL-0120230001234',
        expiryDate: '2025-05-15',
        state: 'Delhi',
        status: 'Verified'
      },
      insurance: {
        provider: 'Bajaj Allianz',
        policyNumber: 'POL987654321',
        expiryDate: '2024-12-31',
        status: 'Active'
      }
    },
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: false
      },
      marketing: false,
      language: 'English',
      currency: 'INR'
    }
  });

  // Fetch user profile data
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Fetch documents when documents tab is active
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/customer/login';
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/customer/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      
      // Split the name into firstName and lastName
      const nameParts = (data.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const fetchedProfileData = {
        personal: {
          firstName: firstName,
          lastName: lastName,
          email: data.email || '',
          phone: data.phone || '',
          dateOfBirth: data.dob ? data.dob.split('T')[0] : '',
          address: data.address || ''
        },
        documents: profileData.documents,
        preferences: profileData.preferences
      };

      setProfileData(fetchedProfileData);
      setOriginalData(fetchedProfileData);
      setLoading(false);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to load profile data');
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/documents/customer', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const documentsData = await response.json();
        setDocuments(documentsData);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!profileData.personal.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!profileData.personal.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!profileData.personal.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Combine firstName and lastName into name
      const fullName = `${profileData.personal.firstName} ${profileData.personal.lastName}`.trim();

      const response = await fetch('http://localhost:5000/api/user/customer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fullName,
          phone: profileData.personal.phone,
          dob: profileData.personal.dateOfBirth,
          address: profileData.personal.address
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');
      setOriginalData(profileData);
      setIsEditing(false);

      // Update localStorage with new user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = fullName;
      localStorage.setItem('user', JSON.stringify(userData));

      // Dispatch custom event to notify navbar of the change
      window.dispatchEvent(new Event('userUpdated'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    if (originalData) {
      setProfileData(originalData);
    }
    setIsEditing(false);
    setError('');
  };

  const handleDocumentUpload = async (documentType, file) => {
    if (!file) return;

    // Validate document number
    const documentNumber = documentNumbers[documentType];
    if (!documentNumber || documentNumber.trim() === '') {
      setError(`${documentType === 'license' ? 'License' : 'Aadhar'} number is required`);
      return;
    }

    // Validate format
    if (documentType === 'aadhar' && !/^\d{12}$/.test(documentNumber)) {
      setError('Aadhar number must be 12 digits');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploadingDocument(documentType);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('documentImage', file);
      formData.append('documentType', documentType);

      if (documentType === 'aadhar') {
        formData.append('aadharNumber', documentNumber);
      } else if (documentType === 'license') {
        formData.append('licenseNumber', documentNumber);
      }

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      setSuccessMessage(`${documentType === 'license' ? 'License' : 'Aadhar'} document uploaded successfully! Status: Processing`);
      fetchDocuments(); // Refresh documents list

      // Clear the document number after successful upload
      setDocumentNumbers(prev => ({
        ...prev,
        [documentType]: ''
      }));

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Document upload error:', err);
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const getDocumentStatus = (documentType) => {
    const doc = documents.find(d => d.documentType === documentType);
    return doc ? doc.status : null;
  };

  const getDocumentBadge = (status) => {
    const statusConfig = {
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Uploaded' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-t-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700">
                {successMessage}
              </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">
                    {profileData.personal.firstName[0]}{profileData.personal.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profileData.personal.firstName} {profileData.personal.lastName}
                  </h1>
                  <p className="text-blue-100">{profileData.personal.email}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Verified Customer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === 'personal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === 'documents'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Documents
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                    activeTab === 'preferences'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Preferences
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.personal.firstName}
                        onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.personal.lastName}
                        onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.personal.email}
                        onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                        disabled={true}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 cursor-not-allowed"
                        title="Email cannot be changed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.personal.phone}
                        onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.personal.dateOfBirth}
                        onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={profileData.personal.address}
                        onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents & Verification</h2>
                  <p className="text-gray-600 mb-6">
                    Upload your driving license and Aadhar card for verification. Once verified, your documents and details will be displayed below. Documents will be reviewed by our admin team.
                  </p>

                  <div className="space-y-6">
                    {/* Driving License */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Driving License</h3>
                        {getDocumentBadge(getDocumentStatus('license'))}
                      </div>

                      {getDocumentStatus('license') === 'verified' ? (
                        // Verified Document Display
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✓ Verified
                              </span>
                              <span className="ml-2 text-sm text-green-700">
                                Verified on {new Date(documents.find(d => d.documentType === 'license')?.verifiedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  License Number
                                </label>
                                <div className="p-3 bg-white border border-gray-300 rounded-md text-gray-900 font-mono">
                                  {documents.find(d => d.documentType === 'license')?.licenseNumber}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Document Image
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                  <img
                                    src={documents.find(d => d.documentType === 'license')?.documentImage}
                                    alt="Driving License"
                                    className="max-w-full h-auto max-h-64 object-contain rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Upload Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              License Number
                            </label>
                            <input
                              type="text"
                              value={documentNumbers.license}
                              onChange={(e) => setDocumentNumbers(prev => ({ ...prev, license: e.target.value }))}
                              placeholder="Enter your driving license number"
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload Driving License Image
                            </label>
                            <div className="flex items-center space-x-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDocumentUpload('license', e.target.files[0])}
                                disabled={uploadingDocument === 'license'}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {uploadingDocument === 'license' && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a clear image of your driving license (max 5MB)
                            </p>
                          </div>

                          {getDocumentStatus('license') === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {documents.find(d => d.documentType === 'license')?.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Aadhar Card */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Aadhar Card</h3>
                        {getDocumentBadge(getDocumentStatus('aadhar'))}
                      </div>

                      {getDocumentStatus('aadhar') === 'verified' ? (
                        // Verified Document Display
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✓ Verified
                              </span>
                              <span className="ml-2 text-sm text-green-700">
                                Verified on {new Date(documents.find(d => d.documentType === 'aadhar')?.verifiedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Aadhar Number
                                </label>
                                <div className="p-3 bg-white border border-gray-300 rounded-md text-gray-900 font-mono">
                                  {documents.find(d => d.documentType === 'aadhar')?.aadharNumber}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Document Image
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                                  <img
                                    src={documents.find(d => d.documentType === 'aadhar')?.documentImage}
                                    alt="Aadhar Card"
                                    className="max-w-full h-auto max-h-64 object-contain rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Upload Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Aadhar Number
                            </label>
                            <input
                              type="text"
                              value={documentNumbers.aadhar}
                              onChange={(e) => setDocumentNumbers(prev => ({ ...prev, aadhar: e.target.value }))}
                              placeholder="Enter your 12-digit Aadhar number"
                              maxLength="12"
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload Aadhar Card Image
                            </label>
                            <div className="flex items-center space-x-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDocumentUpload('aadhar', e.target.files[0])}
                                disabled={uploadingDocument === 'aadhar'}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              />
                              {uploadingDocument === 'aadhar' && (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Upload a clear image of your Aadhar card (max 5MB)
                            </p>
                          </div>

                          {getDocumentStatus('aadhar') === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {documents.find(d => d.documentType === 'aadhar')?.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Document Verification Process</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Documents are initially marked as "Processing"</li>
                        <li>• Our admin team will review and verify your documents</li>
                        <li>• You will be notified once verification is complete</li>
                        <li>• Verified documents are required for booking vehicles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Preferences</h2>

                  <div className="space-y-6">
                    {/* Notifications */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                            <p className="text-sm text-gray-500">Receive booking confirmations and updates via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.preferences.notifications.email}
                              onChange={(e) => handleInputChange('preferences', 'notifications', {
                                ...profileData.preferences.notifications,
                                email: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                            <p className="text-sm text-gray-500">Receive important alerts via text message</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.preferences.notifications.sms}
                              onChange={(e) => handleInputChange('preferences', 'notifications', {
                                ...profileData.preferences.notifications,
                                sms: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                            <p className="text-sm text-gray-500">Receive notifications in the app</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.preferences.notifications.push}
                              onChange={(e) => handleInputChange('preferences', 'notifications', {
                                ...profileData.preferences.notifications,
                                push: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Other Preferences */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select
                            value={profileData.preferences.language}
                            onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select
                            value={profileData.preferences.currency}
                            onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Marketing Communications</label>
                            <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.preferences.marketing}
                              onChange={(e) => handleInputChange('preferences', 'marketing', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;