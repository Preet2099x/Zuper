import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/zuper.png";

export default function Navbar() {
  return (
    <header className="bg-white shadow fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Zuper Logo"
            className="h-28 w-auto object-contain -my-10" 
          />
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 hover:text-emerald-600">
            Home
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-emerald-600">
            About
          </Link>
          <Link to="/signup" className="text-gray-700 hover:text-emerald-600">
            Get Started
          </Link>
        </nav>

        {/* CTA Button */}
        <Link
          to="/login"
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
