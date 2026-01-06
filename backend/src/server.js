import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Disable x-powered-by header for security
app.disable('x-powered-by');

// Compression middleware - compress all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
  level: 6 // Balance between speed and compression ratio
}));

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
  crossOriginEmbedderPolicy: false
}));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Global rate limiter (more lenient)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', globalLimiter);

// CORS configuration with optimizations
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://zuper-amber.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Response-Time'],
  maxAge: 86400, // Cache preflight requests for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Body parser with optimized limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add response time header for monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  next();
});


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
