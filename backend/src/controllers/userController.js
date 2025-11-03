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

// Get all customers (admin only)
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .select("-password -emailVerificationCode -phoneVerificationCode")
      .sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all providers (admin only)
export const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({})
      .select("-password -emailVerificationCode -phoneVerificationCode")
      .sort({ createdAt: -1 });
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete customer (admin only)
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete provider (admin only)
export const deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json({ message: "Provider deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update customer (admin only)
export const adminUpdateCustomer = async (req, res) => {
  try {
    const { name, email, phone, dob, address, isEmailVerified } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        dob,
        address,
        isEmailVerified
      },
      { new: true }
    ).select("-password -emailVerificationCode -phoneVerificationCode");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer updated successfully", customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update provider (admin only)
export const adminUpdateProvider = async (req, res) => {
  try {
    const {
      name,
      email,
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
      payoutSchedule,
      isEmailVerified
    } = req.body;

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
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
        payoutSchedule,
        isEmailVerified
      },
      { new: true }
    ).select("-password -emailVerificationCode -phoneVerificationCode");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider updated successfully", provider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create customer (admin only)
export const adminCreateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, password, isEmailVerified } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this email already exists" });
    }

    // Create new customer
    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address?.trim(),
      password,
      isEmailVerified: isEmailVerified || false
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        isEmailVerified: customer.isEmailVerified,
        createdAt: customer.createdAt
      }
    });
  } catch (error) {
    console.error("Admin create customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create provider (admin only)
export const adminCreateProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      businessAddress,
      password,
      isEmailVerified
    } = req.body;

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ email: email.toLowerCase() });
    if (existingProvider) {
      return res.status(400).json({ message: "Provider with this email already exists" });
    }

    // Create new provider
    const provider = await Provider.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      businessName: businessName?.trim(),
      businessAddress: businessAddress?.trim(),
      password,
      isEmailVerified: isEmailVerified || false
    });

    res.status(201).json({
      message: "Provider created successfully",
      provider: {
        _id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        businessName: provider.businessName,
        businessAddress: provider.businessAddress,
        isEmailVerified: provider.isEmailVerified,
        createdAt: provider.createdAt
      }
    });
  } catch (error) {
    console.error("Admin create provider error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
