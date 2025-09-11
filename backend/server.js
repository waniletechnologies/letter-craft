// server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./src/config/database.js";
import { requireAuth } from "./src/middlewares/auth.middleware.js";

import authRoutes from "./src/routes/auth.route.js";
import creditReport from "./src/routes/creditReport.route.js";
import disputeRoutes from "./src/routes/dispute.route.js";

import cookieParser from "cookie-parser";

await connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
// mount auth routes at /api/auth
app.use("/api/auth", authRoutes);
app.use("/api", creditReport);
app.use("/api/disputes", disputeRoutes);

// example protected route
app.get("/api/me", requireAuth, (req, res) => {
  // req.user populated by middleware
  res.json({ ok: true, user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth endpoints available at /api/auth/*`);
});
