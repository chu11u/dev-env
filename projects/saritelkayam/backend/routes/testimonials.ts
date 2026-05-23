import { Router, Request, Response } from "express";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────────────────────────

// GET /api/testimonials — List all testimonials
router.get("/testimonials", async (_req: Request, res: Response) => {
	try {
		const testimonials = await db.testimonial.findMany({
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(testimonials);
	} catch (error) {
		console.error("GET /testimonials error:", error);
		res.status(500).json({ error: "Failed to fetch testimonials" });
	}
});

// GET /api/testimonials/featured — List only featured testimonials
router.get("/testimonials/featured", async (_req: Request, res: Response) => {
	try {
		const testimonials = await db.testimonial.findMany({
			where: { featured: true },
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(testimonials);
	} catch (error) {
		console.error("GET /testimonials/featured error:", error);
		res.status(500).json({ error: "Failed to fetch testimonials" });
	}
});

// ─── Admin Routes ────────────────────────────────────────

// GET /api/admin/testimonials — List all testimonials
router.get("/admin/testimonials", async (_req: Request, res: Response) => {
	try {
		const testimonials = await db.testimonial.findMany({
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(testimonials);
	} catch (error) {
		console.error("GET /admin/testimonials error:", error);
		res.status(500).json({ error: "Failed to fetch testimonials" });
	}
});

// POST /api/admin/testimonials — Create testimonial
router.post("/admin/testimonials", async (req: Request, res: Response) => {
	try {
		const {
			nameEn,
			nameHe,
			textEn,
			textHe,
			serviceEn,
			serviceHe,
			rating,
			avatar,
			featured,
			sortOrder,
		} = req.body;

		const testimonial = await db.testimonial.create({
			data: {
				nameEn,
				nameHe,
				textEn,
				textHe,
				serviceEn,
				serviceHe,
				rating,
				avatar,
				featured,
				sortOrder,
			},
		});

		res.status(201).json(testimonial);
	} catch (error) {
		console.error("POST /admin/testimonials error:", error);
		res.status(500).json({ error: "Failed to create testimonial" });
	}
});

// PUT /api/admin/testimonials/:id — Update testimonial
router.put(
	"/admin/testimonials/:id",
	async (req: Request, res: Response) => {
		try {
			const testimonialId = String(req.params.id);
			const existing = await db.testimonial.findUnique({
				where: { id: testimonialId },
			});
			if (!existing) {
				return res.status(404).json({ error: "Testimonial not found" });
			}

			const testimonial = await db.testimonial.update({
				where: { id: testimonialId },
				data: {
					...req.body,
				},
			});

			res.json(testimonial);
		} catch (error) {
			console.error("PUT /admin/testimonials/:id error:", error);
			res.status(500).json({ error: "Failed to update testimonial" });
		}
	},
);

// DELETE /api/admin/testimonials/:id — Delete testimonial
router.delete(
	"/admin/testimonials/:id",
	async (req: Request, res: Response) => {
		try {
			const testimonialId = String(req.params.id);
			const existing = await db.testimonial.findUnique({
				where: { id: testimonialId },
			});
			if (!existing) {
				return res.status(404).json({ error: "Testimonial not found" });
			}

			await db.testimonial.delete({ where: { id: testimonialId } });
			res.json({ success: true });
		} catch (error) {
			console.error("DELETE /admin/testimonials/:id error:", error);
			res.status(500).json({ error: "Failed to delete testimonial" });
		}
	},
);

export default router;
