import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
import { uploadImageToAzure } from "../config/azure.js";

// Get customer profile
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password -emailVerificationCode -phoneVerificationCode");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, dob, address } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        dob,
        address
      },
      { new: true }
    ).select("-password -emailVerificationCode -phoneVerificationCode");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Profile updated successfully", customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get provider profile
export const getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findById(req.user.id).select("-password -emailVerificationCode -phoneVerificationCode");
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update provider profile
export const updateProviderProfile = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      businessName,
      contactEmail,
      businessAddress,
      businessDescription,
      website,
      taxId,
      insuranceProvider,
      policyNumber,
      licenseNumber,
      operatingHours,
      bankName,
      accountNumber,
      routingNumber,
      paypalEmail,
      autoPayout,
      payoutSchedule
    } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Handle business logo upload
    let businessLogoUrl = undefined;
    if (req.file) {
      try {
        businessLogoUrl = await uploadImageToAzure(
          req.file.buffer, 
          req.file.originalname, 
          req.file.mimetype
        );
      } catch (uploadError) {
        console.error("Business logo upload error:", uploadError);
        return res.status(400).json({ message: "Failed to upload business logo", error: uploadError.message });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      phone,
      businessName,
      contactEmail,
      businessAddress,
      businessDescription,
      website,
      taxId,
      insuranceProvider,
      policyNumber,
      licenseNumber,
      operatingHours,
      bankName,
      accountNumber,
      routingNumber,
      paypalEmail,
      autoPayout,
      payoutSchedule
    };

    // Only update businessLogo if a new file was uploaded
    if (businessLogoUrl) {
      updateData.businessLogo = businessLogoUrl;
    }

    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password -emailVerificationCode -phoneVerificationCode");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Profile updated successfully", provider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
