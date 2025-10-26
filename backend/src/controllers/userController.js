import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";

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
    const { name, phone, businessName } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        businessName
      },
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
