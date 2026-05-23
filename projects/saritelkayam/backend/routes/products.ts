import { Router, Request, Response } from "express";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────────────────────────

// GET /api/products — List all products
router.get("/products", async (_req: Request, res: Response) => {
	try {
		const products = await db.product.findMany({
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(products);
	} catch (error) {
		console.error("GET /products error:", error);
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

// GET /api/products/featured — List only featured products
router.get("/products/featured", async (_req: Request, res: Response) => {
	try {
		const products = await db.product.findMany({
			where: { featured: true },
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(products);
	} catch (error) {
		console.error("GET /products/featured error:", error);
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

// GET /api/products/category/:category — Filter by category
router.get(
	"/products/category/:category",
	async (req: Request, res: Response) => {
		try {
			const products = await db.product.findMany({
				where: { category: req.params.category },
				orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
			});
			res.json(products);
		} catch (error) {
			console.error("GET /products/category/:category error:", error);
			res.status(500).json({ error: "Failed to fetch products" });
		}
	},
);

// ─── Admin Routes ────────────────────────────────────────

// GET /api/admin/products — List all products
router.get("/admin/products", async (_req: Request, res: Response) => {
	try {
		const products = await db.product.findMany({
			orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
		});
		res.json(products);
	} catch (error) {
		console.error("GET /admin/products error:", error);
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

// POST /api/admin/products — Create product
router.post("/admin/products", async (req: Request, res: Response) => {
	try {
		const {
			nameEn,
			nameHe,
			category,
			descriptionEn,
			descriptionHe,
			price,
			size,
			image,
			badge,
			rating,
			featured,
			sortOrder,
		} = req.body;

		const product = await db.product.create({
			data: {
				nameEn,
				nameHe,
				category,
				descriptionEn,
				descriptionHe,
				price,
				size,
				image,
				badge,
				rating,
				featured,
				sortOrder,
			},
		});

		res.status(201).json(product);
	} catch (error) {
		console.error("POST /admin/products error:", error);
		res.status(500).json({ error: "Failed to create product" });
	}
});

// PUT /api/admin/products/:id — Update product
router.put("/admin/products/:id", async (req: Request, res: Response) => {
	try {
		const productId = String(req.params.id);
		const existing = await db.product.findUnique({
			where: { id: productId },
		});
		if (!existing) {
			return res.status(404).json({ error: "Product not found" });
		}

		const product = await db.product.update({
			where: { id: productId },
			data: {
				...req.body,
			},
		});

		res.json(product);
	} catch (error) {
		console.error("PUT /admin/products/:id error:", error);
		res.status(500).json({ error: "Failed to update product" });
	}
});

// DELETE /api/admin/products/:id — Delete product
router.delete(
	"/admin/products/:id",
	async (req: Request, res: Response) => {
		try {
			const productId = String(req.params.id);
			const existing = await db.product.findUnique({
				where: { id: productId },
			});
			if (!existing) {
				return res.status(404).json({ error: "Product not found" });
			}

			await db.product.delete({ where: { id: productId } });
			res.json({ success: true });
		} catch (error) {
			console.error("DELETE /admin/products/:id error:", error);
			res.status(500).json({ error: "Failed to delete product" });
		}
	},
);

export default router;
