import express from "express";
import multer from "multer";
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

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory to pass to Azure
const upload = multer({
  storage: storage,
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

// Provider routes (protected)
router.post("/", protectProvider, upload.array("images", 10), createVehicle);
router.get("/my-vehicles", protectProvider, getProviderVehicles);
router.put("/:id", protectProvider, upload.array("images", 10), updateVehicle);
router.delete("/:id", protectProvider, deleteVehicle);

// Public/Customer routes
router.get("/search", searchVehicles);
router.get("/:id", getVehicleById);

export default router;
