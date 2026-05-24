"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { fetchProducts, adaptProduct } from "@/lib/api";

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  badge: string | null;
}

const fallbackProducts: ProductItem[] = [
  {
    id: "1",
    name: "Gentle Gel Cleanser",
    description:
      "A pH-balanced gel cleanser that removes impurities without stripping the skin's natural moisture barrier.",
    price: "₪38",
    image: "/assets/products/luxury-bottle.png",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Vitamin C Brightening Serum",
    description:
      "A potent 15% Vitamin C serum that brightens, evens skin tone, and boosts collagen production.",
    price: "₪65",
    image: "/assets/products/serum-bottle.png",
    badge: "Staff Pick",
  },
  {
    id: "3",
    name: "Mineral Sunscreen SPF 50",
    description:
      "A lightweight, non-comedogenic mineral sunscreen with SPF 50. Invisible on all skin tones.",
    price: "₪42",
    image: "/assets/products/luxury-bottle.png",
    badge: "Essential",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function ProductsPreview() {
  const { t, locale } = useTranslation();
  const [products, setProducts] = useState<ProductItem[]>(fallbackProducts);

  useEffect(() => {
    fetchProducts(true)
      .then((data) =>
        setProducts(
          data.map((api) => ({
            ...adaptProduct(api, locale),
            badge: api.badge || null,
          })),
        ),
      )
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  return (
    <Section title={t.productsTitle} subtitle={t.productsSubtitle} bg="cream">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={cardVariants}>
            <Card className="overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
              {/* Image */}
              <div className="relative h-48 bg-cream-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.badge && (
                  <div className="absolute top-3 start-3">
                    <Badge variant="accent">{product.badge}</Badge>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-charcoal-800 mb-2">
                  {product.name}
                </h3>

                <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-6 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                  <span className="font-heading text-xl font-bold text-rose-400">
                    {product.price}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-gold-500 text-gold-500"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="md" href="/shop">
          {t.productsViewAll}
        </Button>
      </div>
    </Section>
  );
}

export default ProductsPreview;
