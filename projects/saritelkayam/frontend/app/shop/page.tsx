"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  fetchProducts,
  adaptProduct,
  getCategoryLabel,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/api";
import { getPublicSettings, shouldShowPrice } from "@/lib/admin-api";
import type { Setting } from "@/lib/admin-api";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  size: string;
  image: string;
  badge: string | null;
  rating: number;
}

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Gentle Gel Cleanser",
    category: "Cleansers",
    description:
      "A pH-balanced gel cleanser that removes impurities without stripping the skin's natural moisture barrier. Perfect for all skin types.",
    price: "₪38",
    size: "150ml",
    image: "/assets/products/luxury-bottle.png",
    badge: "Best Seller",
    rating: 5,
  },
  {
    id: "2",
    name: "Vitamin C Brightening Serum",
    category: "Serums",
    description:
      "A potent 15% Vitamin C serum that brightens, evens skin tone, and boosts collagen production. Visible results in just 2 weeks.",
    price: "₪65",
    size: "30ml",
    image: "/assets/products/serum-bottle.png",
    badge: "Staff Pick",
    rating: 5,
  },
  {
    id: "3",
    name: "Hydrating Day Cream",
    category: "Moisturizers",
    description:
      "Rich yet lightweight day cream with hyaluronic acid and ceramides. Provides 24-hour hydration and strengthens the skin barrier.",
    price: "₪52",
    size: "50ml",
    image: "/assets/products/cream-jar.png",
    badge: null,
    rating: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < count ? "fill-gold-500 text-gold-500" : "text-cream-300"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({
  product,
  t,
  showPrice,
}: {
  product: Product;
  t: any;
  showPrice: boolean;
}) {
  const displayCategory = getCategoryLabel(product.category, t.locale || "en");

  return (
    <Card className="overflow-hidden group">
      {/* Image */}
      <div className="relative h-56 bg-cream-100 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <div className="absolute top-3 start-3">
            <Badge variant="accent">{product.badge}</Badge>
          </div>
        )}
        {/* Wishlist */}
        <button
          className="absolute top-3 end-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className="text-rose-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="neutral">{displayCategory}</Badge>
          <span className="text-xs text-charcoal-400">{product.size}</span>
        </div>

        <h3 className="font-heading text-lg font-semibold text-charcoal-800 mb-2">
          {product.name}
        </h3>

        <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-cream-200">
          {showPrice && (
            <span className="font-heading text-xl font-bold text-rose-400">
              {product.price}
            </span>
          )}
          <StarRating count={product.rating} />
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            href="/contact"
            className="w-full"
          >
            <ShoppingBag size={14} className="ms-2" />
            {t.shopAskAbout}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ShopPage() {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch(() => {
        /* use defaults */
      });
  }, []);

  useEffect(() => {
    fetchProducts(false)
      .then((data) => setProducts(data.map((api) => adaptProduct(api, locale))))
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  // Derive unique categories from fetched products
  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))];
    const allLabel = locale === "he" ? "הכול" : "All";
    return [allLabel, ...unique.map((cat) => getCategoryLabel(cat, locale))];
  }, [products, locale]);

  // Filter products by active category
  const filteredProducts = useMemo(() => {
    if (
      activeCategory === "all" ||
      activeCategory === (locale === "he" ? "הכול" : "All")
    ) {
      return products;
    }
    // Find the original English category name from the label
    const reverseMap: Record<string, string> = Object.fromEntries(
      Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => [v, k]),
    );
    const originalCategory = reverseMap[activeCategory] || activeCategory;
    return products.filter(
      (p) => getCategoryLabel(p.category, locale) === activeCategory,
    );
  }, [products, activeCategory, locale]);

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.shopBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.shopTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">{t.shopSubtitle}</p>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Category filter */}
      <FadeInSection>
        <section className="bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => {
                const isActive =
                  cat === activeCategory ||
                  (cat === (locale === "he" ? "הכול" : "All") &&
                    activeCategory === "all");
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCategory(
                        cat === (locale === "he" ? "הכול" : "All")
                          ? "all"
                          : cat,
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                      isActive
                        ? "bg-rose-400 text-white"
                        : "bg-cream-100 text-charcoal-600 hover:bg-rose-100 hover:text-rose-600"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Product grid */}
      <FadeInSection>
        <Section bg="cream">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                t={t}
                showPrice={shouldShowPrice(settings, product.category)}
              />
            ))}
          </div>
        </Section>
      </FadeInSection>

      {/* Bottom CTA */}
      <FadeInSection>
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="font-body text-lg text-charcoal-600 mb-6">
              {t.shopConsultation}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/contact">
                {t.shopRecommendations}
              </Button>
              <Button variant="outline" size="lg" href="/book">
                {t.shopBookTreatment}
              </Button>
            </div>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
