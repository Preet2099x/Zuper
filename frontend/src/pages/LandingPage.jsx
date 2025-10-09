import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="bg-emerald-50 text-gray-900 antialiased">
      <Navbar />

      {/* HERO - darker, spacious, no white bleed */}
      <section className="pt-28 pb-16 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 text-white text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow-md">Zuper</h1>
          <p className="mt-4 text-xl md:text-2xl max-w-2xl mx-auto opacity-90">
            Temporary vehicles on demand — cars, bikes, or scooters, ready when you need them.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/plans"
              className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold shadow hover:scale-[1.02] transition transform"
            >
              Explore Plans
            </Link>
            <Link
              to="#how"
              className="bg-emerald-600/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600/30 transition"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* decorative blob (lower opacity so nav separation feels obvious) */}
        <div className="absolute right-6 top-6 w-72 h-72 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      </section>

      {/* WHAT IS ZUPER - darker card-style on muted background */}
      <section className="py-12 bg-emerald-100">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-emerald-900">What is Zuper?</h2>
          <p className="text-emerald-800/90">
            Zuper is a simple way to access vehicles temporarily — subscribe for a month, rent for the weekend, or list your vehicle and earn. No ownership headaches, flexible durations, and transparent pricing.
          </p>
        </div>
      </section>

      {/* FEATURES - dark cards on soft backdrop (no stark white) */}
      <section className="py-12 bg-emerald-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-emerald-900 mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <PanelCard icon="⏱️" title="Flexible durations" text="Hourly, daily, monthly — pick what fits." />
            <PanelCard icon="🛠️" title="Maintenance covered" text="Repairs and insurance managed by Zuper." />
            <PanelCard icon="🔁" title="Easy upgrades" text="Switch plans or upgrade with one click." />
          </div>
        </div>
      </section>

      {/* ROLE CARDS - strong color blocks, no white */}
      <section id="roles" className="py-12 bg-emerald-600 text-white">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-8">Get Started</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 bg-emerald-700/90 shadow-lg">
              <h4 className="text-2xl font-semibold">I'm a Customer</h4>
              <p className="mt-3 text-emerald-100/90">Find vehicles nearby, choose short-term plans, and drive — without long-term commitment.</p>
              <div className="flex gap-3 mt-6">
                <Link to="/customer/login" className="flex-1 text-center bg-white text-emerald-700 px-5 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
                  Login
                </Link>
                <Link to="/customer/signup" className="flex-1 text-center bg-white text-emerald-700 px-5 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
                  Sign Up
                </Link>
              </div>
            </div>

            <div className="rounded-2xl p-8 bg-emerald-700/90 shadow-lg">
              <h4 className="text-2xl font-semibold text-white">I'm a Provider</h4>
              <p className="mt-3 text-white/90">List your vehicle, earn on your schedule, and let Zuper handle bookings and payments.</p>
              <div className="flex gap-3 mt-6">
                <Link to="/provider/login" className="flex-1 text-center bg-white text-teal-700 px-5 py-3 rounded-lg font-semibold hover:bg-teal-50 transition">
                  Login
                </Link>
                <Link to="/provider/signup" className="flex-1 text-center bg-white text-teal-700 px-5 py-3 rounded-lg font-semibold hover:bg-teal-50 transition">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - muted dark cards */}
      <section className="py-12 bg-emerald-100">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-emerald-900 mb-8">What users say</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Quote text="Booked a weekend car in minutes. No paperwork." author="— Sameer K." />
            <Quote text="Listing my scooter was easy and it earns monthly." author="— Rina P." />
            <Quote text="Upgrading plans from dashboard is flawless." author="— Omar S." />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* small subcomponents (kept compact) */
function PanelCard({ icon, title, text }) {
  return (
    <div className="bg-emerald-800/8 p-6 rounded-xl shadow-inner border border-emerald-100/10">
      <div className="text-3xl">{icon}</div>
      <h4 className="mt-4 font-semibold text-emerald-900">{title}</h4>
      <p className="mt-2 text-emerald-800/90">{text}</p>
    </div>
  );
}
function Quote({ text, author }) {
  return (
    <div className="bg-emerald-800/6 p-6 rounded-xl border border-emerald-100/10">
      <p className="italic text-emerald-800/90">“{text}”</p>
      <div className="mt-4 font-semibold text-emerald-900">{author}</div>
    </div>
  );
}
