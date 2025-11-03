// src/controllers/documentController.js
import DocumentVerification from "../models/DocumentVerification.js";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";
import { uploadImageToAzure } from "../config/azure.js";

// Customer uploads a document
export const uploadDocument = async (req, res) => {
  try {
    const { documentType, aadharNumber, licenseNumber } = req.body;
    const customerId = req.user.id;

    // Validate document type
    if (!["license", "aadhar"].includes(documentType)) {
      return res.status(400).json({ message: "Invalid document type. Must be 'license' or 'aadhar'" });
    }

    // Validate required fields based on document type
    if (documentType === "aadhar" && !aadharNumber) {
      return res.status(400).json({ message: "Aadhar number is required" });
    }
    if (documentType === "license" && !licenseNumber) {
      return res.status(400).json({ message: "License number is required" });
    }

    // Validate format (basic validation)
    if (documentType === "aadhar" && !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ message: "Aadhar number must be 12 digits" });
    }
    if (documentType === "license" && !licenseNumber.trim()) {
      return res.status(400).json({ message: "License number is required" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Document image is required" });
    }

    // Upload image to Azure
    let documentImageUrl;
    try {
      documentImageUrl = await uploadImageToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (uploadError) {
      console.error("Document upload error:", uploadError);
      return res.status(400).json({ message: "Failed to upload document image", error: uploadError.message });
    }

    // Prepare document data
    const documentData = {
      customer: customerId,
      documentType,
      documentImage: documentImageUrl,
      status: "processing"
    };

    if (documentType === "aadhar") {
      documentData.aadharNumber = aadharNumber;
    } else if (documentType === "license") {
      documentData.licenseNumber = licenseNumber;
    }

    // Check if document already exists for this customer and type
    const existingDocument = await DocumentVerification.findOne({
      customer: customerId,
      documentType
    });

    if (existingDocument) {
      // Update existing document
      existingDocument.documentImage = documentImageUrl;
      existingDocument.status = "processing";
      existingDocument.adminNotes = "";
      existingDocument.verifiedAt = undefined;
      existingDocument.verifiedBy = undefined;

      if (documentType === "aadhar") {
        existingDocument.aadharNumber = aadharNumber;
      } else if (documentType === "license") {
        existingDocument.licenseNumber = licenseNumber;
      }

      await existingDocument.save();

      res.json({
        message: "Document updated successfully",
        document: existingDocument
      });
    } else {
      // Create new document verification request
      const document = await DocumentVerification.create(documentData);

      res.status(201).json({
        message: "Document uploaded successfully",
        document
      });
    }
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get customer's documents status
export const getCustomerDocuments = async (req, res) => {
  try {
    const customerId = req.user.id;

    const documents = await DocumentVerification.find({ customer: customerId })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get customer documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all pending documents (admin only)
export const getPendingDocuments = async (req, res) => {
  try {
    const documents = await DocumentVerification.find({ status: "processing" })
      .populate("customer", "name email phone")
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get pending documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all documents with filtering (admin only)
export const getAllDocuments = async (req, res) => {
  try {
    const { status, documentType } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (documentType) filter.documentType = documentType;

    const documents = await DocumentVerification.find(filter)
      .populate("customer", "name email phone")
      .populate("verifiedBy", "name email")
      .select("-__v")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Get all documents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin verifies a document
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.admin.id;

    const document = await DocumentVerification.findByIdAndUpdate(
      id,
      {
        status: "verified",
        adminNotes: adminNotes || "",
        verifiedAt: new Date(),
        verifiedBy: adminId
      },
      { new: true }
    ).populate("customer", "name email phone");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      message: "Document verified successfully",
      document
    });
  } catch (error) {
    console.error("Verify document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin rejects a document
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.admin.id;

    if (!adminNotes || adminNotes.trim().length === 0) {
      return res.status(400).json({ message: "Admin notes are required when rejecting a document" });
    }

    const document = await DocumentVerification.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        adminNotes: adminNotes.trim(),
        verifiedAt: new Date(),
        verifiedBy: adminId
      },
      { new: true }
    ).populate("customer", "name email phone");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({
      message: "Document rejected",
      document
    });
  } catch (error) {
    console.error("Reject document error:", error);
    res.status(500).json({ message: "Server error" });
  }
};