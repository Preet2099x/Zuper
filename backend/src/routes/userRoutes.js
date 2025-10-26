import express from "express";
import { 
  getCustomerProfile, 
  updateCustomerProfile,
  getProviderProfile,
  updateProviderProfile
} from "../controllers/userController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get customer profile
router.get("/customer/profile", protectCustomer, getCustomerProfile);

// Update customer profile
router.put("/customer/profile", protectCustomer, updateCustomerProfile);

// Get provider profile
router.get("/provider/profile", protectProvider, getProviderProfile);

// Update provider profile
router.put("/provider/profile", protectProvider, updateProviderProfile);

export default router;
