import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
import { BlobServiceClient } from "@azure/storage-blob";
import crypto from "crypto";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = "message-images";

// Get or create a conversation between customer and provider
export const getOrCreateConversation = async (req, res) => {
  try {
    const { providerId } = req.body;
    const customerId = req.user.id;

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      customer: customerId,
      provider: providerId
    }).populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName phone" },
      { path: "lastMessage" }
    ]);

    if (!conversation) {
      conversation = await Conversation.create({
        customer: customerId,
        provider: providerId
      });

      conversation = await Conversation.findById(conversation._id).populate([
        { path: "customer", select: "name email phone" },
        { path: "provider", select: "name email businessName phone" },
        { path: "lastMessage" }
      ]);
    }

    res.json(conversation);
  } catch (error) {
    console.error("Get/Create conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all conversations for a user (customer or provider)
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // 'customer' or 'provider'

    const query = userRole === 'customer' 
      ? { customer: userId }
      : { provider: userId };

    const conversations = await Conversation.find(query)
      .populate([
        { path: "customer", select: "name email phone" },
        { path: "provider", select: "name email businessName phone" },
        { path: "lastMessage" }
      ])
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get messages for a conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify user has access to this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const hasAccess = userRole === 'customer'
      ? conversation.customer.toString() === userId
      : conversation.provider.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate([
        { path: "sender", select: "name email businessName" }
      ]);

    // Mark messages as read if they're for the current user
    const otherUserRole = userRole === 'customer' ? 'Provider' : 'Customer';
    await Message.updateMany(
      {
        conversation: conversationId,
        senderModel: otherUserRole,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Send a message in a conversation
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType, imageUrl } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate that either content or imageUrl is provided
    if (messageType === "image" && !imageUrl) {
      return res.status(400).json({ message: "Image URL is required for image messages" });
    }
    if (messageType === "text" && (!content || !content.trim())) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify conversation exists and user has access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const hasAccess = userRole === 'customer'
      ? conversation.customer.toString() === userId
      : conversation.provider.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized to send messages in this conversation" });
    }

    // Create message
    const senderModel = userRole === 'customer' ? 'Customer' : 'Provider';
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      senderModel: senderModel,
      content: content?.trim() || "",
      messageType: messageType || "text",
      imageUrl: imageUrl || null
    });

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info
    const populatedMessage = await Message.findById(message._id).populate([
      { path: "sender", select: "name email businessName" }
    ]);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single conversation details
export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const conversation = await Conversation.findById(conversationId).populate([
      { path: "customer", select: "name email phone" },
      { path: "provider", select: "name email businessName phone" },
      { path: "lastMessage" }
    ]);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify access
    const hasAccess = userRole === 'customer'
      ? conversation.customer._id.toString() === userId
      : conversation.provider._id.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get user's conversations
    const query = userRole === 'customer' 
      ? { customer: userId }
      : { provider: userId };

    const conversations = await Conversation.find(query).select('_id');
    const conversationIds = conversations.map(c => c._id);

    // Count unread messages from other users
    const otherUserRole = userRole === 'customer' ? 'Provider' : 'Customer';
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      senderModel: otherUserRole,
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Upload image to Azure Blob Storage
export const uploadMessageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Generate unique blob name
    const blobName = `${crypto.randomUUID()}-${Date.now()}-${req.file.originalname}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: "blob" // Public read access for blobs
    });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload the file
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype
      }
    });

    // Get the URL
    const imageUrl = blockBlobClient.url;

    res.json({
      message: "Image uploaded successfully",
      imageUrl,
      blobName
    });
  } catch (error) {
    console.error("Upload message image error:", error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};
