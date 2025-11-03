import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { code, password } = req.body;

    // Validate input
    if (!code || !password) {
      return res.status(400).json({ message: "Code and password are required" });
    }

    // Check if admin exists with the code as name
    const admin = await Admin.findOne({ name: code });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create default admin (for initial setup)
export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ name: "BigBoss" });
    if (existingAdmin) {
      console.log("Default admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin123", 10);

    const admin = await Admin.create({
      name: "BigBoss",
      email: "admin@zuper.com",
      password: hashedPassword,
      permissions: ["manage_accounts", "manage_vehicles", "view_reports"]
    });

    console.log("Default admin created:", admin.name);
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};