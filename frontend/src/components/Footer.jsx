import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Zuper</h2>
          <p className="mt-2 text-sm text-gray-400">
            Smarter vehicle rentals & subscriptions for a connected world.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/customer/signup" className="hover:text-white">Get Started</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white">Contact</h3>
          <p className="mt-3 text-sm text-gray-400">support@zuper.com</p>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Zuper. All rights reserved.
      </div>
    </footer>
  );
}
