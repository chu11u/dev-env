"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Clock, Star } from "lucide-react";

const featuredServices = [
  {
    title: "Signature Facial",
    description:
      "A luxurious deep-cleansing facial tailored to your skin type, featuring gentle exfoliation, custom mask, and hydrating serum application.",
    duration: "60 min",
    price: "$120",
    badge: "Most Popular",
    imageLabel: "Signature Facial treatment",
  },
  {
    title: "Skin Analysis & Consultation",
    description:
      "Comprehensive skin assessment using advanced technology to identify your unique needs and create a personalized treatment plan.",
    duration: "45 min",
    price: "$80",
    badge: "Essential",
    imageLabel: "Skin analysis session",
  },
  {
    title: "Bridal Makeup",
    description:
      "Flawless, long-lasting makeup artistry for your special day. Includes trial session and day-of application.",
    duration: "90 min",
    price: "$250",
    badge: "Premium",
    imageLabel: "Bridal makeup",
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

export function ServicesPreview() {
  return (
    <Section
      title="Featured Services"
      subtitle="Discover the treatments that will transform your skin and boost your confidence"
      bg="white"
    >
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
        {featuredServices.map((service) => (
          <motion.div key={service.title} variants={cardVariants}>
            <Card className="overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
              <ImagePlaceholder height="h-48" className="rounded-t-2xl" />

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default">{service.badge}</Badge>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {service.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-gold-500" />{" "}
                      {service.price}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading text-lg md:text-xl font-semibold text-charcoal-800 mb-2">
                  {service.title}
                </h3>

                <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-6 flex-1">
                  {service.description}
                </p>

                <Button variant="outline" size="sm" href="/services">
                  Learn More
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="md" href="/services">
          View All Services
        </Button>
      </div>
    </Section>
  );
}

export default ServicesPreview;
