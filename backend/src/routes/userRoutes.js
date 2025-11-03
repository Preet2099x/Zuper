import express from "express";
import multer from "multer";
import { 
  getCustomerProfile, 
  updateCustomerProfile,
  getProviderProfile,
  updateProviderProfile
} from "../controllers/userController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for logo uploads
const logoStorage = multer.memoryStorage();
const logoUpload = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Get customer profile
router.get("/customer/profile", protectCustomer, getCustomerProfile);

// Update customer profile
router.put("/customer/profile", protectCustomer, updateCustomerProfile);

// Get provider profile
router.get("/provider/profile", protectProvider, getProviderProfile);

// Update provider profile (with logo upload support)
router.put("/provider/profile", protectProvider, logoUpload.single("businessLogo"), updateProviderProfile);

export default router;
