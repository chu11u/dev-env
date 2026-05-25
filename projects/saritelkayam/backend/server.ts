import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import blogRoutes from "./routes/blog";
import authRoutes from "./routes/auth";
import testimonialsRoutes from "./routes/testimonials";
import productsRoutes from "./routes/products";
import servicesRoutes from "./routes/services";
import settingsRoutes from "./routes/settings";
import uploadRoutes from "./routes/upload";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — allow frontend during dev and production
app.use(
  cors({
    origin: [
      "http://localhost:3006",
      "http://localhost:3000",
      "https://saritelkayam.apps.elkayam.me",
      "https://saritelkayam.com",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// Ensure uploads directory exists
const UPLOAD_DIR = "/app/uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve uploaded images as static files
app.use("/uploads", express.static(UPLOAD_DIR));

// API routes — single mount point
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", testimonialsRoutes);
app.use("/api", productsRoutes);
app.use("/api", servicesRoutes);
app.use("/api", settingsRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
