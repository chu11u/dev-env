import express from "express";
import cors from "cors";
import blogRoutes from "./routes/blog";
import authRoutes from "./routes/auth";
import testimonialsRoutes from "./routes/testimonials";
import productsRoutes from "./routes/products";
import servicesRoutes from "./routes/services";
import settingsRoutes from "./routes/settings";

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

// API routes — single mount point
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", testimonialsRoutes);
app.use("/api", productsRoutes);
app.use("/api", servicesRoutes);
app.use("/api", settingsRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
