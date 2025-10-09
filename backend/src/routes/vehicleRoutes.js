import express from "express";
import {
  createVehicle,
  getProviderVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  searchVehicles
} from "../controllers/vehicleController.js";
import { protectProvider, protectCustomer } from "../middleware/authMiddleware.js";

const router = express.Router();

// Provider routes (protected)
router.post("/", protectProvider, createVehicle);
router.get("/my-vehicles", protectProvider, getProviderVehicles);
router.put("/:id", protectProvider, updateVehicle);
router.delete("/:id", protectProvider, deleteVehicle);

// Public/Customer routes
router.get("/search", searchVehicles);
router.get("/:id", getVehicleById);

export default router;
