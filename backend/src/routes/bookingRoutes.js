import express from "express";
import {
  createBookingRequest,
  getCustomerBookings,
  getProviderBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
  getBookingRequestById,
  cancelBookingRequest
} from "../controllers/bookingController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer routes
router.post("/", protectCustomer, createBookingRequest);
router.get("/customer/my-bookings", protectCustomer, getCustomerBookings);
router.get("/customer/:bookingId", protectCustomer, getBookingRequestById);
router.put("/customer/:bookingId/cancel", protectCustomer, cancelBookingRequest);

// Provider routes (inbox)
router.get("/provider/inbox", protectProvider, getProviderBookingRequests);
router.put("/provider/:bookingId/approve", protectProvider, approveBookingRequest);
router.put("/provider/:bookingId/reject", protectProvider, rejectBookingRequest);

export default router;
