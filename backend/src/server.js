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
import { ensureContainerExists } from "./config/azure.js";
import { createDefaultAdmin } from "./controllers/adminAuthController.js";


connectDB();

// Initialize Azure Blob Storage container
ensureContainerExists().catch(err => {
  console.error("Failed to initialize Azure Blob Storage:", err.message);
  // Continue server startup even if Azure initialization fails
});

// Create default admin account
createDefaultAdmin();

const app = express();
app.use(cors());
app.use(express.json());

const allowed = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(cors({ origin: allowed })); // allow Vite dev server

app.get('/',(req,res) => {
    res.send('Zuper Backend is running');
});

app.use("/api/test", testRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
