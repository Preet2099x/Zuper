import React, { useState } from 'react';

const VehicleEditModal = ({ vehicle, onClose, onSave }) => {
  const [form, setForm] = useState({
    company: vehicle.company || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    licensePlate: vehicle.licensePlate || '',
    status: vehicle.status || 'available',
    dailyRate: vehicle.dailyRate || '',
    location: vehicle.location || '',
    type: vehicle.type || 'car',
    description: vehicle.description || '',
    features: vehicle.features ? vehicle.features.join(', ') : '',
  });

  const [images, setImages] = useState(vehicle.images || []);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    // Validate number of images
    if (images.length + newImageFiles.length + files.length > 10) {
      alert('You can upload a maximum of 10 images total');
      return;
    }

    try {
      const validFiles = [];
      const previews = [];

      for (const file of files) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Check size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum 5MB allowed.`);
          continue;
        }

        validFiles.push(file);

        // Create preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            previews.push({ url: reader.result, isNew: true, fileName: file.name });
            resolve();
          };
        });
      }

      if (validFiles.length > 0) {
        setNewImageFiles((prev) => [...prev, ...validFiles]);
        setImagePreviews((prev) => [...prev, ...previews]);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to process images. Please try again.');
    }
  };

  const handleRemoveImage = (index) => {
    // Check if it's a new image or existing
    const totalExisting = images.length;
    if (index < totalExisting) {
      // Removing existing image
      setImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing new image
      const newIndex = index - totalExisting;
      setNewImageFiles((prev) => prev.filter((_, i) => i !== newIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add vehicle data
      formDataToSend.append('company', form.company);
      formDataToSend.append('model', form.model);
      formDataToSend.append('year', form.year);
      formDataToSend.append('licensePlate', form.licensePlate);
      formDataToSend.append('status', form.status);
      formDataToSend.append('dailyRate', form.dailyRate);
      formDataToSend.append('location', form.location);
      formDataToSend.append('type', form.type);
      formDataToSend.append('description', form.description);
      formDataToSend.append('features', JSON.stringify(form.features.split(',').map(f => f.trim()).filter(f => f)));

      // Add existing images
      formDataToSend.append('images', JSON.stringify(images));

      // Add new image files
      newImageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Get token
      const token = localStorage.getItem('token');

  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/vehicles/${vehicle._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update vehicle');
      }

      const result = await response.json();
      onSave(result.vehicle);
    } catch (err) {
      console.error('Edit vehicle error:', err);
      alert('Failed to update vehicle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative my-8">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">Edit Vehicle</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <input name="company" value={form.company} onChange={handleChange} className="border p-2 rounded" placeholder="Company" required />
            <input name="model" value={form.model} onChange={handleChange} className="border p-2 rounded" placeholder="Model" required />
            <input name="year" value={form.year} onChange={handleChange} className="border p-2 rounded" placeholder="Year" required />
            <input name="licensePlate" value={form.licensePlate} onChange={handleChange} className="border p-2 rounded" placeholder="License Plate" required />
            <input name="dailyRate" value={form.dailyRate} onChange={handleChange} className="border p-2 rounded" placeholder="Daily Rate" required />
            <input name="location" value={form.location} onChange={handleChange} className="border p-2 rounded" placeholder="Location" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select name="type" value={form.type} onChange={handleChange} className="border p-2 rounded">
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
            </select>
            <select name="status" value={form.status} onChange={handleChange} className="border p-2 rounded">
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded w-full" placeholder="Description" rows={2} />
          <input name="features" value={form.features} onChange={handleChange} className="border p-2 rounded w-full" placeholder="Features (comma separated)" />

          {/* Image Management */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">Images ({images.length + newImageFiles.length}/10)</h3>

            {/* Existing and New Images Preview */}
            {(images.length > 0 || newImageFiles.length > 0) && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img src={image} alt={`Existing ${index}`} className="w-full h-24 object-cover rounded border border-gray-300" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">Saved</span>
                  </div>
                ))}
                {newImageFiles.map((_, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img src={imagePreviews[index]?.url} alt={`New ${index}`} className="w-full h-24 object-cover rounded border border-blue-300" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(images.length + index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">New</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <label className="block border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:bg-gray-50">
              <div className="text-2xl mb-2">📸</div>
              <p className="text-sm text-gray-600">Click to add more images</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded font-medium">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleEditModal;
