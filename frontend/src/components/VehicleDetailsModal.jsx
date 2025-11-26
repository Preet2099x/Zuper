import React from 'react';

const VehicleDetailsModal = ({ vehicle, isOpen, onClose }) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="brutal-card bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-purple-400 border-b-3 border-black p-6 z-10">
          <div className="flex justify-between items-center">
            <h2 className="brutal-heading text-2xl">🚗 VEHICLE DETAILS</h2>
            <button
              onClick={onClose}
              className="text-3xl font-black hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Vehicle Image */}
          <div className="mb-6">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[0]}
                alt={`${vehicle.company} ${vehicle.model}`}
                className="w-full h-64 object-cover border-3 border-black"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-cyan-200 to-purple-200 border-3 border-black flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-2">
                    {vehicle.type === 'bike' && '🏍️'}
                    {vehicle.type === 'scooter' && '🛵'}
                    {vehicle.type === 'car' && '🚗'}
                    {!vehicle.type && '🚗'}
                  </div>
                  <p className="font-black uppercase text-xs">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="brutal-card-sm bg-white p-4">
                <h3 className="brutal-heading text-sm mb-3">📋 BASIC INFO</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold">Vehicle:</span>
                    <span className="font-black">{vehicle.year} {vehicle.company} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Type:</span>
                    <span className="font-black uppercase">{vehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">License:</span>
                    <span className="font-black">{vehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Status:</span>
                    <span className={`brutal-badge text-[10px] ${
                      vehicle.status === 'available' ? 'bg-green-300' :
                      vehicle.status === 'rented' ? 'bg-yellow-300' :
                      'bg-red-300'
                    }`}>
                      {vehicle.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="brutal-card-sm bg-cyan-300 p-4">
                <h3 className="brutal-heading text-sm mb-2">💰 PRICING</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-black">₹{vehicle.dailyRate}</span>
                  <span className="font-bold ml-2">/day</span>
                </div>
                {vehicle.kmLimit && (
                  <p className="text-xs font-bold mt-2">
                    Includes {vehicle.kmLimit} km/day
                  </p>
                )}
              </div>
            </div>

            {/* Location & Provider */}
            <div className="space-y-4">
              <div className="brutal-card-sm bg-white p-4">
                <h3 className="brutal-heading text-sm mb-2">📍 LOCATION</h3>
                <p className="font-bold text-xs">{vehicle.location}</p>
              </div>

              {/* Provider Info */}
              {vehicle.provider && (
                <div className="brutal-card-sm bg-purple-200 p-4">
                  <h3 className="brutal-heading text-sm mb-3">👤 PROVIDER</h3>
                  <div className="space-y-2 text-xs">
                    <p className="font-black">{vehicle.provider.businessName || vehicle.provider.name}</p>
                    {vehicle.provider.email && (
                      <p className="font-bold">📧 {vehicle.provider.email}</p>
                    )}
                    {vehicle.provider.phone && (
                      <p className="font-bold">📞 {vehicle.provider.phone}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mb-6 brutal-card-sm bg-white p-4">
              <h3 className="brutal-heading text-sm mb-2">📝 DESCRIPTION</h3>
              <p className="text-xs font-bold leading-relaxed">{vehicle.description}</p>
            </div>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mb-6 brutal-card-sm bg-yellow-100 p-4">
              <h3 className="brutal-heading text-sm mb-3">⭐ FEATURES</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vehicle.features.map((feature, index) => (
                  <div key={index} className="brutal-badge bg-white text-[10px] px-2 py-1">
                    ✓ {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Images */}
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="mb-6">
              <h3 className="brutal-heading text-sm mb-3">📸 GALLERY</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicle.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${vehicle.company} ${vehicle.model} ${index + 1}`}
                    className="w-full h-32 object-cover border-3 border-black"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-3 border-black">
            <button
              className="flex-1 brutal-btn bg-green-300 hover:bg-green-400 disabled:bg-gray-300 disabled:opacity-50 py-3 text-sm"
              disabled={vehicle.status !== 'available'}
            >
              {vehicle.status === 'available' ? '📅 BOOK NOW' : '❌ NOT AVAILABLE'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 brutal-btn bg-red-300 hover:bg-red-400 py-3 text-sm"
            >
              ✕ CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
