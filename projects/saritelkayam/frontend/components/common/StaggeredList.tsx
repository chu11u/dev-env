"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";

interface StaggeredListProps {
  children: ReactNode;
  staggerDelay?: number;
  childDelay?: number;
  duration?: number;
}

export function StaggeredList({
  children,
  staggerDelay = 0.1,
  childDelay = 0,
  duration = 0.3,
}: StaggeredListProps) {
  const shouldReduce = useReducedMotion();
  const { isRtl } = useTranslation();

  const containerVariants = {
    hidden: { opacity: shouldReduce ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, x: isRtl ? 16 : -16 },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  const shouldReduce = useReducedMotion();
  const { isRtl } = useTranslation();

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, x: isRtl ? 16 : -16 },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {shouldReduce ? <>{children}</> : children}
    </motion.div>
  );
}

export default StaggeredList;
