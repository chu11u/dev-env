import express from "express";
import cors from "cors";
import blogRoutes from "./routes/blog";
import authRoutes from "./routes/auth";

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

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
