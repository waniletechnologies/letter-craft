import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/database.js";
import globalErrorHandler from "./src/middlewares/errorHandler.js";
import routes from "./src/routes/index.js";
import { seedUser } from "./src/seed/seedUser.js";
import authRoutes from "./src/routes/auth.route.js";
import letterRoute from "./src/routes/letter.route.js";
import creditReport from "./src/routes/creditReport.route.js";
import accountGroupRoutes from "./src/routes/accountGroup.route.js";
import disputeRoutes from "./src/routes/dispute.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

const allowedOrigins = [
  "http://localhost:3000",
  "https://lettercraft.wanile.dev",
];


app.set("trust proxy", true);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // allow request
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Letter Craft API'
  });
});
app.use((req, res, next) => {
  const mockId = req.header('x-user-id');
  if (mockId) req.user = { id: String(mockId) };
  next();
});
// API routes
app.use('/api/auth', authRoutes);
app.use('/api', routes);
app.use("/api", letterRoute);
app.use("/api", creditReport);
app.use("/api", accountGroupRoutes);
app.use("/api/disputes", disputeRoutes);

// 404 handler for undefined routes - Fixed the wildcard issue
app.use((req, res) => {
  res.status(404).json({ 
    status: false, 
    message: 'Route not found' 
  });
});

// Global error handler - MUST be last
app.use(globalErrorHandler);

// Database connection and server startup
(async () => {
  try {
    await connectDB();
    // Optional: run seed user once on boot if SEED_ON_START=true
    if (process.env.SEED_ON_START === 'true') {
      await seedUser();
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Letter Craft Backend server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

