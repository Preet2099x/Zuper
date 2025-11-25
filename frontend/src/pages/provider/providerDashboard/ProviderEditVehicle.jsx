import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProviderEditVehicle = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  
  const [formData, setFormData] = useState({
    company: '',
    model: '',
    year: '',
    type: 'car',
    licensePlate: '',
    dailyRate: '',
    location: '',
    features: [],
    description: '',
    images: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const availableFeatures = [
    'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Heated Seats',
    'Sunroof', 'Backup Camera', 'Parking Sensors', 'Premium Sound System',
    'Cruise Control', 'Apple CarPlay', 'Android Auto', 'Roof Rack',
    'All-Wheel Drive', 'Fuel Efficient', 'Electric Vehicle', 'Luxury Package'
  ];

  useEffect(() => {
    fetchVehicleData();
  }, [vehicleId]);

  const fetchVehicleData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/provider/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle data');
      }

      const data = await response.json();
      
      setFormData({
        company: data.company || '',
        model: data.model || '',
        year: data.year?.toString() || '',
        type: data.type || 'car',
        licensePlate: data.licensePlate || '',
        dailyRate: data.dailyRate?.toString() || '',
        location: data.location || '',
        description: data.description || '',
        images: data.images || []
      });

      setSelectedFeatures(data.features || []);
      setExistingImages(data.images || []);
      setImagePreviews(data.images || []);
      setFetchLoading(false);
    } catch (err) {
      console.error('Fetch vehicle error:', err);
      setError('Failed to load vehicle data');
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'year') {
      const yearValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      setFormData(prev => ({
        ...prev,
        [name]: yearValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (existingImages.length + imageFiles.length + files.length > 10) {
      setError('You can upload a maximum of 10 images');
      return;
    }

    setError('Processing images...');

    try {
      const validFiles = [];
      const previews = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        const compressedBlob = await compressImage(file);
        
        if (compressedBlob.size > 5 * 1024 * 1024) {
          setError(`${file.name} is too large even after compression`);
          continue;
        }

        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        validFiles.push(compressedFile);

        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            previews.push(reader.result);
            resolve();
          };
        });
      }

      if (validFiles.length > 0) {
        setImageFiles(prev => [...prev, ...validFiles]);
        setImagePreviews(prev => [...existingImages, ...prev.filter(p => !existingImages.includes(p)), ...previews]);
        setError('');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to process images. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    if (index < existingImages.length) {
      // Removing existing image
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing new image
      const newImageIndex = index - existingImages.length;
      setImageFiles(prev => prev.filter((_, i) => i !== newImageIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.company || !formData.model || !formData.year || 
          !formData.licensePlate || !formData.dailyRate || !formData.location) {
        setError('Please fill in all required fields');
        return;
      }
      
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 2000 || year > 2030) {
        setError('Please enter a valid year between 2000 and 2030');
        return;
      }
      
      const rate = parseFloat(formData.dailyRate);
      if (isNaN(rate) || rate <= 0) {
        setError('Please enter a valid daily rate');
        return;
      }
      
      setError('');
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update vehicle');
        navigate('/provider/login');
        return;
      }

      const year = parseInt(formData.year);
      const dailyRate = parseFloat(formData.dailyRate);
      
      if (isNaN(year) || year < 2000 || year > 2030) {
        setError('Invalid year. Please enter a year between 2000 and 2030');
        setLoading(false);
        return;
      }
      
      if (isNaN(dailyRate) || dailyRate <= 0) {
        setError('Invalid daily rate. Please enter a valid amount');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      formDataToSend.append('company', formData.company);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', year);
      formDataToSend.append('licensePlate', formData.licensePlate);
      formDataToSend.append('dailyRate', dailyRate);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('features', JSON.stringify(selectedFeatures));
      formDataToSend.append('images', JSON.stringify(existingImages));
      
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update vehicle');
      }

      setSuccess('Vehicle updated successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard/provider/my-vehicles');
      }, 2000);

    } catch (err) {
      console.error('Update vehicle error:', err);
      setError(err.message || 'Failed to update vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Vehicle details and pricing' },
    { number: 2, title: 'Features & Images', description: 'Add features and update images' },
    { number: 3, title: 'Review & Update', description: 'Review and update your vehicle' }
  ];

  if (fetchLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center brutal-card bg-white p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-4"></div>
          <p className="font-black uppercase text-sm text-gray-900">Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="brutal-heading text-3xl mb-8">✏️ EDIT VEHICLE</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 brutal-card bg-red-300 border-3 border-black p-4">
          <span className="font-black uppercase text-sm text-black">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 brutal-card bg-green-300 border-3 border-black p-4">
          <span className="font-black uppercase text-sm text-black">{success}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 border-3 border-black font-black text-lg ${
                currentStep >= step.number
                  ? 'bg-purple-400 text-black'
                  : 'bg-white text-gray-400'
              }`}>
                {step.number}
              </div>
              <div className="ml-4">
                <p className={`font-black uppercase text-xs ${
                  currentStep >= step.number ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs font-bold text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-4 border-2 ${
                  currentStep > step.number ? 'bg-purple-400 border-purple-400' : 'bg-gray-200 border-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="brutal-card bg-white p-8">
          <h2 className="brutal-heading text-2xl mb-6">📋 BASIC INFORMATION</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="e.g., Maruti Suzuki, Hero, TVS"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., Swift, Splendor, Jupiter"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Year *</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
                maxLength="4"
                pattern="[0-9]{4}"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
              <p className="text-xs font-bold text-gray-600 mt-1">Enter a 4-digit year (2000-2030)</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Vehicle Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border-3 border-black font-bold bg-white focus:ring-0 focus:border-purple-400"
                required
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">License Plate *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="e.g., ABC-1234"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Daily Rate (₹) *</label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleInputChange}
                placeholder="e.g., 2500"
                min="1"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-900 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Connaught Place, New Delhi"
                className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-black uppercase text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your vehicle, its condition, and any special features..."
              rows={4}
              className="w-full p-3 border-3 border-black font-bold focus:ring-0 focus:border-purple-400"
            />
          </div>
        </div>
      )}

      {/* Step 2: Features & Images */}
      {currentStep === 2 && (
        <div className="brutal-card bg-white p-8">
          <h2 className="brutal-heading text-2xl mb-6">⭐ FEATURES & IMAGES</h2>

          <div className="mb-8">
            <label className="block text-xs font-black uppercase text-gray-900 mb-4">Select Features</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableFeatures.map((feature, index) => (
                <label key={index} className="brutal-card-sm bg-white p-3 flex items-center space-x-2 cursor-pointer hover:bg-purple-100">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 border-2 border-black text-purple-600 focus:ring-0"
                  />
                  <span className="text-xs font-bold text-gray-900">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t-3 border-black pt-8">
            <h3 className="brutal-heading text-lg mb-2">
              📸 VEHICLE IMAGES
            </h3>
            <p className="text-xs font-black uppercase text-green-700 mb-4">(Azure Cloud Storage)</p>
            
            {/* Upload Area */}
            <div className="brutal-card-sm border-dashed bg-white p-8 text-center hover:bg-purple-50 transition-colors cursor-pointer">
              <div className="text-5xl mb-4">📸</div>
              <p className="font-bold text-sm text-gray-900 mb-3 uppercase">Drag and drop images here or click to browse</p>
              <p className="text-xs font-bold text-gray-600 mb-4">
                Maximum 10 images total. Images will be stored securely in Azure Blob Storage.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="brutal-btn bg-purple-300 hover:bg-purple-400 text-black py-3 px-6 cursor-pointer inline-block"
              >
                📁 ADD MORE IMAGES
              </label>
              <p className="text-xs font-black text-gray-700 mt-3 uppercase">
                {imagePreviews.length}/10 images
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <h4 className="brutal-heading text-sm mb-4">✅ VEHICLE IMAGES</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group brutal-card-sm p-0 overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white border-2 border-black p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 brutal-badge bg-black text-white text-xs px-2 py-1 border-2 border-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Update */}
      {currentStep === 3 && (
        <div className="brutal-card bg-white p-8">
          <h2 className="brutal-heading text-2xl mb-6">✅ REVIEW & UPDATE</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="brutal-card-sm bg-purple-50 p-5">
                <h3 className="brutal-heading text-lg mb-4">🚗 VEHICLE DETAILS</h3>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Company:</span> {formData.company || 'Not specified'}</p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Model:</span> {formData.model || 'Not specified'}</p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Year:</span> {formData.year || 'Not specified'}</p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Type:</span> <span className="capitalize">{formData.type || 'Not specified'}</span></p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">License Plate:</span> {formData.licensePlate || 'Not specified'}</p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Daily Rate:</span> ₹{formData.dailyRate || 'Not specified'}</p>
                  <p className="text-xs font-bold text-gray-700"><span className="font-black uppercase">Location:</span> {formData.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="brutal-card-sm bg-cyan-50 p-5">
                <h3 className="brutal-heading text-lg mb-4">⭐ FEATURES</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.length > 0 ? (
                    selectedFeatures.map((feature, index) => (
                      <span key={index} className="brutal-badge bg-purple-300 text-xs">
                        {feature}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-bold text-gray-600 uppercase">No features selected</p>
                  )}
                </div>
              </div>
            </div>

            {formData.description && (
              <div className="brutal-card-sm bg-white p-5">
                <h3 className="brutal-heading text-lg mb-3">📝 DESCRIPTION</h3>
                <p className="text-xs font-bold text-gray-700 bg-gray-50 p-4 border-2 border-gray-200">{formData.description}</p>
              </div>
            )}

            {imagePreviews.length > 0 && (
              <div className="brutal-card-sm bg-white p-5">
                <h3 className="brutal-heading text-lg mb-4">📸 VEHICLE IMAGES ({imagePreviews.length})</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative brutal-card-sm p-0 overflow-hidden">
                      <img
                        src={preview}
                        alt={`Vehicle ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute bottom-1 left-1 brutal-badge bg-black text-white text-xs px-2 py-1 border-2 border-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-3 border-black pt-6">
              <div className="flex items-center space-x-4 brutal-card-sm bg-purple-50 p-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-5 h-5 border-3 border-black text-purple-600 focus:ring-0"
                  required
                />
                <label htmlFor="terms" className="text-xs font-black uppercase text-gray-900">
                  I confirm that all updated information is accurate.
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="brutal-btn bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 text-black py-4 px-8"
        >
          ⬅ PREVIOUS
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="brutal-btn bg-purple-400 hover:bg-purple-500 text-black py-4 px-8"
          >
            NEXT ➡
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="brutal-btn bg-green-400 hover:bg-green-500 disabled:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50 text-black py-4 px-8"
          >
            {loading ? '⏳ UPDATING VEHICLE...' : '✅ UPDATE VEHICLE'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProviderEditVehicle;
