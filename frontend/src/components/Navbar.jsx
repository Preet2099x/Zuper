import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/zuper.png";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Gradient bar that matches landing page */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 
                      shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Zuper Logo"
              className="h-32 w-auto object-contain -my-12"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-white hover:text-emerald-200 transition">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-emerald-200 transition">
              About
            </Link>
            <Link to="/signup" className="text-white hover:text-emerald-200 transition">
              Get Started
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="bg-white text-emerald-600 px-4 py-2 rounded hover:bg-gray-100 transition font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="hidden md:inline-block text-white border border-white/30 px-3 py-2 rounded hover:bg-white/10 transition"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
