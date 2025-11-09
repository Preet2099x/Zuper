import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProviderSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Image upload states
  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState('');
  
  const [settings, setSettings] = useState({
    profile: { businessName: '', contactEmail: '', phone: '', address: '', description: '', website: '' },
    notifications: { bookingRequests: true, bookingConfirmations: true, paymentReceived: true, customerMessages: true, maintenanceReminders: true, marketingEmails: false },
    business: { taxId: '', insuranceProvider: '', policyNumber: '', licenseNumber: '', operatingHours: '' },
    payment: { bankName: '', accountNumber: '', routingNumber: '', paypalEmail: '', autoPayout: true, payoutSchedule: 'monthly' }
  });

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  // Image compression function
  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setMessage('Processing image...');

    try {
      // Compress the image
      const compressedBlob = await compressImage(file);

      // Convert blob to file
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      setBusinessLogoFile(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setBusinessLogoPreview(reader.result);
        setMessage('');
      };
    } catch (err) {
      console.error('Image processing error:', err);
      setError('Failed to process image. Please try again.');
      setMessage('');
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setBusinessLogoFile(null);
    setBusinessLogoPreview('');
  };

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access settings');
        navigate('/provider/login');
        return;
      }
  const response = await axios.get(`${import.meta.env.VITE_API_BASE}/api/user/provider/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const provider = response.data;
      setSettings(prev => ({
        ...prev,
        profile: { businessName: provider.businessName || '', contactEmail: provider.contactEmail || provider.email || '', phone: provider.phone || '', address: provider.businessAddress || '', description: provider.businessDescription || '', website: provider.website || '' },
        business: { taxId: provider.taxId || '', insuranceProvider: provider.insuranceProvider || '', policyNumber: provider.policyNumber || '', licenseNumber: provider.licenseNumber || '', operatingHours: provider.operatingHours || '' },
        payment: { bankName: provider.bankName || '', accountNumber: provider.accountNumber || '', routingNumber: provider.routingNumber || '', paypalEmail: provider.paypalEmail || '', autoPayout: provider.autoPayout !== undefined ? provider.autoPayout : true, payoutSchedule: provider.payoutSchedule || 'monthly' }
      }));
      
      // Set existing logo if available
      if (provider.businessLogo) {
        setBusinessLogoPreview(provider.businessLogo);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to save settings');
        navigate('/provider/login');
        return;
      }
      
      const dataToSend = {
        name: settings.profile.businessName,
        phone: settings.profile.phone,
        businessName: settings.profile.businessName,
        contactEmail: settings.profile.contactEmail,
        businessAddress: settings.profile.address,
        businessDescription: settings.profile.description,
        website: settings.profile.website,
        taxId: settings.business.taxId,
        insuranceProvider: settings.business.insuranceProvider,
        policyNumber: settings.business.policyNumber,
        licenseNumber: settings.business.licenseNumber,
        operatingHours: settings.business.operatingHours,
        bankName: settings.payment.bankName,
        accountNumber: settings.payment.accountNumber,
        routingNumber: settings.payment.routingNumber,
        paypalEmail: settings.payment.paypalEmail,
        autoPayout: settings.payment.autoPayout,
        payoutSchedule: settings.payment.payoutSchedule
      };

      // If there's a logo file, use FormData
      if (businessLogoFile) {
        const formData = new FormData();
        
        // Add all profile data
        Object.keys(dataToSend).forEach(key => {
          formData.append(key, dataToSend[key]);
        });
        
        // Add the logo file
        formData.append('businessLogo', businessLogoFile);
        
  await axios.put(`${import.meta.env.VITE_API_BASE}/api/user/provider/profile`, formData, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        });
      } else {
        // No logo file, use regular JSON
  await axios.put(`${import.meta.env.VITE_API_BASE}/api/user/provider/profile`, dataToSend, { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          } 
        });
      }
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleProfileUpdate = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  return (
    <div className='p-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-8'>Account Settings</h1>
        {error && <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>{error}</div>}
        {message && <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700'>{message}</div>}
        {loading ? (
          <div className='bg-white rounded-lg shadow-md p-8 text-center'><p className='text-gray-600'>Loading profile...</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === 'business'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Info
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Business Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
                  <div className="flex space-x-2">
                    <button onClick={handleSaveChanges} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input
                        type="text"
                        value={settings.profile.businessName}
                        onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                      <input
                        type="email"
                        value={settings.profile.contactEmail}
                        onChange={(e) => handleProfileUpdate('contactEmail', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        type="url"
                        value={settings.profile.website}
                        onChange={(e) => handleProfileUpdate('website', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                    <input
                      type="text"
                      value={settings.profile.address}
                      onChange={(e) => handleProfileUpdate('address', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                    <textarea
                      value={settings.profile.description}
                      onChange={(e) => handleProfileUpdate('description', e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your business and services..."
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Business Logo</h3>
                    <div className="flex items-start space-x-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                        {businessLogoPreview ? (
                          <img
                            src={businessLogoPreview}
                            alt="Business Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-gray-400">🏢</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition duration-200"
                          >
                            {businessLogoPreview ? 'Change Logo' : 'Upload Logo'}
                          </label>
                          {businessLogoPreview && (
                            <button
                              onClick={handleRemoveLogo}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          PNG, JPG up to 5MB. Images will be compressed and stored securely.
                        </p>
                        {businessLogoFile && (
                          <p className="text-sm text-green-600 mt-1">
                            New logo selected: {businessLogoFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => {
                    const labels = {
                      bookingRequests: 'New Booking Requests',
                      bookingConfirmations: 'Booking Confirmations',
                      paymentReceived: 'Payment Notifications',
                      customerMessages: 'Customer Messages',
                      maintenanceReminders: 'Maintenance Reminders',
                      marketingEmails: 'Marketing Emails'
                    };

                    const descriptions = {
                      bookingRequests: 'Get notified when customers request to book your vehicles',
                      bookingConfirmations: 'Receive confirmations for approved bookings',
                      paymentReceived: 'Notifications when payments are received',
                      customerMessages: 'Messages from customers and inquiries',
                      maintenanceReminders: 'Reminders for vehicle maintenance',
                      marketingEmails: 'Promotional offers and platform updates'
                    };

                    return (
                      <div key={key} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{labels[key]}</h3>
                            <p className="text-sm text-gray-600">{descriptions[key]}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                      <input
                        type="text"
                        value={settings.business.taxId}
                        onChange={(e) => handleSettingChange('business', 'taxId', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business License Number</label>
                      <input
                        type="text"
                        value={settings.business.licenseNumber}
                        onChange={(e) => handleSettingChange('business', 'licenseNumber', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                      <input
                        type="text"
                        value={settings.business.insuranceProvider}
                        onChange={(e) => handleSettingChange('business', 'insuranceProvider', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                      <input
                        type="text"
                        value={settings.business.policyNumber}
                        onChange={(e) => handleSettingChange('business', 'policyNumber', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operating Hours</label>
                    <input
                      type="text"
                      value={settings.business.operatingHours}
                      onChange={(e) => handleSettingChange('business', 'operatingHours', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Mon-Fri: 9AM-6PM, Sat: 9AM-4PM"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Document Uploads</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">📄</div>
                        <p className="text-sm font-medium text-gray-900">Business License</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Upload Document
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-2xl mb-2">🛡️</div>
                        <p className="text-sm font-medium text-gray-900">Insurance Certificate</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Upload Document
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings Tab */}
            {activeTab === 'payment' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={settings.payment.bankName}
                          onChange={(e) => handleSettingChange('payment', 'bankName', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={settings.payment.accountNumber}
                          onChange={(e) => handleSettingChange('payment', 'accountNumber', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                        <input
                          type="text"
                          value={settings.payment.routingNumber}
                          onChange={(e) => handleSettingChange('payment', 'routingNumber', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">PayPal (Alternative Payment)</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        value={settings.payment.paypalEmail}
                        onChange={(e) => handleSettingChange('payment', 'paypalEmail', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payout Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Automatic Payouts</label>
                          <p className="text-sm text-gray-600">Automatically transfer earnings to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payment.autoPayout}
                            onChange={(e) => handleSettingChange('payment', 'autoPayout', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payout Schedule</label>
                        <select
                          value={settings.payment.payoutSchedule}
                          onChange={(e) => handleSettingChange('payment', 'payoutSchedule', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
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

export default ProviderSettings;