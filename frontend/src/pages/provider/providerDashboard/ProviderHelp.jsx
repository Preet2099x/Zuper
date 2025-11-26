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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="brutal-heading text-3xl mb-8">❓ HELP & SUPPORT</h1>

        {/* Search Bar */}
        <div className="brutal-card p-5 mb-6 bg-cyan-100">
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH FOR HELP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 pl-14 border-3 border-black uppercase text-xs font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <div className="absolute left-5 top-4 text-2xl">
              🔍
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="brutal-card p-5 mb-6 bg-yellow-100">
          <h2 className="brutal-heading text-xl mb-5">📚 BROWSE BY CATEGORY</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {faqCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`brutal-btn p-4 text-center text-xs ${
                  activeCategory === category.id
                    ? 'bg-cyan-400'
                    : 'bg-white'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-black uppercase">{category.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="brutal-card bg-white">
          <div className="p-5 border-b-3 border-black bg-purple-100">
            <h2 className="brutal-heading text-xl">
              ❓ FREQUENTLY ASKED QUESTIONS
              {activeCategory !== 'all' && (
                <span className="text-sm ml-2">
                  ({faqCategories.find(cat => cat.id === activeCategory)?.name})
                </span>
              )}
            </h2>
          </div>

          <div className="divide-y-3 divide-black">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(faq => (
                <div key={faq.id} className="p-5">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full text-left flex justify-between items-center hover:bg-gray-50 p-3 transition-all"
                  >
                    <h3 className="font-black text-sm uppercase pr-4">
                      {faq.question}
                    </h3>
                    <span className="text-2xl flex-shrink-0">
                      {expandedFAQ === faq.id ? '➖' : '➕'}
                    </span>
                  </button>

                  {expandedFAQ === faq.id && (
                    <div className="mt-3 brutal-card-sm p-4 bg-blue-100">
                      <p className="text-xs font-bold">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="font-black text-lg uppercase mb-2">NO RESULTS FOUND</h3>
                <p className="text-xs font-bold">
                  TRY DIFFERENT SEARCH TERMS OR BROWSE CATEGORIES.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="brutal-card bg-white mt-6">
          <div className="p-5 border-b-3 border-black bg-pink-100">
            <h2 className="brutal-heading text-xl">👋 STILL NEED HELP?</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <div>
                <h3 className="brutal-heading text-lg mb-5 bg-cyan-100 p-3 border-2 border-black">
                  📨 CONTACT SUPPORT
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase mb-2">🎯 SUBJECT *</label>
                    <select className="w-full p-3 border-3 border-black text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cyan-400">
                      <option>SELECT A TOPIC</option>
                      <option>ACCOUNT ISSUES</option>
                      <option>BOOKING PROBLEMS</option>
                      <option>PAYMENT QUESTIONS</option>
                      <option>VEHICLE MANAGEMENT</option>
                      <option>TECHNICAL SUPPORT</option>
                      <option>OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase mb-2">✍️ MESSAGE *</label>
                    <textarea
                      rows={6}
                      placeholder="DESCRIBE YOUR ISSUE IN DETAIL..."
                      className="w-full p-3 border-3 border-black text-xs font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full"
                  >
                    🚀 SEND MESSAGE
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="brutal-heading text-lg mb-5 bg-yellow-100 p-3 border-2 border-black">
                  📱 OTHER WAYS TO REACH US
                </h3>

                <div className="space-y-4">
                  <div className="brutal-card-sm p-4 bg-green-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📞</div>
                      <div>
                        <h4 className="font-black text-xs uppercase">PHONE SUPPORT</h4>
                        <p className="text-[10px] font-bold">MON-SAT: 9AM-6PM IST</p>
                        <p className="font-black text-xs mt-1">1800-123-ZUPER</p>
                      </div>
                    </div>
                  </div>

                  <div className="brutal-card-sm p-4 bg-red-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🚨</div>
                      <div>
                        <h4 className="font-black text-xs uppercase">EMERGENCY SUPPORT</h4>
                        <p className="text-[10px] font-bold">24/7 FOR URGENT ISSUES</p>
                        <p className="font-black text-xs mt-1">+91-9876543210</p>
                      </div>
                    </div>
                  </div>

                  <div className="brutal-card-sm p-4 bg-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📧</div>
                      <div>
                        <h4 className="font-black text-xs uppercase">EMAIL SUPPORT</h4>
                        <p className="text-[10px] font-bold">RESPONSE WITHIN 24 HOURS</p>
                        <p className="font-black text-xs mt-1">support@zuper.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="brutal-card-sm p-4 bg-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💬</div>
                      <div>
                        <h4 className="font-black text-xs uppercase">LIVE CHAT</h4>
                        <p className="text-[10px] font-bold">AVAILABLE IN DASHBOARD</p>
                        <button className="brutal-btn bg-cyan-400 text-[10px] px-3 py-2 mt-2">
                          🚀 START CHAT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="brutal-card-sm p-4 bg-orange-100 mt-6">
                  <h4 className="font-black text-xs uppercase mb-3">🔗 QUICK LINKS</h4>
                  <div className="space-y-2">
                    <a href="#" className="block text-xs font-bold hover:underline">➡️ PROVIDER GUIDELINES</a>
                    <a href="#" className="block text-xs font-bold hover:underline">➡️ INSURANCE INFORMATION</a>
                    <a href="#" className="block text-xs font-bold hover:underline">➡️ TAX DOCUMENTATION</a>
                    <a href="#" className="block text-xs font-bold hover:underline">➡️ VEHICLE REQUIREMENTS</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Resources */}
        <div className="brutal-card bg-gradient-to-r from-cyan-100 to-purple-100 mt-6">
          <div className="p-5 border-b-3 border-black">
            <h2 className="brutal-heading text-xl">📚 PROVIDER RESOURCES</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="brutal-card p-6 bg-yellow-100">
                <div className="text-3xl mb-4">📖</div>
                <h3 className="brutal-heading text-base mb-3">PROVIDER HANDBOOK</h3>
                <p className="text-[10px] font-bold mb-4">
                  COMPLETE GUIDE TO GETTING STARTED AND MANAGING YOUR BUSINESS.
                </p>
                <button className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full">
                  📄 DOWNLOAD PDF
                </button>
              </div>

              <div className="brutal-card p-6 bg-pink-100">
                <div className="text-3xl mb-4">🎥</div>
                <h3 className="brutal-heading text-base mb-3">VIDEO TUTORIALS</h3>
                <p className="text-[10px] font-bold mb-4">
                  STEP-BY-STEP VIDEO GUIDES FOR COMMON TASKS AND FEATURES.
                </p>
                <button className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full">
                  ▶️ WATCH VIDEOS
                </button>
              </div>

              <div className="brutal-card p-6 bg-green-100">
                <div className="text-3xl mb-4">📰</div>
                <h3 className="brutal-heading text-base mb-3">LATEST UPDATES</h3>
                <p className="text-[10px] font-bold mb-4">
                  STAY INFORMED ABOUT PLATFORM CHANGES AND NEW FEATURES.
                </p>
                <button className="brutal-btn bg-cyan-400 text-xs px-5 py-3 w-full">
                  👁️ VIEW UPDATES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderHelp;