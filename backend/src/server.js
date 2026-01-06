import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from  './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { ensureContainerExists } from "./config/azure.js";
import { createDefaultAdmin } from "./controllers/adminAuthController.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";


// Connect to database
connectDB();

// Initialize Azure Blob Storage container (non-blocking)
ensureContainerExists().catch(err => {
  console.error("Failed to initialize Azure Blob Storage:", err.message);
  // Continue server startup even if Azure initialization fails
});

// Create default admin account (non-blocking)
createDefaultAdmin().catch(err => {
  console.error("Failed to create default admin:", err.message);
});

const app = express();

// Trust proxy for production deployments (Heroku, Railway, etc.)
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://zuper-amber.vercel.app"
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.get('/',(req,res) => {
    res.send('Zuper Backend is running');
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zuper API Documentation'
}));

// API v1 Routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
