import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "@/routes/auth_routes";
import campaignRoutes from "@/routes/campaign_routes";
import permissionRoutes from "@/routes/permission_routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/permissions", permissionRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
