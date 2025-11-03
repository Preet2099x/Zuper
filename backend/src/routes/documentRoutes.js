// src/routes/documentRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadDocument,
  getCustomerDocuments,
  getPendingDocuments,
  getAllDocuments,
  verifyDocument,
  rejectDocument
} from "../controllers/documentController.js";
import { protectCustomer, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for document uploads
const documentStorage = multer.memoryStorage();
const documentUpload = multer({
  storage: documentStorage,
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

// Customer routes
router.post("/upload", protectCustomer, documentUpload.single("documentImage"), uploadDocument);
router.get("/customer", protectCustomer, getCustomerDocuments);

// Admin routes
router.get("/pending", protectAdmin, getPendingDocuments);
router.get("/all", protectAdmin, getAllDocuments);
router.put("/:id/verify", protectAdmin, verifyDocument);
router.put("/:id/reject", protectAdmin, rejectDocument);

export default router;