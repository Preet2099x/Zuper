import React, { useState } from 'react';

const CustomerSettings = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Static settings data
  const [settings, setSettings] = useState({
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: '30',
      passwordLastChanged: '2024-01-01'
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      marketingEmails: true,
      analyticsTracking: true
    },
    notifications: {
      bookingConfirmations: true,
      paymentReminders: true,
      promotionalOffers: false,
      maintenanceAlerts: true,
      newsletter: false
    },
    billing: {
      defaultPaymentMethod: 'card_****1234',
      autoRenewal: true,
      invoiceEmails: true,
      taxDocuments: true
    }
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would validate and update password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Changing password...');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Account deletion requested');
    }
  };

  const handleExportData = () => {
    console.log('Exporting user data...');
    // In a real app, this would trigger a data export
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="brutal-heading text-3xl mb-5">ACCOUNT SETTINGS ⚙️</h1>

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setActiveTab('security')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'security'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🔒 SECURITY
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'privacy'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🔐 PRIVACY
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'notifications'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🔔 NOTIFICATIONS
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`brutal-btn py-3 px-5 text-xs ${
            activeTab === 'billing'
              ? 'bg-yellow-400'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          💳 BILLING
        </button>
      </div>

      {/* Tab Content */}
      <div className="brutal-card bg-white p-6">
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div>
            <h2 className="brutal-heading text-xl mb-5">SECURITY SETTINGS</h2>

            <div className="space-y-4">
              {/* Password */}
              <div className="brutal-card-sm bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">🔑 PASSWORD</h3>
                    <p className="text-xs font-bold">Last changed: {settings.security.passwordLastChanged}</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 px-4 text-xs"
                  >
                    ✏️ CHANGE
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="brutal-card-sm bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">🔐 TWO-FACTOR AUTH</h3>
                    <p className="text-xs font-bold">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => handleSettingChange('security', 'twoFactorEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:bg-green-300 relative cursor-pointer">
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-black transition-transform ${settings.security.twoFactorEnabled ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
                {!settings.security.twoFactorEnabled && (
                  <div className="mt-3">
                    <button className="brutal-btn bg-gray-300 hover:bg-gray-400 py-2 px-4 text-xs">
                      🚀 ENABLE 2FA
                    </button>
                  </div>
                )}
              </div>

              {/* Login Alerts */}
              <div className="brutal-card-sm bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">🔔 LOGIN ALERTS</h3>
                    <p className="text-xs font-bold">Get notified on new logins</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:bg-green-300 relative cursor-pointer">
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-black transition-transform ${settings.security.loginAlerts ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Session Timeout */}
              <div className="brutal-card-sm bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-1">⏱️ SESSION TIMEOUT</h3>
                    <p className="text-xs font-bold">Auto logout after inactivity</p>
                  </div>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                    className="p-2 border-3 border-black font-bold text-xs uppercase focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  >
                    <option value="15">15 MIN</option>
                    <option value="30">30 MIN</option>
                    <option value="60">1 HOUR</option>
                    <option value="240">4 HOURS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div>
            <h2 className="brutal-heading text-xl mb-5">PRIVACY SETTINGS</h2>

            <div className="space-y-4">
              {/* Profile Visibility */}
              <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">👁️ PROFILE VISIBILITY</h3>
                          <p className="text-xs text-gray-700">Control who can see your profile information</p>
                        </div>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                          className="p-2.5 border-3 border-black bg-white font-black text-xs uppercase focus:ring-0 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <option value="public">PUBLIC</option>
                          <option value="private">PRIVATE</option>
                          <option value="friends">FRIENDS ONLY</option>
                        </select>
                      </div>
                    </div>

                    {/* Data Sharing */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">📊 DATA SHARING</h3>
                          <p className="text-xs text-gray-700">Allow sharing of anonymized data for service improvement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.dataSharing}
                            onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Marketing Emails */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">📧 MARKETING EMAILS</h3>
                          <p className="text-xs text-gray-700">Receive promotional offers and marketing communications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.marketingEmails}
                            onChange={(e) => handleSettingChange('privacy', 'marketingEmails', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Analytics Tracking */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">📈 ANALYTICS TRACKING</h3>
                          <p className="text-xs text-gray-700">Help us improve our service with usage analytics</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.analyticsTracking}
                            onChange={(e) => handleSettingChange('privacy', 'analyticsTracking', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Data Export */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">💾 EXPORT YOUR DATA</h3>
                          <p className="text-xs text-gray-700">Download a copy of all your personal data</p>
                        </div>
                        <button
                          onClick={handleExportData}
                          className="brutal-btn bg-yellow-400 hover:bg-yellow-500 text-black font-black py-2 px-4 text-xs uppercase"
                        >
                          📥 EXPORT DATA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="brutal-heading text-xl mb-5">NOTIFICATION PREFERENCES</h2>

                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => {
                      const labels = {
                        bookingConfirmations: '✅ Booking Confirmations',
                        paymentReminders: '💰 Payment Reminders',
                        promotionalOffers: '🎁 Promotional Offers',
                        maintenanceAlerts: '🔧 Maintenance Alerts',
                        newsletter: '📰 Newsletter'
                      };

                      const descriptions = {
                        bookingConfirmations: 'Get notified when bookings are confirmed or updated',
                        paymentReminders: 'Receive reminders for upcoming payments',
                        promotionalOffers: 'Special offers and promotional deals',
                        maintenanceAlerts: 'Vehicle maintenance and service notifications',
                        newsletter: 'Weekly newsletter with industry updates'
                      };

                      return (
                        <div key={key} className="brutal-card-sm bg-gray-50 p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-black uppercase text-sm">{labels[key]}</h3>
                              <p className="text-xs text-gray-700">{descriptions[key]}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="brutal-heading text-xl mb-5">BILLING SETTINGS</h2>

                  <div className="space-y-4">
                    {/* Default Payment Method */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">💳 DEFAULT PAYMENT METHOD</h3>
                          <p className="text-xs text-gray-700">{settings.billing.defaultPaymentMethod}</p>
                        </div>
                        <button className="brutal-btn bg-yellow-400 hover:bg-yellow-500 text-black font-black py-2 px-4 text-xs uppercase">
                          ✏️ CHANGE METHOD
                        </button>
                      </div>
                    </div>

                    {/* Auto Renewal */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">🔄 AUTO RENEWAL</h3>
                          <p className="text-xs text-gray-700">Automatically renew recurring bookings</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.billing.autoRenewal}
                            onChange={(e) => handleSettingChange('billing', 'autoRenewal', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Invoice Emails */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">📧 INVOICE EMAILS</h3>
                          <p className="text-xs text-gray-700">Receive email copies of all invoices</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.billing.invoiceEmails}
                            onChange={(e) => handleSettingChange('billing', 'invoiceEmails', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Tax Documents */}
                    <div className="brutal-card-sm bg-gray-50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-black uppercase text-sm">📄 TAX DOCUMENTS</h3>
                          <p className="text-xs text-gray-700">Receive tax documents and receipts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.billing.taxDocuments}
                            onChange={(e) => handleSettingChange('billing', 'taxDocuments', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-300 border-3 border-black peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-black after:border-3 after:border-black after:h-6 after:w-6 after:transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Danger Zone */}
          <div className="brutal-card bg-red-200 border-red-600 p-5 mt-5">
          <h2 className="brutal-heading text-xl mb-4">DANGER ZONE ⚠️</h2>
          <div className="brutal-card-sm bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase text-sm mb-2">DELETE ACCOUNT</h3>
                <p className="text-xs font-bold">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="brutal-btn bg-red-400 hover:bg-red-500 py-2 px-4 text-xs ml-4"
              >
                ❌ DELETE
              </button>
            </div>
          </div>
        </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSettings;