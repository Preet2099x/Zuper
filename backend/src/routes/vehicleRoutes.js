import express from "express";
import multer from "multer";
import {
  createVehicle,
  getProviderVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getAllVehicles,
  adminCreateVehicle
} from "../controllers/vehicleController.js";
import { protectProvider, protectCustomer, protectAdmin } from "../middleware/authMiddleware.js";

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

/**
 * @swagger
 * /vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Create a new vehicle listing
 *     description: Providers can list their vehicles with images
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - company
 *               - model
 *               - year
 *               - licensePlate
 *               - dailyRate
 *               - location
 *             properties:
 *               company:
 *                 type: string
 *                 example: Toyota
 *               model:
 *                 type: string
 *                 example: Camry
 *               year:
 *                 type: integer
 *                 example: 2023
 *               licensePlate:
 *                 type: string
 *                 example: KA01AB1234
 *               dailyRate:
 *                 type: number
 *                 example: 2500
 *               location:
 *                 type: string
 *                 example: Bangalore
 *               type:
 *                 type: string
 *                 enum: [car, bike, scooter]
 *               features:
 *                 type: string
 *                 example: '["AC", "GPS", "Bluetooth"]'
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 vehicle:
 *                   $ref: '#/components/schemas/Vehicle'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
// Provider routes (protected)
router.post("/", protectProvider, upload.array("images", 10), createVehicle);

/**
 * @swagger
 * /vehicles/my-vehicles:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get all vehicles for logged-in provider
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of provider's vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/my-vehicles", protectProvider, getProviderVehicles);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get vehicle by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     tags: [Vehicles]
 *     summary: Update vehicle
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               model:
 *                 type: string
 *               dailyRate:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *   delete:
 *     tags: [Vehicles]
 *     summary: Delete vehicle
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 */
router.put("/:id", protectProvider, upload.array("images", 10), updateVehicle);
router.delete("/:id", protectProvider, deleteVehicle);

/**
 * @swagger
 * /vehicles/search:
 *   get:
 *     tags: [Vehicles]
 *     summary: Search vehicles
 *     description: Search vehicles by location, type, company, or model
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [car, bike, scooter]
 *         description: Filter by vehicle type
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company
 *       - in: query
 *         name: minRate
 *         schema:
 *           type: number
 *         description: Minimum daily rate
 *       - in: query
 *         name: maxRate
 *         schema:
 *           type: number
 *         description: Maximum daily rate
 *     responses:
 *       200:
 *         description: List of matching vehicles
 */
// Public/Customer routes
router.get("/search", searchVehicles);
router.get("/:id", getVehicleById);

// Admin routes
router.get("/admin/all", protectAdmin, getAllVehicles);
router.post("/admin/create", protectAdmin, adminCreateVehicle);

export default router;
