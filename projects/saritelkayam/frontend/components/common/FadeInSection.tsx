'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeInSection({
  children,
  delay = 0,
  duration = 0.3,
}: FadeInSectionProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay, duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default FadeInSection;
