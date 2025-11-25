import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div id="top" className="bg-yellow-50 text-gray-900 antialiased">
      <Navbar />

      {/* HERO - Neo-Brutalist Style */}
      <section className="relative pt-32 pb-20 px-4 bg-yellow-50 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-400 border-4 border-black transform rotate-12 animate-float-brutal hidden md:block"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-pink-400 border-4 border-black rounded-full hidden md:block"></div>
        <div className="absolute top-40 left-1/4 w-16 h-16 bg-lime-400 border-4 border-black transform -rotate-6 hidden lg:block"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-block mb-6 animate-slide-up">
              <span className="brutal-badge bg-white px-4 py-2 text-xs md:text-sm inline-block">
                🚀 #1 Vehicle Rental Platform
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="brutal-heading text-6xl md:text-8xl lg:text-9xl mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 border-4 border-black text-white shadow-[12px_12px_0_0_#000]">
                ZUPER
              </span>
            </h1>

            {/* Subtitle */}
            <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-2xl md:text-4xl font-black mb-4 text-shadow-brutal">
                Temporary Vehicles<br />
                <span className="bg-yellow-300 px-3 py-1 border-3 border-black inline-block mt-2">
                  ON DEMAND 🎯
                </span>
              </p>
              <p className="text-lg md:text-xl font-bold text-gray-700 max-w-2xl mx-auto mt-4">
                Cars, bikes, or scooters — ready when you need them. No BS, just wheels! 🏎️
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/customer/signup"
                className="brutal-btn bg-lime-400 hover:bg-lime-300 text-black px-8 py-4 text-lg inline-block"
              >
                START NOW →
              </Link>
              <Link
                to="#features"
                className="brutal-btn bg-pink-400 hover:bg-pink-300 text-black px-8 py-4 text-lg inline-block"
              >
                LEARN MORE
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="brutal-card-sm bg-white p-4">
                <div className="text-3xl md:text-5xl font-black">10K+</div>
                <div className="text-xs md:text-sm font-bold mt-1 uppercase">Users</div>
              </div>
              <div className="brutal-card-sm bg-cyan-300 p-4">
                <div className="text-3xl md:text-5xl font-black">5K+</div>
                <div className="text-xs md:text-sm font-bold mt-1 uppercase">Vehicles</div>
              </div>
              <div className="brutal-card-sm bg-yellow-300 p-4">
                <div className="text-3xl md:text-5xl font-black">50+</div>
                <div className="text-xs md:text-sm font-bold mt-1 uppercase">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS ZUPER - Neo-Brutalist Info Section */}
      <section className="py-20 bg-white border-y-4 border-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="brutal-card bg-gradient-to-br from-purple-400 to-pink-400 p-8 md:p-12">
              <span className="brutal-badge bg-white px-3 py-1 text-xs inline-block mb-4">
                💡 WHAT IS ZUPER?
              </span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                A SIMPLE WAY TO ACCESS VEHICLES TEMPORARILY
              </h2>
              <p className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed">
                Subscribe for a month, rent for the weekend, or list your vehicle and earn. 
                <span className="bg-yellow-300 px-2 py-1 inline-block mx-1 border-2 border-black">NO OWNERSHIP HEADACHES</span>, 
                flexible durations, and transparent pricing. That's it! 🎉
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - Neo-Brutalist Cards */}
      <section id="features" className="py-20 bg-yellow-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="brutal-badge bg-cyan-300 px-4 py-2 text-sm inline-block mb-4">
              ⚡ FEATURES
            </span>
            <h3 className="brutal-heading text-4xl md:text-6xl mb-4">
              WHY CHOOSE US?
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon="⏱️" 
              title="FLEXIBLE DURATIONS" 
              text="Hourly, daily, monthly — pick what fits your lifestyle and budget!" 
              bgColor="bg-lime-300"
            />
            <FeatureCard 
              icon="🛠️" 
              title="MAINTENANCE COVERED" 
              text="All repairs and insurance handled by Zuper. Drive worry-free!" 
              bgColor="bg-pink-300"
            />
            <FeatureCard 
              icon="🔁" 
              title="EASY UPGRADES" 
              text="Switch plans or upgrade your vehicle with just one click!" 
              bgColor="bg-cyan-300"
            />
          </div>
        </div>
      </section>

      {/* ROLE CARDS - Neo-Brutalist Style */}
      <section id="roles" className="py-20 bg-white border-y-4 border-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="brutal-badge bg-yellow-300 px-4 py-2 text-sm inline-block mb-4">
              🎯 GET STARTED
            </span>
            <h3 className="brutal-heading text-4xl md:text-6xl mb-4">
              CHOOSE YOUR PATH
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Customer Card */}
            <div className="brutal-card bg-gradient-to-br from-blue-400 to-cyan-400 p-8">
              <div className="mb-6">
                <span className="text-6xl">👤</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-black mb-4 uppercase">
                I'M A CUSTOMER
              </h4>
              <p className="text-lg font-bold mb-6 leading-relaxed">
                Find vehicles nearby, choose short-term plans, and drive — without long-term commitment! 🚗
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/customer/login" className="brutal-btn bg-white hover:bg-gray-100 text-black px-6 py-3 text-center flex-1">
                  LOGIN
                </Link>
                <Link to="/customer/signup" className="brutal-btn bg-yellow-300 hover:bg-yellow-200 text-black px-6 py-3 text-center flex-1">
                  SIGN UP
                </Link>
              </div>
            </div>

            {/* Provider Card */}
            <div className="brutal-card bg-gradient-to-br from-pink-400 to-purple-400 p-8">
              <div className="mb-6">
                <span className="text-6xl">💰</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-black mb-4 uppercase">
                I'M A PROVIDER
              </h4>
              <p className="text-lg font-bold mb-6 leading-relaxed">
                List your vehicle, earn on your schedule, and let Zuper handle bookings and payments! 💸
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/provider/login" className="brutal-btn bg-white hover:bg-gray-100 text-black px-6 py-3 text-center flex-1">
                  LOGIN
                </Link>
                <Link to="/provider/signup" className="brutal-btn bg-lime-300 hover:bg-lime-200 text-black px-6 py-3 text-center flex-1">
                  SIGN UP
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Neo-Brutalist Cards */}
      <section className="py-20 bg-yellow-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="brutal-badge bg-pink-300 px-4 py-2 text-sm inline-block mb-4">
              💬 TESTIMONIALS
            </span>
            <h3 className="brutal-heading text-4xl md:text-6xl mb-4">
              WHAT USERS SAY
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard 
              text="Booked a weekend car in minutes. No paperwork. Just pure freedom!" 
              author="Sameer K." 
              bgColor="bg-lime-300"
              emoji="⭐"
            />
            <TestimonialCard 
              text="Listing my scooter was incredibly easy and it earns me passive income!" 
              author="Rina P." 
              bgColor="bg-cyan-300"
              emoji="💯"
            />
            <TestimonialCard 
              text="Upgrading plans from the dashboard is flawless. Best platform ever!" 
              author="Omar S." 
              bgColor="bg-pink-300"
              emoji="🔥"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white border-y-4 border-black">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="brutal-heading text-4xl md:text-6xl mb-6 text-white">
              READY TO GET<br />
              <span className="bg-yellow-300 text-black px-4 py-2 inline-block mt-2 border-4 border-white">
                ROLLING? 🚀
              </span>
            </h3>
            <p className="text-xl md:text-2xl font-bold mb-8 text-gray-300">
              Join thousands of happy users today!
            </p>
            <Link 
              to="/customer/signup" 
              className="brutal-btn bg-lime-400 hover:bg-lime-300 text-black px-12 py-5 text-xl inline-block"
            >
              GET STARTED NOW →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* Neo-Brutalist Components */

function FeatureCard({ icon, title, text, bgColor }) {
  return (
    <div className={`brutal-card ${bgColor} p-8`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h4 className="text-2xl font-black mb-3 uppercase leading-tight">
        {title}
      </h4>
      <p className="text-base font-bold leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function TestimonialCard({ text, author, bgColor, emoji }) {
  return (
    <div className={`brutal-card-sm ${bgColor} p-6 relative overflow-hidden`}>
      {/* Quote Mark */}
      <div className="absolute top-4 right-4 text-6xl opacity-20 font-black">
        "
      </div>
      
      {/* Emoji Badge */}
      <div className="inline-block mb-4">
        <span className="text-3xl">{emoji}</span>
      </div>
      
      <p className="text-base font-bold mb-4 leading-relaxed relative z-10">
        "{text}"
      </p>
      
      <div className="flex items-center">
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-lg mr-3 border-2 border-black">
          {author.charAt(0)}
        </div>
        <div className="font-black text-sm uppercase">
          {author}
        </div>
      </div>
    </div>
  );
}
