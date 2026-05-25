import { Router, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

const UPLOAD_DIR = "/app/uploads";

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// POST /api/upload/image — Upload an image
router.post(
  "/upload/image",
  upload.single("image"),
  (_req, res: Response) => {
    try {
      const file = (_req as any).file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      res.json({ url: `/uploads/${file.filename}` });
    } catch (error) {
      console.error("POST /upload/image error:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

// DELETE /api/upload/image/:filename — Delete an uploaded image
router.delete("/upload/image/:filename", (_req, res: Response) => {
  try {
    const filename = _req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Prevent path traversal
    if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /upload/image/:filename error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// Handle multer-specific errors
router.use((err: any, _req: any, res: Response, _next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Maximum size is 5MB" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
