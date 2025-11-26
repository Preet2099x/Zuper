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
      
      // Update localStorage with new name
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          user.name = settings.profile.businessName;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Dispatch event to notify other components (like navbar)
          window.dispatchEvent(new Event('userUpdated'));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
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
    <div className='p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='brutal-heading text-3xl mb-8'>⚙️ ACCOUNT SETTINGS</h1>
        {error && <div className='brutal-card mb-6 p-5 bg-red-200'><p className='font-black text-sm'>⚠️ {error}</p></div>}
        {message && <div className='brutal-card mb-6 p-5 bg-green-200'><p className='font-black text-sm'>✅ {message}</p></div>}
        {loading ? (
          <div className='brutal-card p-8 text-center bg-yellow-200'><p className='font-black uppercase'>⏳ LOADING PROFILE...</p></div>
        ) : (
          <div className="brutal-card bg-white">
          <div className="border-b-3 border-black bg-purple-100 p-5">
            <nav className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`brutal-btn text-xs px-5 py-3 ${
                  activeTab === 'profile'
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                🏛️ BUSINESS PROFILE
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`brutal-btn text-xs px-5 py-3 ${
                  activeTab === 'notifications'
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                🔔 NOTIFICATIONS
              </button>
              <button
                onClick={() => setActiveTab('business')}
                className={`brutal-btn text-xs px-5 py-3 ${
                  activeTab === 'business'
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                💼 BUSINESS INFO
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`brutal-btn text-xs px-5 py-3 ${
                  activeTab === 'payment'
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                💳 PAYMENT SETTINGS
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Business Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="brutal-heading text-xl">🏛️ BUSINESS PROFILE</h2>
                  <button onClick={handleSaveChanges} disabled={saving} className="brutal-btn bg-green-300 text-xs px-5 py-3">
                    {saving ? '⏳ SAVING...' : '💾 SAVE CHANGES'}
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase mb-2">🏛️ BUSINESS NAME *</label>
                      <input
                        type="text"
                        value={settings.profile.businessName}
                        onChange={(e) => handleProfileUpdate('businessName', e.target.value)}
                        className="w-full p-3 border-3 border-black uppercase text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase mb-2">📧 CONTACT EMAIL *</label>
                      <input
                        type="email"
                        value={settings.profile.contactEmail}
                        onChange={(e) => handleProfileUpdate('contactEmail', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase mb-2">📞 PHONE NUMBER *</label>
                      <input
                        type="tel"
                        value={settings.profile.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase mb-2">🌐 WEBSITE</label>
                      <input
                        type="url"
                        value={settings.profile.website}
                        onChange={(e) => handleProfileUpdate('website', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-2">📍 BUSINESS ADDRESS *</label>
                    <input
                      type="text"
                      value={settings.profile.address}
                      onChange={(e) => handleProfileUpdate('address', e.target.value)}
                      className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-2">📝 BUSINESS DESCRIPTION</label>
                    <textarea
                      value={settings.profile.description}
                      onChange={(e) => handleProfileUpdate('description', e.target.value)}
                      rows={4}
                      className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="DESCRIBE YOUR BUSINESS..."
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="brutal-card-sm p-5 bg-blue-100 mt-6">
                    <h3 className="brutal-heading text-lg mb-4">🏢 BUSINESS LOGO</h3>
                    <div className="flex items-start gap-5">
                      <div className="w-24 h-24 border-3 border-black flex items-center justify-center overflow-hidden bg-white">
                        {businessLogoPreview ? (
                          <img
                            src={businessLogoPreview}
                            alt="Business Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">🏢</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="brutal-btn bg-cyan-400 text-xs px-5 py-3 cursor-pointer"
                          >
                            {businessLogoPreview ? '🔄 CHANGE LOGO' : '📷 UPLOAD LOGO'}
                          </label>
                          {businessLogoPreview && (
                            <button
                              onClick={handleRemoveLogo}
                              className="brutal-btn bg-red-300 text-xs px-5 py-3"
                            >
                              🗑️ REMOVE
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] font-bold">
                          PNG, JPG UP TO 5MB. IMAGES COMPRESSED.
                        </p>
                        {businessLogoFile && (
                          <p className="text-[10px] font-bold text-green-800 mt-2">
                            ✅ NEW LOGO: {businessLogoFile.name}
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
                <h2 className="brutal-heading text-xl mb-6 bg-pink-100 p-4 border-3 border-black">
                  🔔 NOTIFICATION PREFERENCES
                </h2>

                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => {
                    const labels = {
                      bookingRequests: '📩 NEW BOOKING REQUESTS',
                      bookingConfirmations: '✅ BOOKING CONFIRMATIONS',
                      paymentReceived: '💰 PAYMENT NOTIFICATIONS',
                      customerMessages: '💬 CUSTOMER MESSAGES',
                      maintenanceReminders: '🔧 MAINTENANCE REMINDERS',
                      marketingEmails: '📧 MARKETING EMAILS'
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
                      <div key={key} className="brutal-card-sm p-5 bg-yellow-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-black text-sm uppercase mb-1">{labels[key]}</h3>
                            <p className="text-[10px] font-bold">{descriptions[key]}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 border-2 border-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400 peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
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
                <h2 className="brutal-heading text-xl mb-6 bg-green-100 p-4 border-3 border-black">
                  🏢 BUSINESS INFORMATION
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">🆔 TAX ID / EIN</label>
                      <input
                        type="text"
                        value={settings.business.taxId}
                        onChange={(e) => handleSettingChange('business', 'taxId', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase mb-2">📋 BUSINESS LICENSE NUMBER</label>
                      <input
                        type="text"
                        value={settings.business.licenseNumber}
                        onChange={(e) => handleSettingChange('business', 'licenseNumber', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase mb-2">🛡️ INSURANCE PROVIDER</label>
                      <input
                        type="text"
                        value={settings.business.insuranceProvider}
                        onChange={(e) => handleSettingChange('business', 'insuranceProvider', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase mb-2">📄 POLICY NUMBER</label>
                      <input
                        type="text"
                        value={settings.business.policyNumber}
                        onChange={(e) => handleSettingChange('business', 'policyNumber', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase mb-2">⏰ OPERATING HOURS</label>
                    <input
                      type="text"
                      value={settings.business.operatingHours}
                      onChange={(e) => handleSettingChange('business', 'operatingHours', e.target.value)}
                      className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="E.G., MON-FRI: 9AM-6PM, SAT: 9AM-4PM"
                    />
                  </div>

                  <div className="brutal-card-sm p-5 bg-orange-100 mt-6">
                    <h3 className="brutal-heading text-lg mb-5">📎 DOCUMENT UPLOADS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="brutal-card p-4 text-center bg-white">
                        <div className="text-2xl mb-2">📄</div>
                        <p className="font-black text-xs uppercase mb-3">BUSINESS LICENSE</p>
                        <button className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full">
                          📤 UPLOAD DOCUMENT
                        </button>
                      </div>
                      <div className="brutal-card p-4 text-center bg-white">
                        <div className="text-2xl mb-2">🛡️</div>
                        <p className="font-black text-xs uppercase mb-3">INSURANCE CERTIFICATE</p>
                        <button className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full">
                          📤 UPLOAD DOCUMENT
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
                <h2 className="brutal-heading text-xl mb-6 bg-blue-100 p-4 border-3 border-black">
                  💳 PAYMENT SETTINGS
                </h2>

                <div className="space-y-6">
                  <div className="brutal-card p-6 bg-green-100">
                    <h3 className="brutal-heading text-lg mb-5">🏦 BANK ACCOUNT INFORMATION</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase mb-2">🏦 BANK NAME</label>
                        <input
                          type="text"
                          value={settings.payment.bankName}
                          onChange={(e) => handleSettingChange('payment', 'bankName', e.target.value)}
                          className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase mb-2">🔢 ACCOUNT NUMBER</label>
                        <input
                          type="text"
                          value={settings.payment.accountNumber}
                          onChange={(e) => handleSettingChange('payment', 'accountNumber', e.target.value)}
                          className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase mb-2">📦 ROUTING NUMBER</label>
                        <input
                          type="text"
                          value={settings.payment.routingNumber}
                          onChange={(e) => handleSettingChange('payment', 'routingNumber', e.target.value)}
                          className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="brutal-card p-6 bg-yellow-100">
                    <h3 className="brutal-heading text-lg mb-5">🔵 PAYPAL (ALTERNATIVE PAYMENT)</h3>
                    <div>
                      <label className="block text-xs font-black uppercase mb-2">✉️ PAYPAL EMAIL</label>
                      <input
                        type="email"
                        value={settings.payment.paypalEmail}
                        onChange={(e) => handleSettingChange('payment', 'paypalEmail', e.target.value)}
                        className="w-full p-3 border-3 border-black text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="brutal-card p-6 bg-purple-100">
                    <h3 className="brutal-heading text-lg mb-5">📅 PAYOUT PREFERENCES</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-black text-xs uppercase">⚡ AUTOMATIC PAYOUTS</label>
                          <p className="text-[10px] font-bold">Automatically transfer earnings to your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.payment.autoPayout}
                            onChange={(e) => handleSettingChange('payment', 'autoPayout', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 border-2 border-black peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-400 peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-2 after:border-black after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase mb-2">📆 PAYOUT SCHEDULE</label>
                        <select
                          value={settings.payment.payoutSchedule}
                          onChange={(e) => handleSettingChange('payment', 'payoutSchedule', e.target.value)}
                          className="w-full p-3 border-3 border-black text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                          <option value="weekly">WEEKLY</option>
                          <option value="biweekly">BI-WEEKLY</option>
                          <option value="monthly">MONTHLY</option>
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