import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/zuper.png";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b-4 border-black bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="Zuper Logo"
              className="h-28 w-auto object-contain -my-8 transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-2">
            <a
              href="#top"
              className="px-4 py-2 font-black uppercase text-sm hover:bg-yellow-300 transition-colors border-2 border-transparent hover:border-black"
            >
              Home
            </a>
            <a
              href="#features"
              className="px-4 py-2 font-black uppercase text-sm hover:bg-cyan-300 transition-colors border-2 border-transparent hover:border-black"
            >
              Features
            </a>
            <a
              href="#roles"
              className="px-4 py-2 font-black uppercase text-sm hover:bg-pink-300 transition-colors border-2 border-transparent hover:border-black"
            >
              Get Started
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/customer/login"
              className="px-5 py-2 font-black uppercase text-sm border-3 border-black hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/customer/signup"
              className="brutal-btn bg-lime-400 hover:bg-lime-300 text-black px-5 py-2 text-sm"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 border-3 border-black bg-yellow-300 hover:bg-yellow-400 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t-4 border-black bg-yellow-50">
            <nav className="flex flex-col space-y-2">
              <a
                href="#top"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 font-black uppercase text-sm border-3 border-black bg-white hover:bg-yellow-300 transition-colors"
              >
                Home
              </a>
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 font-black uppercase text-sm border-3 border-black bg-white hover:bg-cyan-300 transition-colors"
              >
                Features
              </a>
              <a
                href="#roles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 font-black uppercase text-sm border-3 border-black bg-white hover:bg-pink-300 transition-colors"
              >
                Get Started
              </a>
              <div className="pt-2 space-y-2">
                <Link
                  to="/customer/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 font-black uppercase text-sm text-center border-3 border-black bg-white hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/customer/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 font-black uppercase text-sm text-center border-3 border-black bg-lime-400 hover:bg-lime-300 transition-colors shadow-[4px_4px_0_0_#000]"
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
