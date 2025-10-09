import React, { useState } from 'react';

const ProviderHelp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Static FAQ data for providers
  const faqCategories = [
    { id: 'all', name: 'All Questions', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'vehicles', name: 'Vehicle Management', icon: '🚗' },
    { id: 'bookings', name: 'Bookings & Payments', icon: '💰' },
    { id: 'account', name: 'Account & Settings', icon: '⚙️' },
    { id: 'support', name: 'Support & Contact', icon: '📞' }
  ];

  const faqData = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started as a vehicle provider?',
      answer: 'To get started, create your provider account, complete your business profile with all required documents, add your first vehicle, and set up your payment information. Once verified, you can start accepting bookings.'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What documents do I need to provide?',
      answer: 'You need to provide: Business license, Insurance certificate, Tax ID/EIN, and valid driver\'s license. All documents must be current and valid.'
    },
    {
      id: 3,
      category: 'vehicles',
      question: 'How do I add a new vehicle to my fleet?',
      answer: 'Go to "List Vehicle" in your dashboard, fill out the vehicle details form including photos, features, pricing, and availability. Your listing will be reviewed before going live.'
    },
    {
      id: 4,
      category: 'vehicles',
      question: 'What types of vehicles can I list?',
      answer: 'You can list cars, SUVs, trucks, vans, motorcycles, and RVs. All vehicles must be properly licensed, insured, and in good mechanical condition.'
    },
    {
      id: 5,
      category: 'vehicles',
      question: 'How do I update vehicle availability?',
      answer: 'In your "My Vehicles" section, you can set availability calendars for each vehicle, mark vehicles as unavailable for maintenance, or remove them temporarily from listings.'
    },
    {
      id: 6,
      category: 'bookings',
      question: 'How do I receive booking requests?',
      answer: 'Booking requests appear in your dashboard inbox. You can approve, decline, or counter-offer. Approved bookings are automatically confirmed and payment is held until pickup.'
    },
    {
      id: 7,
      category: 'bookings',
      question: 'When do I get paid?',
      answer: 'Payments are processed after successful vehicle return and inspection. Funds are typically available in your account within 3-5 business days, depending on your payout schedule.'
    },
    {
      id: 8,
      category: 'bookings',
      question: 'What if a customer damages my vehicle?',
      answer: 'Report any damage immediately with photos. Our claims team will assess the situation and process insurance claims. You\'re protected by our comprehensive insurance coverage.'
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I update my business information?',
      answer: 'Go to Settings > Business Profile to update your contact information, business details, operating hours, and upload new documents.'
    },
    {
      id: 10,
      category: 'account',
      question: 'Can I change my payout method?',
      answer: 'Yes, you can update your payout method in Settings > Payment Settings. We support bank transfers and PayPal. Changes take 1-2 business days to process.'
    },
    {
      id: 11,
      category: 'support',
      question: 'How do I contact customer support?',
      answer: 'You can reach us 24/7 through the contact form below, email support@zuper.com, or call our provider hotline at 1-800-ZUPER-PRO.'
    },
    {
      id: 12,
      category: 'support',
      question: 'What if I need urgent assistance?',
      answer: 'For urgent issues like booking conflicts or vehicle emergencies, call our 24/7 emergency line at 1-888-ZUPER-NOW. Regular support is available Mon-Fri 9AM-6PM EST.'
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <div className="absolute left-4 top-4 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {faqCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  activeCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Frequently Asked Questions
              {activeCategory !== 'all' && (
                <span className="text-gray-600 ml-2">
                  ({faqCategories.find(cat => cat.id === activeCategory)?.name})
                </span>
              )}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="p-6">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full text-left flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg transition duration-200"
                  >
                    <h3 className="text-lg font-medium text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <span className="text-2xl text-gray-400 flex-shrink-0">
                      {expandedFAQ === faq.id ? '−' : '+'}
                    </span>
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse different categories.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Still Need Help?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Support</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option>Select a topic</option>
                    <option>Account Issues</option>
                    <option>Booking Problems</option>
                    <option>Payment Questions</option>
                    <option>Vehicle Management</option>
                    <option>Technical Support</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    rows={6}
                    placeholder="Describe your issue in detail..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Other Ways to Reach Us</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Phone Support</h4>
                    <p className="text-gray-600">Mon-Sat: 9AM-6PM IST</p>
                    <p className="text-blue-600 font-medium">1800-123-ZUPER</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🚨</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Emergency Support</h4>
                    <p className="text-gray-600">24/7 for urgent issues</p>
                    <p className="text-blue-600 font-medium">+91-9876543210</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Email Support</h4>
                    <p className="text-gray-600">Response within 24 hours</p>
                    <p className="text-blue-600 font-medium">support@zuper.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Live Chat</h4>
                    <p className="text-gray-600">Available in dashboard</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-blue-600 hover:text-blue-700">Provider Guidelines</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-700">Insurance Information</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-700">Tax Documentation</a>
                  <a href="#" className="block text-blue-600 hover:text-blue-700">Vehicle Requirements</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Resources */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mt-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Provider Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">📖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Provider Handbook</h3>
              <p className="text-gray-600 mb-4">Complete guide to getting started and managing your business.</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">Download PDF</button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">🎥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 mb-4">Step-by-step video guides for common tasks and features.</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">Watch Videos</button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Latest Updates</h3>
              <p className="text-gray-600 mb-4">Stay informed about platform changes and new features.</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">View Updates</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderHelp;