import express from "express";
import { getCustomerProfile, getProviderProfile } from "../controllers/userController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get customer profile
router.get("/customer/profile", protectCustomer, getCustomerProfile);

// Get provider profile
router.get("/provider/profile", protectProvider, getProviderProfile);

export default router;
