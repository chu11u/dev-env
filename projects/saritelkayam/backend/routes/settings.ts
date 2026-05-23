import { Router, Request, Response } from "express";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────────────────────────

// GET /api/settings — List all settings
router.get("/settings", async (_req: Request, res: Response) => {
	try {
		const settings = await db.siteSetting.findMany({
			orderBy: [{ category: "asc" }, { key: "asc" }],
		});
		res.json(settings);
	} catch (error) {
		console.error("GET /settings error:", error);
		res.status(500).json({ error: "Failed to fetch settings" });
	}
});

// GET /api/settings/:key — Get single setting by key
router.get("/settings/:key", async (req: Request, res: Response) => {
	try {
		const setting = await db.siteSetting.findUnique({
			where: { key: req.params.key },
		});
		if (!setting) {
			return res.status(404).json({ error: "Setting not found" });
		}
		res.json(setting);
	} catch (error) {
		console.error("GET /settings/:key error:", error);
		res.status(500).json({ error: "Failed to fetch setting" });
	}
});

// ─── Admin Routes ────────────────────────────────────────

// GET /api/admin/settings — List all settings
router.get("/admin/settings", async (_req: Request, res: Response) => {
	try {
		const settings = await db.siteSetting.findMany({
			orderBy: [{ category: "asc" }, { key: "asc" }],
		});
		res.json(settings);
	} catch (error) {
		console.error("GET /admin/settings error:", error);
		res.status(500).json({ error: "Failed to fetch settings" });
	}
});

// POST /api/admin/settings — Create setting
router.post("/admin/settings", async (req: Request, res: Response) => {
	try {
		const { key, valueEn, valueHe, category } = req.body;

		// Check if key already exists
		const existing = await db.siteSetting.findUnique({ where: { key } });
		if (existing) {
			return res.status(409).json({ error: "Setting key already exists" });
		}

		const setting = await db.siteSetting.create({
			data: {
				key,
				valueEn,
				valueHe,
				category: category || "general",
			},
		});

		res.status(201).json(setting);
	} catch (error) {
		console.error("POST /admin/settings error:", error);
		res.status(500).json({ error: "Failed to create setting" });
	}
});

// PUT /api/admin/settings/:key — Update setting
router.put("/admin/settings/:key", async (req: Request, res: Response) => {
	try {
		const { valueEn, valueHe, category } = req.body;

		const existing = await db.siteSetting.findUnique({
			where: { key: req.params.key },
		});
		if (!existing) {
			return res.status(404).json({ error: "Setting not found" });
		}

		const setting = await db.siteSetting.update({
			where: { key: req.params.key },
			data: {
				valueEn,
				valueHe,
				category,
			},
		});

		res.json(setting);
	} catch (error) {
		console.error("PUT /admin/settings/:key error:", error);
		res.status(500).json({ error: "Failed to update setting" });
	}
});

// DELETE /api/admin/settings/:key — Delete setting
router.delete(
	"/admin/settings/:key",
	async (req: Request, res: Response) => {
		try {
			const existing = await db.siteSetting.findUnique({
				where: { key: req.params.key },
			});
			if (!existing) {
				return res.status(404).json({ error: "Setting not found" });
			}

			await db.siteSetting.delete({ where: { key: req.params.key } });
			res.json({ success: true });
		} catch (error) {
			console.error("DELETE /admin/settings/:key error:", error);
			res.status(500).json({ error: "Failed to delete setting" });
		}
	},
);

export default router;
