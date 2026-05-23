"use client";

import { useState, useEffect } from "react";
import { getProducts, deleteProduct, updateProduct } from "@/lib/admin-api";
import type { Product } from "@/lib/admin-api";
import { PRODUCT_CATEGORIES } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n";

export default function ProductsListPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
      setSuccess("Product deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete product.");
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      await updateProduct(product.id, { featured: !product.featured });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, featured: !p.featured } : p,
        ),
      );
      setSuccess("Product updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update product.");
    }
  };

  const getBadgeVariant = (badge: string | null) => {
    if (!badge) return "default";
    if (badge === "popular") return "accent";
    return "default";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
            {t.adminProducts}
          </h1>
          <p className="font-body text-charcoal-500">Manage product catalog</p>
        </div>
        <Button href="/admin/products/new" variant="primary">
          + {t.adminAddNew}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
          {success}
        </div>
      )}

      {/* Products Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="font-body text-charcoal-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-body text-charcoal-500 mb-4">
              No products yet. Add your first product.
            </p>
            <Button href="/admin/products/new" variant="primary">
              {t.adminAddNew}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Name (He)
                  </th>
                  <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Category
                  </th>
                  <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Price
                  </th>
                  <th className="text-center px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Featured
                  </th>
                  <th className="text-center px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Badge
                  </th>
                  <th className="text-end px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-cream-100 hover:bg-cream-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-body font-medium text-charcoal-800">
                          {product.nameHe}
                        </p>
                        <p className="font-body text-xs text-charcoal-400">
                          {product.nameEn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-body text-sm text-charcoal-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-body text-sm text-charcoal-600">
                        {product.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={product.featured}
                          onChange={() => toggleFeatured(product)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.badge && (
                        <Badge variant={getBadgeVariant(product.badge)}>
                          {product.badge}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          href={`/admin/products/${product.id}`}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        {confirmDelete === product.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleDelete(product.id)}
                              variant="secondary"
                              size="sm"
                              className="!bg-red-500 hover:!bg-red-600"
                            >
                              {t.adminDelete}
                            </Button>
                            <Button
                              onClick={() => setConfirmDelete(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setConfirmDelete(product.id)}
                            variant="outline"
                            size="sm"
                            className="!border-red-300 !text-red-500 hover:!bg-red-500 hover:!text-white"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
