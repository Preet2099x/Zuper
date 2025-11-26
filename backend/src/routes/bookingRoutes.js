import express from "express";
import {
  createBookingRequest,
  getCustomerBookings,
  getProviderBookingRequests,
  approveBookingRequest,
  rejectBookingRequest,
  getBookingRequestById,
  cancelBookingRequest,
  signContract,
  rejectContract,
  getContractById,
  getCustomerContracts
} from "../controllers/bookingController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer routes - Bookings
router.post("/", protectCustomer, createBookingRequest);
router.get("/customer/my-bookings", protectCustomer, getCustomerBookings);
router.get("/customer/:bookingId", protectCustomer, getBookingRequestById);
router.put("/customer/:bookingId/cancel", protectCustomer, cancelBookingRequest);

// Customer routes - Contracts
router.get("/customer/contracts", protectCustomer, getCustomerContracts);
router.get("/contracts/:contractId", protectCustomer, getContractById);
router.put("/contracts/:contractId/sign", protectCustomer, signContract);
router.put("/contracts/:contractId/reject", protectCustomer, rejectContract);

// Provider routes (messages)
router.get("/provider/messages", protectProvider, getProviderBookingRequests);
router.put("/provider/:bookingId/approve", protectProvider, approveBookingRequest);
router.put("/provider/:bookingId/reject", protectProvider, rejectBookingRequest);

export default router;
