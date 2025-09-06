import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 text-white overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Drive Freely with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-200 via-green-200 to-emerald-300">
              Zuper
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-emerald-50">
            Flexible rentals and subscriptions for cars, bikes, and scooters. Eco-friendly, hassle-free, and built for the modern lifestyle.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-white text-emerald-600 px-6 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="bg-transparent border border-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-emerald-600 transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Floating blobs for organic background */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl transition">
          <div className="text-5xl mb-4 text-emerald-600">🚗</div>
          <h3 className="text-xl font-semibold mb-2">Flexible Rentals</h3>
          <p className="text-gray-600">
            Choose cars, bikes, or scooters with plans tailored to your lifestyle.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl transition">
          <div className="text-5xl mb-4 text-emerald-600">📱</div>
          <h3 className="text-xl font-semibold mb-2">Smart Dashboard</h3>
          <p className="text-gray-600">
            Manage subscriptions, track usage, and upgrade with a tap.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-2xl transition">
          <div className="text-5xl mb-4 text-emerald-600">💳</div>
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600">
            Powered by Razorpay sandbox for seamless, safe transactions.
          </p>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Trusted by early adopters</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="italic text-gray-600">
                “Zuper makes vehicle rentals ridiculously easy. Signed up in minutes, and I was on the road the same day.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">— Priya S.</h4>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="italic text-gray-600">
                “The subscription model saves me so much hassle. No hidden costs, just pure convenience.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">— Arjun M.</h4>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <p className="italic text-gray-600">
                “I love the dashboard. Tracking mileage and upgrading my plan feels like using a premium app.”
              </p>
              <h4 className="mt-4 font-semibold text-gray-800">— Kavya R.</h4>
            </div>
          </div>
        </div>
      </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
            Ready to explore with Zuper?
        </h2>
        <p className="mt-4 text-lg">
            Whether you’re a customer looking for rides or a provider listing vehicles — we’ve got you covered.
        </p>
        <div className="mt-8 flex flex-col md:flex-row justify-center gap-6">
            <Link
            to="/signup"
            className="bg-white text-emerald-600 px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-gray-100 transition"
            >
            I’m a Customer
            </Link>
            <Link
            to="/provider/signup"
            className="bg-transparent border border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-emerald-600 transition"
            >
            I’m a Provider
            </Link>
        </div>
        </section>


      <Footer />
    </div>
  );
}
