import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderListVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    model: '',
    year: '',
    type: 'car', // Default to car
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const availableFeatures = [
    'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Heated Seats',
    'Sunroof', 'Backup Camera', 'Parking Sensors', 'Premium Sound System',
    'Cruise Control', 'Apple CarPlay', 'Android Auto', 'Roof Rack',
    'All-Wheel Drive', 'Fuel Efficient', 'Electric Vehicle', 'Luxury Package'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for year field to ensure it's a valid number
    if (name === 'year') {
      // Only allow numbers and limit to 4 digits
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

          // Resize if image is too large
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
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
    
    // Validate number of images
    if (imageFiles.length + files.length > 10) {
      setError('You can upload a maximum of 10 images');
      return;
    }

    setError('Processing images...');

    try {
      const validFiles = [];
      const previews = [];

      for (const file of files) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Check compressed size (if still too large, skip)
        if (compressedBlob.size > 5 * 1024 * 1024) {
          setError(`${file.name} is too large even after compression`);
          continue;
        }

        // Convert blob to file
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        validFiles.push(compressedFile);

        // Create preview
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
        setImagePreviews(prev => [...prev, ...previews]);
        setError('');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to process images. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    // Validate Step 1 required fields
    if (currentStep === 1) {
      if (!formData.company || !formData.model || !formData.year || 
          !formData.licensePlate || !formData.dailyRate || !formData.location) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Validate year range
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 2000 || year > 2030) {
        setError('Please enter a valid year between 2000 and 2030');
        return;
      }
      
      // Validate daily rate
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
        setError('Please login to list a vehicle');
        navigate('/provider/login');
        return;
      }

      // Final validation before submission
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

      // Create FormData to send both vehicle data and images
      const formDataToSend = new FormData();
      
      // Add vehicle data
      formDataToSend.append('company', formData.company);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', year);
      formDataToSend.append('licensePlate', formData.licensePlate);
      formDataToSend.append('dailyRate', dailyRate);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      
      // Add features as JSON string
      formDataToSend.append('features', JSON.stringify(selectedFeatures));
      
      // Add image files
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      console.log('Submitting vehicle data with images:', { company: formData.company, imageCount: imageFiles.length });

      const response = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to list vehicle');
      }

      setSuccess('Vehicle listed successfully! Redirecting...');
      
      // Reset form
      setFormData({
        company: '',
        model: '',
        year: '',
        licensePlate: '',
        dailyRate: '',
        location: '',
        features: [],
        description: '',
        images: []
      });
      setSelectedFeatures([]);
      setImageFiles([]);
      setImagePreviews([]);
      setCurrentStep(1);

      // Redirect to my vehicles page after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/provider/my-vehicles');
      }, 2000);

    } catch (err) {
      console.error('Submit vehicle error:', err);
      setError(err.message || 'Failed to list vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Vehicle details and pricing' },
    { number: 2, title: 'Features & Location', description: 'Add features and set location' },
    { number: 3, title: 'Review & Submit', description: 'Review and list your vehicle' }
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">List New Vehicle</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.number}
                </div>
                <div className="ml-4">
                  <p className={`font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., Maruti Suzuki, Hero, TVS"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Swift, Splendor, Jupiter"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024"
                  maxLength="4"
                  pattern="[0-9]{4}"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a 4-digit year (2000-2030)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC-1234"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (₹) *</label>
                <input
                  type="number"
                  name="dailyRate"
                  value={formData.dailyRate}
                  onChange={handleInputChange}
                  placeholder="e.g., 2500"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Connaught Place, New Delhi"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your vehicle, its condition, and any special features..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Features & Location */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features & Equipment</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Select Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableFeatures.map((feature, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vehicle Images 
                <span className="text-sm text-green-600 font-normal ml-2">(Azure Cloud Storage)</span>
              </h3>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-600 mb-4">Drag and drop images here or click to browse</p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum 10 images, up to 5MB each. Images will be stored securely in Azure Blob Storage.
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
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
                >
                  Choose Images
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  {imageFiles.length}/10 images selected
                </p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Uploaded Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
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

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Review & Submit</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Company:</span> {formData.company || 'Not specified'}</p>
                    <p><span className="font-medium">Model:</span> {formData.model || 'Not specified'}</p>
                    <p><span className="font-medium">Year:</span> {formData.year || 'Not specified'}</p>
                    <p><span className="font-medium">Type:</span> <span className="capitalize">{formData.type || 'Not specified'}</span></p>
                    <p><span className="font-medium">License Plate:</span> {formData.licensePlate || 'Not specified'}</p>
                    <p><span className="font-medium">Daily Rate:</span> ₹{formData.dailyRate || 'Not specified'}</p>
                    <p><span className="font-medium">Location:</span> {formData.location || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeatures.length > 0 ? (
                      selectedFeatures.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {feature}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No features selected</p>
                    )}
                  </div>
                </div>
              </div>

              {formData.description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{formData.description}</p>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Vehicle Images ({imagePreviews.length})</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the terms and conditions and confirm that all information provided is accurate.
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
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              {loading ? 'Listing Vehicle...' : 'List Vehicle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderListVehicle;