import React, { useState } from 'react';

const CustomerHelp = () => {
  const [activeCategory, setActiveCategory] = useState('booking');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  // Static FAQ data
  const faqData = {
    booking: [
      {
        id: 1,
        question: 'How do I make a booking?',
        answer: 'To make a booking, search for available vehicles in your preferred location and time. Select your vehicle, choose pickup/drop-off dates, and complete the payment process. You\'ll receive a confirmation email with all booking details.'
      },
      {
        id: 2,
        question: 'Can I modify my booking after confirmation?',
        answer: 'Yes, you can modify your booking up to 24 hours before pickup. Go to "My Vehicles" in your dashboard, select the booking, and choose "Modify Booking". Some changes may incur additional fees.'
      },
      {
        id: 3,
        question: 'What documents do I need to pick up a vehicle?',
        answer: 'You\'ll need a valid driver\'s license, proof of insurance, and the credit card used for booking. International customers may need additional documentation like passport and visa.'
      },
      {
        id: 4,
        question: 'Is there a minimum age requirement?',
        answer: 'Yes, drivers must be at least 21 years old. Drivers aged 21-24 may incur a young driver surcharge. Some luxury vehicles require drivers to be 25 or older.'
      }
    ],
    payment: [
      {
        id: 5,
        question: 'What payment methods are accepted?',
        answer: 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like Apple Pay and Google Pay. Cash payments are not accepted.'
      },
      {
        id: 6,
        question: 'When am I charged for my booking?',
        answer: 'You\'ll be charged a deposit at the time of booking. The remaining balance is charged when you pick up the vehicle. Security deposits are held and refunded after vehicle return.'
      },
      {
        id: 7,
        question: 'What is the cancellation policy?',
        answer: 'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours incur a 50% fee. No-shows are charged the full booking amount.'
      },
      {
        id: 8,
        question: 'How do I get a refund?',
        answer: 'Refunds are processed within 5-7 business days after vehicle return and inspection. Refunds appear on your original payment method. Processing times vary by bank.'
      }
    ],
    vehicle: [
      {
        id: 9,
        question: 'What happens if I have an accident?',
        answer: 'Stop safely, call emergency services if needed, then contact our 24/7 roadside assistance. Do not admit fault. We\'ll guide you through the claims process and arrange replacement vehicle if necessary.'
      },
      {
        id: 10,
        question: 'Can I drive across state lines?',
        answer: 'One-way rentals are available between participating locations. Additional fees may apply. International travel requires special permission and additional insurance coverage.'
      },
      {
        id: 11,
        question: 'What fuel policy do you have?',
        answer: 'Return vehicles with the same fuel level as pickup. Pre-paid fuel options available. Fuel surcharge applies if vehicle is returned with less fuel.'
      },
      {
        id: 12,
        question: 'Are pets allowed in rental vehicles?',
        answer: 'Pets are allowed in most vehicles with a cleaning fee waiver. Some luxury or specialty vehicles have restrictions. Please inform us at booking if traveling with pets.'
      }
    ],
    account: [
      {
        id: 13,
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and follow the instructions sent to your email. Password reset links expire in 24 hours.'
      },
      {
        id: 14,
        question: 'How do I update my profile information?',
        answer: 'Go to your Profile page in the dashboard. You can update personal information, documents, and preferences. Some changes require verification.'
      },
      {
        id: 15,
        question: 'How do I delete my account?',
        answer: 'Account deletion requests can be submitted through the contact form. All outstanding bookings must be completed and balances settled before account deletion.'
      },
      {
        id: 16,
        question: 'How do I change my email address?',
        answer: 'Contact customer support to change your email address. You\'ll need to verify the new email and may need to re-verify your account.'
      }
    ]
  };

  const categories = [
    { id: 'booking', name: 'Booking & Reservations', icon: '📅' },
    { id: 'payment', name: 'Payment & Billing', icon: '💳' },
    { id: 'vehicle', name: 'Vehicle & Driving', icon: '🚗' },
    { id: 'account', name: 'Account & Profile', icon: '👤' }
  ];

  const filteredFAQs = faqData[activeCategory]?.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="brutal-heading text-3xl mb-5">HELP & SUPPORT ❓</h1>

      {/* Search Bar */}
      <div className="brutal-card bg-white p-5 mb-5">
        <div className="max-w-md mx-auto relative">
          <input
            type="text"
            placeholder="SEARCH FAQS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-3 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 text-sm uppercase placeholder:text-xs"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-xl">🔍</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="brutal-card bg-white p-5">
            <h2 className="brutal-heading text-lg mb-4">CATEGORIES</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left brutal-btn p-3 flex items-center gap-3 text-xs ${
                    activeCategory === category.id
                      ? 'bg-yellow-400'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-black uppercase">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="brutal-card bg-cyan-200 border-cyan-600 p-5 mt-4">
            <h3 className="brutal-heading text-base mb-3">NEED MORE HELP?</h3>
            <p className="text-xs font-bold mb-4">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="space-y-2">
              <button className="w-full brutal-btn bg-cyan-300 hover:bg-cyan-400 py-2 text-xs">
                📞 CALL SUPPORT
              </button>
              <button className="w-full brutal-btn bg-white hover:bg-gray-100 py-2 text-xs">
                💬 LIVE CHAT
              </button>
              <button className="w-full brutal-btn bg-white hover:bg-gray-100 py-2 text-xs">
                ✉️ EMAIL US
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="lg:col-span-3">
          <div className="brutal-card bg-white p-5">
            <div className="mb-4">
              <h2 className="brutal-heading text-xl">
                {categories.find(cat => cat.id === activeCategory)?.name}
              </h2>
              <p className="font-bold text-xs mt-1">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
              </p>
            </div>

            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div key={faq.id} className="brutal-card-sm bg-gray-50 p-4">
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full text-left flex items-center justify-between"
                    >
                      <h3 className="font-black uppercase text-sm pr-4">{faq.question}</h3>
                      <span className="text-2xl">
                        {expandedFAQ === faq.id ? '▲' : '▼'}
                      </span>
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="mt-3 p-3 bg-yellow-100 border-2 border-black">
                        <p className="text-xs font-bold leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="brutal-card-sm bg-white p-8 text-center">
                  <div className="text-6xl mb-3">🔍</div>
                  <h3 className="brutal-heading text-lg mb-2">NO RESULTS FOUND</h3>
                  <p className="text-xs font-bold">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="brutal-card bg-white p-5 mt-4">
            <h3 className="brutal-heading text-lg mb-4">POPULAR TOPICS 🔥</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="brutal-card-sm bg-gray-50 p-4 hover:bg-yellow-100 cursor-pointer transition-colors">
                <h4 className="font-black uppercase text-xs mb-2">🚗 Extend Your Rental</h4>
                <p className="text-xs font-bold">Learn how to extend your booking and avoid late fees.</p>
              </div>
              <div className="brutal-card-sm bg-gray-50 p-4 hover:bg-yellow-100 cursor-pointer transition-colors">
                <h4 className="font-black uppercase text-xs mb-2">💰 Insurance Coverage</h4>
                <p className="text-xs font-bold">What\'s covered and what you need to know about rental insurance.</p>
              </div>
              <div className="brutal-card-sm bg-gray-50 p-4 hover:bg-yellow-100 cursor-pointer transition-colors">
                <h4 className="font-black uppercase text-xs mb-2">📱 Mobile App</h4>
                <p className="text-xs font-bold">Tips and tricks for getting the most out of our mobile app.</p>
              </div>
              <div className="brutal-card-sm bg-gray-50 p-4 hover:bg-yellow-100 cursor-pointer transition-colors">
                <h4 className="font-black uppercase text-xs mb-2">🌍 International Travel</h4>
                <p className="text-xs font-bold">Requirements and tips for crossing borders with rental vehicles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHelp;