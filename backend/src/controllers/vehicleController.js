import Vehicle from "../models/Vehicle.js";
import Provider from "../models/Provider.js";
import { uploadImageToAzure, deleteMultipleImagesFromAzure } from "../config/azure.js";

// Create a new vehicle listing
export const createVehicle = async (req, res) => {
  try {
    const {
      company,
      model,
      year,
      licensePlate,
      dailyRate,
      location,
      features,
      description,
      type
    } = req.body;

    // Validate required fields
    if (!company || !model || !year || !licensePlate || !dailyRate || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle with this license plate already exists" });
    }

    // Handle image uploads to Azure
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        imageUrls = await Promise.all(
          req.files.map(file =>
            uploadImageToAzure(file.buffer, file.originalname, file.mimetype)
          )
        );
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ message: "Failed to upload images", error: uploadError.message });
      }
    }

    // Parse features if they come as a JSON string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        parsedFeatures = Array.isArray(features) ? features : [features];
      }
    }

    // Create new vehicle
    const vehicle = await Vehicle.create({
      company: company.trim(),
      model: model.trim(),
      year: parseInt(year),
      licensePlate: licensePlate.toUpperCase().trim(),
      dailyRate: parseFloat(dailyRate),
      location: location.trim(),
      features: parsedFeatures,
      description: description?.trim() || "",
      images: imageUrls,
      type: type || "car",
      provider: req.user.id,
      status: "available"
    });

    // Add vehicle to provider's vehicles array
    await Provider.findByIdAndUpdate(
      req.user.id,
      { $push: { vehicles: vehicle._id } }
    );

    res.status(201).json({
      message: "Vehicle listed successfully",
      vehicle
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all vehicles for a provider
export const getProviderVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ provider: req.user.id }).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error("Get provider vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("provider", "name email phone businessName");
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if the provider owns this vehicle
    if (vehicle.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this vehicle" });
    }

    // Parse features if they come as a JSON string
    let parsedFeatures = vehicle.features || [];
    if (req.body.features) {
      try {
        parsedFeatures = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
      } catch (e) {
        parsedFeatures = Array.isArray(req.body.features) ? req.body.features : [req.body.features];
      }
    }

    // Handle existing and new images
    let imageUrls = [];
    
    // Parse existing images if they come as a JSON string
    if (req.body.images) {
      try {
        imageUrls = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      } catch (e) {
        imageUrls = Array.isArray(req.body.images) ? req.body.images : [];
      }
    }
    
    // Add new uploaded images
    if (req.files && req.files.length > 0) {
      try {
        const newImageUrls = await Promise.all(
          req.files.map(file =>
            uploadImageToAzure(file.buffer, file.originalname, file.mimetype)
          )
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ message: "Failed to upload images", error: uploadError.message });
      }
    }

    // Handle image deletion if imagesToDelete is provided
    if (req.body.imagesToDelete && Array.isArray(req.body.imagesToDelete)) {
      try {
        await deleteMultipleImagesFromAzure(req.body.imagesToDelete);
        imageUrls = imageUrls.filter(url => !req.body.imagesToDelete.includes(url));
      } catch (deleteError) {
        console.error("Image deletion error:", deleteError);
        return res.status(400).json({ message: "Failed to delete images", error: deleteError.message });
      }
    }

    const updateData = { ...req.body, images: imageUrls, features: parsedFeatures };
    delete updateData.imagesToDelete; // Don't store this in the database

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if the provider owns this vehicle
    if (vehicle.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this vehicle" });
    }

    // Delete associated images from Azure
    if (vehicle.images && vehicle.images.length > 0) {
      try {
        await deleteMultipleImagesFromAzure(vehicle.images);
      } catch (deleteError) {
        console.error("Error deleting images from Azure:", deleteError);
        // Continue with deletion even if image deletion fails
      }
    }

    // Remove vehicle from provider's vehicles array
    await Provider.findByIdAndUpdate(
      req.user.id,
      { $pull: { vehicles: vehicle._id } }
    );

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search vehicles (for customers)
export const searchVehicles = async (req, res) => {
  try {
    const { location, type, minRate, maxRate, company, features } = req.query;

    let query = { status: "available" };

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (company) {
      query.company = { $regex: company, $options: "i" };
    }

    if (minRate || maxRate) {
      query.dailyRate = {};
      if (minRate) query.dailyRate.$gte = parseFloat(minRate);
      if (maxRate) query.dailyRate.$lte = parseFloat(maxRate);
    }

    if (features && features.length > 0) {
      const featuresArray = Array.isArray(features) ? features : [features];
      query.features = { $in: featuresArray };
    }

    const vehicles = await Vehicle.find(query)
      .populate("provider", "name businessName phone email")
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error("Search vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all vehicles (admin only)
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({})
      .populate("provider", "name businessName phone email")
      .sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error("Get all vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
};