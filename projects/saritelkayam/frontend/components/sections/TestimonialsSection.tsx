"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { fetchTestimonials, adaptTestimonial } from "@/lib/api";

const fallbackItems = [
  {
    name: "Rachel M.",
    service: "Signature Facial",
    rating: 5,
    text: "Sarit is absolutely amazing! My skin has never looked better.",
    avatarLabel: "Rachel M.",
  },
  {
    name: "Dana K.",
    service: "Skin Analysis",
    rating: 5,
    text: "The skin analysis opened my eyes to what my skin really needs.",
    avatarLabel: "Dana K.",
  },
  {
    name: "Maya L.",
    service: "Bridal Makeup",
    rating: 5,
    text: "Sarit did my bridal makeup and I looked flawless all day!",
    avatarLabel: "Maya L.",
  },
];

interface TestimonialItem {
  id: string;
  name: string;
  service: string;
  rating: number;
  text: string;
  avatar: string | null;
}

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export function TestimonialsSection() {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<TestimonialItem[]>(
    fallbackItems.map((item) => ({ ...item, id: item.name, avatar: null })),
  );

  useEffect(() => {
    fetchTestimonials(true)
      .then((data) =>
        setItems(data.map((api) => adaptTestimonial(api, locale))),
      )
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  return (
    <Section
      title={t.testimonialsTitle}
      subtitle={t.testimonialsSubtitle}
      bg="cream"
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {items.map((item) => (
          <motion.div key={item.id} variants={cardVariants}>
            <Card className="p-6 md:p-8 flex flex-col h-full">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-heading font-semibold text-lg shrink-0">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    item.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-body font-medium text-charcoal-800">
                    {item.name}
                  </p>
                  <Badge variant="default">{item.service}</Badge>
                </div>
              </div>

              <StarRating count={item.rating} />

              <p className="font-body text-sm text-charcoal-600 leading-relaxed mt-4 flex-1 italic">
                "{item.text}"
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

export default TestimonialsSection;
