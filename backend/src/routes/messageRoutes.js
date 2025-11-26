import express from "express";
import multer from "multer";
import {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getConversationById,
  getUnreadCount,
  uploadMessageImage
} from "../controllers/messageController.js";
import { protectCustomer, protectProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Customer routes
router.post("/conversations/customer", protectCustomer, getOrCreateConversation);
router.get("/conversations/customer", protectCustomer, getUserConversations);
router.get("/conversations/customer/:id", protectCustomer, getConversationById);
router.get("/conversations/customer/:conversationId/messages", protectCustomer, getConversationMessages);
router.post("/conversations/customer/:conversationId/messages", protectCustomer, sendMessage);
router.get("/unread/customer", protectCustomer, getUnreadCount);
router.post("/upload/customer", protectCustomer, upload.single('image'), uploadMessageImage);

// Provider routes
router.post("/conversations/provider", protectProvider, getOrCreateConversation);
router.get("/conversations/provider", protectProvider, getUserConversations);
router.get("/conversations/provider/:conversationId", protectProvider, getConversationById);
router.get("/conversations/provider/:conversationId/messages", protectProvider, getConversationMessages);
router.post("/conversations/provider/:conversationId/messages", protectProvider, sendMessage);
router.get("/unread/provider", protectProvider, getUnreadCount);
router.post("/upload/provider", protectProvider, upload.single('image'), uploadMessageImage);

export default router;
