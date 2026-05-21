"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryText?: string;
  primaryHref?: string;
  secondaryText?: string;
  secondaryHref?: string;
}

export function CTASection({
  title = "Ready to Transform Your Look?",
  subtitle = "Book your appointment today and experience personalized beauty treatments designed just for you.",
  primaryText = "Book Now",
  primaryHref = "/book",
  secondaryText = "Contact Me",
  secondaryHref = "/contact",
}: CTASectionProps) {
  return (
    <motion.section
      className="bg-charcoal-800 py-8 md:py-24"
      aria-label="Call to action"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-cream-100 mb-4">
            {title}
          </h2>

          <SectionDivider className="mb-6" />

          <p className="font-body text-base md:text-lg text-cream-200 mb-8 leading-relaxed">
            {subtitle}
          </p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Button variant="primary" size="lg" href={primaryHref}>
              {primaryText}
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={secondaryHref}
              className="border-cream-300 text-cream-200 hover:bg-cream-200 hover:text-charcoal-800"
            >
              {secondaryText}
            </Button>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  );
}

export default CTASection;
