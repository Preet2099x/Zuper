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
  const [documentFiles, setDocumentFiles] = useState({
    aadhar: null,
    license: null
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

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/customer/profile`, {
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
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/documents/customer`, {
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

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/customer/profile`, {
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

  const handleDocumentUpload = async (documentType) => {
    const file = documentFiles[documentType];
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

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

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/documents/upload`, {
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

      // Clear the document number and file after successful upload
      setDocumentNumbers(prev => ({
        ...prev,
        [documentType]: ''
      }));
      setDocumentFiles(prev => ({
        ...prev,
        [documentType]: null
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
      processing: { bg: 'bg-yellow-300', border: 'border-yellow-600', label: '⏰ PROCESSING' },
      verified: { bg: 'bg-green-300', border: 'border-green-600', label: '✅ VERIFIED' },
      rejected: { bg: 'bg-red-300', border: 'border-red-600', label: '❌ REJECTED' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-300', border: 'border-gray-600', label: '📋 NOT UPLOADED' };

    return (
      <span className={`brutal-badge ${config.bg} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {loading ? (
        <div className="brutal-card bg-white p-12 text-center">
          <div className="inline-block animate-spin text-6xl mb-3">⏳</div>
          <p className="font-black uppercase text-sm">Loading profile...</p>
        </div>
      ) : (
        <div>
          {/* Error Message */}
          {error && (
            <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-5 flex items-start gap-2">
              <span className="text-xl">❌</span>
              <p className="font-black uppercase text-xs">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="brutal-card-sm bg-green-300 border-green-600 p-3 mb-5 flex items-start gap-2">
              <span className="text-xl">✅</span>
              <p className="font-black uppercase text-xs">{successMessage}</p>
            </div>
          )}

          {/* Header */}
          <div className="brutal-card bg-yellow-400 p-6 mb-5">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center transform rotate-3">
                <span className="text-3xl font-black">
                  {profileData.personal.firstName[0]}{profileData.personal.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="brutal-heading text-2xl mb-1">
                  {profileData.personal.firstName} {profileData.personal.lastName}
                </h1>
                <p className="font-bold text-sm mb-2">📧 {profileData.personal.email}</p>
                <div className="brutal-badge bg-green-300 border-green-600 inline-block">
                  ✅ VERIFIED CUSTOMER
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setActiveTab('personal')}
              className={`brutal-btn py-3 px-5 text-xs ${
                activeTab === 'personal'
                  ? 'bg-yellow-400'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              👤 PERSONAL INFO
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`brutal-btn py-3 px-5 text-xs ${
                activeTab === 'documents'
                  ? 'bg-yellow-400'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              📄 DOCUMENTS
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`brutal-btn py-3 px-5 text-xs ${
                activeTab === 'preferences'
                  ? 'bg-yellow-400'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              ⚙️ PREFERENCES
            </button>
          </div>

          {/* Tab Content */}
          <div className="brutal-card bg-white p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="brutal-heading text-xl">PERSONAL INFO</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-4 text-xs"
                      >
                        ✏️ EDIT
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="brutal-btn bg-green-300 hover:bg-green-400 py-2 px-4 text-xs disabled:opacity-50"
                        >
                          {saving ? '⏳ SAVING...' : '💾 SAVE'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="brutal-btn bg-gray-300 hover:bg-gray-400 py-2 px-4 text-xs disabled:opacity-50"
                        >
                          ❌ CANCEL
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black uppercase text-xs mb-2">👤 First Name</label>
                      <input
                        type="text"
                        value={profileData.personal.firstName}
                        onChange={(e) => handleInputChange('personal', 'firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm disabled:bg-gray-100 disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase text-xs mb-2">👤 Last Name</label>
                      <input
                        type="text"
                        value={profileData.personal.lastName}
                        onChange={(e) => handleInputChange('personal', 'lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm disabled:bg-gray-100 disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase text-xs mb-2">📧 Email</label>
                      <input
                        type="email"
                        value={profileData.personal.email}
                        onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                        disabled={true}
                        className="w-full p-2.5 border-3 border-black font-bold text-sm bg-gray-100 opacity-70 cursor-not-allowed"
                        title="Email cannot be changed"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase text-xs mb-2">📱 Phone</label>
                      <input
                        type="tel"
                        value={profileData.personal.phone}
                        onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm disabled:bg-gray-100 disabled:opacity-70"
                      />
                    </div>

                    <div>
                      <label className="block font-black uppercase text-xs mb-2">🎂 Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.personal.dateOfBirth}
                        onChange={(e) => handleInputChange('personal', 'dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm disabled:bg-gray-100 disabled:opacity-70"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-black uppercase text-xs mb-2">📍 Address</label>
                      <textarea
                        value={profileData.personal.address}
                        onChange={(e) => handleInputChange('personal', 'address', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm disabled:bg-gray-100 disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h2 className="brutal-heading text-xl mb-5">DOCUMENTS & VERIFICATION</h2>
                  <p className="font-bold text-sm mb-5">
                    Upload your driving license and Aadhar card for verification. Once verified, your documents and details will be displayed below. Documents will be reviewed by our admin team.
                  </p>

                  <div className="space-y-4">
                    {/* Driving License */}
                    <div className="brutal-card-sm bg-cyan-50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="brutal-heading text-base">🚗 DRIVING LICENSE</h3>
                        {getDocumentBadge(getDocumentStatus('license'))}
                      </div>

                      {getDocumentStatus('license') === 'verified' ? (
                        // Verified Document Display
                        <div>
                          <div className="brutal-badge bg-green-300 border-green-600 mb-3 inline-block">
                            ✅ VERIFIED ON {new Date(documents.find(d => d.documentType === 'license')?.verifiedAt).toLocaleDateString()}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                LICENSE NUMBER
                              </label>
                              <div className="p-3 bg-white border-3 border-black font-mono font-bold text-sm">
                                {documents.find(d => d.documentType === 'license')?.licenseNumber}
                              </div>
                            </div>

                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                DOCUMENT IMAGE
                              </label>
                              <div className="border-3 border-black p-3 bg-white">
                                <img
                                  src={documents.find(d => d.documentType === 'license')?.documentImage}
                                  alt="Driving License"
                                  className="max-w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDocuments(prev => prev.filter(d => d.documentType !== 'license'));
                                setDocumentNumbers(prev => ({ ...prev, license: '' }));
                                setDocumentFiles(prev => ({ ...prev, license: null }));
                              }}
                              className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-4 text-xs w-full"
                            >
                              🔄 UPDATE LICENSE
                            </button>
                          </div>
                        </div>
                      ) : getDocumentStatus('license') === 'processing' ? (
                        // Processing Document Display
                        <div>
                          <div className="brutal-badge bg-yellow-300 border-yellow-600 mb-3 inline-block">
                            ⏰ UNDER REVIEW - Awaiting admin verification
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                LICENSE NUMBER (SUBMITTED)
                              </label>
                              <div className="p-3 bg-white border-3 border-black font-mono font-bold text-sm">
                                {documents.find(d => d.documentType === 'license')?.licenseNumber}
                              </div>
                            </div>

                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                SUBMITTED DOCUMENT
                              </label>
                              <div className="border-3 border-black p-3 bg-white">
                                <img
                                  src={documents.find(d => d.documentType === 'license')?.documentImage}
                                  alt="Driving License"
                                  className="max-w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDocuments(prev => prev.filter(d => d.documentType !== 'license'));
                                setDocumentNumbers(prev => ({ ...prev, license: '' }));
                                setDocumentFiles(prev => ({ ...prev, license: null }));
                              }}
                              className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-4 text-xs w-full"
                            >
                              🔄 UPDATE LICENSE
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Upload Form
                        <div className="space-y-3">
                          <div>
                            <label className="block font-black uppercase text-xs mb-2">
                              LICENSE NUMBER
                            </label>
                            <input
                              type="text"
                              value={documentNumbers.license}
                              onChange={(e) => setDocumentNumbers(prev => ({ ...prev, license: e.target.value }))}
                              placeholder="Enter your driving license number"
                              className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block font-black uppercase text-xs mb-2">
                              📤 UPLOAD LICENSE IMAGE
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setDocumentFiles(prev => ({ ...prev, license: e.target.files[0] }))}
                              disabled={uploadingDocument === 'license'}
                              className="block w-full text-sm font-bold file:brutal-btn file:bg-cyan-300 file:hover:bg-cyan-400 file:text-xs file:py-2 file:px-4"
                            />
                            {documentFiles.license && (
                              <p className="text-xs font-bold mt-1 text-green-600">
                                ✅ {documentFiles.license.name} selected
                              </p>
                            )}
                            <p className="text-xs font-bold mt-1">
                              📸 Upload a clear image (max 5MB)
                            </p>
                          </div>

                          {getDocumentStatus('license') === 'rejected' && (
                            <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-3">
                              <p className="font-black uppercase text-xs mb-1">❌ REJECTED</p>
                              <p className="text-xs font-bold">{documents.find(d => d.documentType === 'license')?.adminNotes}</p>
                            </div>
                          )}

                          <button
                            onClick={() => handleDocumentUpload('license')}
                            disabled={uploadingDocument === 'license' || !documentNumbers.license || !documentFiles.license}
                            className="brutal-btn bg-green-300 hover:bg-green-400 py-2 px-4 text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingDocument === 'license' ? '⏳ UPLOADING...' : '💾 SAVE LICENSE'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Aadhar Card */}
                    <div className="brutal-card-sm bg-yellow-50 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="brutal-heading text-base">🪪 AADHAR CARD</h3>
                        {getDocumentBadge(getDocumentStatus('aadhar'))}
                      </div>

                      {getDocumentStatus('aadhar') === 'verified' ? (
                        // Verified Document Display
                        <div>
                          <div className="brutal-badge bg-green-300 border-green-600 mb-3 inline-block">
                            ✅ VERIFIED ON {new Date(documents.find(d => d.documentType === 'aadhar')?.verifiedAt).toLocaleDateString()}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                AADHAR NUMBER
                              </label>
                              <div className="p-3 bg-white border-3 border-black font-mono font-bold text-sm">
                                {documents.find(d => d.documentType === 'aadhar')?.aadharNumber}
                              </div>
                            </div>

                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                DOCUMENT IMAGE
                              </label>
                              <div className="border-3 border-black p-3 bg-white">
                                <img
                                  src={documents.find(d => d.documentType === 'aadhar')?.documentImage}
                                  alt="Aadhar Card"
                                  className="max-w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDocuments(prev => prev.filter(d => d.documentType !== 'aadhar'));
                                setDocumentNumbers(prev => ({ ...prev, aadhar: '' }));
                                setDocumentFiles(prev => ({ ...prev, aadhar: null }));
                              }}
                              className="brutal-btn bg-yellow-300 hover:bg-yellow-400 py-2 px-4 text-xs w-full"
                            >
                              🔄 UPDATE AADHAR
                            </button>
                          </div>
                        </div>
                      ) : getDocumentStatus('aadhar') === 'processing' ? (
                        // Processing Document Display
                        <div>
                          <div className="brutal-badge bg-yellow-300 border-yellow-600 mb-3 inline-block">
                            ⏰ UNDER REVIEW - Awaiting admin verification
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                AADHAR NUMBER (SUBMITTED)
                              </label>
                              <div className="p-3 bg-white border-3 border-black font-mono font-bold text-sm">
                                {documents.find(d => d.documentType === 'aadhar')?.aadharNumber}
                              </div>
                            </div>

                            <div>
                              <label className="block font-black uppercase text-xs mb-2">
                                SUBMITTED DOCUMENT
                              </label>
                              <div className="border-3 border-black p-3 bg-white">
                                <img
                                  src={documents.find(d => d.documentType === 'aadhar')?.documentImage}
                                  alt="Aadhar Card"
                                  className="max-w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setDocuments(prev => prev.filter(d => d.documentType !== 'aadhar'));
                                setDocumentNumbers(prev => ({ ...prev, aadhar: '' }));
                                setDocumentFiles(prev => ({ ...prev, aadhar: null }));
                              }}
                              className="brutal-btn bg-yellow-300 hover:bg-yellow-400 py-2 px-4 text-xs w-full"
                            >
                              🔄 UPDATE AADHAR
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Upload Form
                        <div className="space-y-3">
                          <div>
                            <label className="block font-black uppercase text-xs mb-2">
                              AADHAR NUMBER (12 DIGITS)
                            </label>
                            <input
                              type="text"
                              value={documentNumbers.aadhar}
                              onChange={(e) => setDocumentNumbers(prev => ({ ...prev, aadhar: e.target.value }))}
                              placeholder="Enter your 12-digit Aadhar number"
                              maxLength="12"
                              className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block font-black uppercase text-xs mb-2">
                              📤 UPLOAD AADHAR IMAGE
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setDocumentFiles(prev => ({ ...prev, aadhar: e.target.files[0] }))}
                              disabled={uploadingDocument === 'aadhar'}
                              className="block w-full text-sm font-bold file:brutal-btn file:bg-yellow-300 file:hover:bg-yellow-400 file:text-xs file:py-2 file:px-4"
                            />
                            {documentFiles.aadhar && (
                              <p className="text-xs font-bold mt-1 text-green-600">
                                ✅ {documentFiles.aadhar.name} selected
                              </p>
                            )}
                            <p className="text-xs font-bold mt-1">
                              📸 Upload a clear image (max 5MB)
                            </p>
                          </div>

                          {getDocumentStatus('aadhar') === 'rejected' && (
                            <div className="brutal-card-sm bg-red-300 border-red-600 p-3 mb-3">
                              <p className="font-black uppercase text-xs mb-1">❌ REJECTED</p>
                              <p className="text-xs font-bold">{documents.find(d => d.documentType === 'aadhar')?.adminNotes}</p>
                            </div>
                          )}

                          <button
                            onClick={() => handleDocumentUpload('aadhar')}
                            disabled={uploadingDocument === 'aadhar' || !documentNumbers.aadhar || !documentFiles.aadhar}
                            className="brutal-btn bg-green-300 hover:bg-green-400 py-2 px-4 text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingDocument === 'aadhar' ? '⏳ UPLOADING...' : '💾 SAVE AADHAR'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Information */}
                    <div className="brutal-card-sm bg-purple-100 border-purple-600 p-4">
                      <h4 className="brutal-heading text-sm mb-2">📋 VERIFICATION PROCESS</h4>
                      <ul className="text-xs font-bold space-y-1">
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
                  <h2 className="brutal-heading text-xl mb-5">ACCOUNT PREFERENCES ⚙️</h2>

                  <div className="space-y-4">
                    {/* Notifications */}
                    <div className="brutal-card-sm bg-cyan-50 p-5">
                      <h3 className="brutal-heading text-base mb-4">🔔 NOTIFICATIONS</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-black uppercase text-xs">📧 EMAIL NOTIFICATIONS</label>
                            <p className="text-xs font-bold">Receive booking confirmations and updates via email</p>
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
                            <label className="font-black uppercase text-xs">📱 SMS NOTIFICATIONS</label>
                            <p className="text-xs font-bold">Receive important alerts via text message</p>
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
                            <label className="font-black uppercase text-xs">🔔 PUSH NOTIFICATIONS</label>
                            <p className="text-xs font-bold">Receive notifications in the app</p>
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
                    <div className="brutal-card-sm bg-purple-50 p-5">
                      <h3 className="brutal-heading text-base mb-4">🌐 GENERAL PREFERENCES</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-black uppercase text-xs mb-2">🌍 LANGUAGE</label>
                          <select
                            value={profileData.preferences.language}
                            onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
                            className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 text-sm uppercase"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-black uppercase text-xs mb-2">💰 CURRENCY</label>
                          <select
                            value={profileData.preferences.currency}
                            onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
                            className="w-full p-2.5 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-purple-400 text-sm uppercase"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="font-black uppercase text-xs">📣 MARKETING COMMUNICATIONS</label>
                            <p className="text-xs font-bold">Receive promotional offers and updates</p>
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
  );
};

export default CustomerProfile;