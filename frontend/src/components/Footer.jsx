import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white border-t-4 border-black">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <h2 className="text-4xl font-black mb-4 uppercase">
              <span className="bg-lime-400 text-black px-3 py-1 inline-block border-3 border-white transform -rotate-2">
                ZUPER
              </span>
            </h2>
            <p className="text-lg font-bold text-gray-300 mb-6 leading-relaxed">
              Smarter vehicle rentals & subscriptions for a connected world. 🌍
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="brutal-btn bg-cyan-400 hover:bg-cyan-300 text-black w-12 h-12 flex items-center justify-center text-xl"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="brutal-btn bg-pink-400 hover:bg-pink-300 text-black w-12 h-12 flex items-center justify-center text-xl"
                aria-label="Instagram"
              >
                📷
              </a>
              <a
                href="#"
                className="brutal-btn bg-yellow-400 hover:bg-yellow-300 text-black w-12 h-12 flex items-center justify-center text-xl"
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-xl mb-4 uppercase text-yellow-400">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-lime-400 font-bold transition-colors">
                  → Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-lime-400 font-bold transition-colors">
                  → About
                </Link>
              </li>
              <li>
                <Link to="#features" className="text-gray-300 hover:text-lime-400 font-bold transition-colors">
                  → Features
                </Link>
              </li>
              <li>
                <Link to="/customer/signup" className="text-gray-300 hover:text-lime-400 font-bold transition-colors">
                  → Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-xl mb-4 uppercase text-pink-400">
              Contact
            </h3>
            <div className="space-y-2">
              <p className="text-gray-300 font-bold">
                📧 support@zuper.com
              </p>
              <p className="text-gray-300 font-bold">
                📞 1-800-ZUPER-01
              </p>
              <p className="text-gray-300 font-bold">
                📍 San Francisco, CA
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="brutal-card bg-gradient-to-r from-purple-600 to-pink-600 p-6 mb-8 transform -rotate-1">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-2xl mb-2 uppercase text-white">
                STAY UPDATED! 📬
              </h3>
              <p className="font-bold text-white">
                Get the latest news and exclusive offers!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="YOUR EMAIL"
                className="px-4 py-3 border-3 border-black font-bold placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 uppercase text-sm"
              />
              <button className="brutal-btn bg-lime-400 hover:bg-lime-300 text-black px-6 py-3 whitespace-nowrap">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-4 border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="font-bold text-gray-400 uppercase text-sm">
            © {currentYear} ZUPER. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-4 text-sm font-bold">
            <Link to="/privacy" className="text-gray-400 hover:text-yellow-400 transition-colors uppercase">
              Privacy
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/terms" className="text-gray-400 hover:text-yellow-400 transition-colors uppercase">
              Terms
            </Link>
            <span className="text-gray-600">•</span>
            <Link to="/cookies" className="text-gray-400 hover:text-yellow-400 transition-colors uppercase">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
