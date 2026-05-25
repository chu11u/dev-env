import { Router, Request, Response } from "express";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────────────────────────

// GET /api/services — List all services
router.get("/services", async (_req: Request, res: Response) => {
  try {
    const services = await db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    res.json(services);
  } catch (error) {
    console.error("GET /services error:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET /api/services/category/:category — Filter by category
router.get(
  "/services/category/:category",
  async (req: Request, res: Response) => {
    try {
      const services = await db.service.findMany({
        where: { category: req.params.category },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      res.json(services);
    } catch (error) {
      console.error("GET /services/category/:category error:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  },
);

// ─── Admin Routes ────────────────────────────────────────

// GET /api/admin/services — List all services
router.get("/admin/services", async (_req: Request, res: Response) => {
  try {
    const services = await db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    res.json(services);
  } catch (error) {
    console.error("GET /admin/services error:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// POST /api/admin/services — Create service
router.post("/admin/services", async (req: Request, res: Response) => {
  try {
    const {
      category,
      titleEn,
      titleHe,
      descriptionEn,
      descriptionHe,
      duration,
      price,
      image,
      featuresEn,
      featuresHe,
      sortOrder,
    } = req.body;

    const service = await db.service.create({
      data: {
        category,
        titleEn,
        titleHe,
        descriptionEn,
        descriptionHe,
        duration,
        price,
        image,
        featuresEn: featuresEn || [],
        featuresHe: featuresHe || [],
        sortOrder,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("POST /admin/services error:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

// PUT /api/admin/services/:id — Update service
router.put("/admin/services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = String(req.params.id);
    const existing = await db.service.findUnique({
      where: { id: serviceId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }

    const service = await db.service.update({
      where: { id: serviceId },
      data: {
        ...req.body,
      },
    });

    res.json(service);
  } catch (error) {
    console.error("PUT /admin/services/:id error:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE /admin/services/:id — Delete service
router.delete("/admin/services/:id", async (req: Request, res: Response) => {
  try {
    const serviceId = String(req.params.id);
    const existing = await db.service.findUnique({
      where: { id: serviceId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }

    await db.service.delete({ where: { id: serviceId } });
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /admin/services/:id error:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

export default router;
