# Skill: Framer Motion

## Overview

Framer Motion is the animation library for React. Use it for subtle, performant animations that enhance the user experience without being distracting. For this project, animations should feel elegant and refined — like the brand.

## Project-Specific Principles

### Animation Philosophy
- **Subtle over flashy** — 200-400ms transitions, gentle easing
- **Purposeful** — every animation should serve a purpose (guide attention, provide feedback)
- **Consistent** — use the same easing and duration across the site
- **Performant** — avoid layout animations on images, use GPU-accelerated properties only

### Standard Easing & Duration
```ts
// Use these as defaults throughout the site
const easings = {
    smooth: { ease: [0.4, 0, 0.2, 1] },          // Material-style ease
    gentle: { ease: 'easeOut' },                   // Gentle fade-out
    bounce: { ease: 'back.out(1.2)' },             // Subtle bounce (use sparingly)
}

const durations = {
    fast: 0.2,       // Micro-interactions (hover, focus)
    normal: 0.3,     // Standard transitions
    slow: 0.5,       // Page transitions, hero animations
}
```

## Common Animation Patterns

### 1. Fade-In on Scroll (useInView)

The most common pattern for this site — sections fade in as they enter the viewport.

```tsx
'use client'

import { motion } from 'framer-motion'

export function FadeInSection({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
```

Usage in pages:
```tsx
<FadeInSection>
    <h2>Our Services</h2>
</FadeInSection>

<FadeInSection delay={0.1}>
    <ServicesGrid />
</FadeInSection>
```

### 2. Card Hover Effects

Subtle lift and shadow change on hover.

```tsx
import { motion } from 'framer-motion'

export function AnimatedCard({ children }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-soft hover:shadow-lift transition-shadow duration-300"
        >
            {children}
        </motion.div>
    )
}
```

### 3. Page Transition (AnimatePresence)

Smooth page transitions for navigation.

```tsx
// app/layout.tsx
'use client'

import { AnimatePresence } from 'framer-motion'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Header />
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname} // requires dynamic key
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
                <Footer />
            </body>
        </html>
    )
}
```

### 4. Staggered Children Animation

Animate a list of items one by one.

```tsx
import { motion } from 'framer-motion'

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function StaggeredList({ children }) {
    return (
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {React.Children.map(children, (child) => (
                <motion.div variants={item}>{child}</motion.div>
            ))}
        </motion.div>
    )
}
```

### 5. Hero Section Animation

Multi-element entrance for the hero section.

```tsx
import { motion } from 'framer-motion'

export function HeroSection() {
    return (
        <section className="relative h-screen flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0"
            >
                <Image src="/assets/hero/hero-main.png" fill alt="" />
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="relative text-center"
            >
                <h1>Elegant Beauty Treatment</h1>
                <p>Professional cosmetician services</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="mt-8 px-8 py-4 bg-rose rounded-xl"
                >
                    Book Appointment
                </motion.button>
            </motion.div>
        </section>
    )
}
```

### 6. Mobile Menu Animation

Smooth open/close for mobile navigation.

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

export function MobileMenu({ links }) {
    const [open, setOpen] = useState(false)
    
    return (
        <>
            <button onClick={() => setOpen(!open)} className="md:hidden">
                {open ? <CloseIcon /> : <MenuIcon />}
            </button>
            
            <AnimatePresence>
                {open && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-white shadow-soft"
                    >
                        {links.map(link => (
                            <a key={link.href} href={link.href} className="block px-6 py-3">{link.label}</a>
                        ))}
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    )
}
```

## Do Not

### Don't Over-Animate

```tsx
// ❌ Too many animations at once
<motion.div animate={{ x: [0, 100, -100, 0], rotate: [0, 360], scale: [1, 2, 0.5, 1] }}>

// ✅ Subtle, purposeful animation
<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} />
```

### Don't Animate Layout Properties

```tsx
// ❌ Bad — animates width/height (triggers layout recalc)
<motion.div animate={{ width: 200, height: 100 }}>

// ✅ Good — GPU-accelerated only
<motion.div animate={{ scale: 1.1, opacity: 0.8, y: -4 }}>
```

### Don't Skip Reduced Motion

```tsx
// ✅ Respect user's motion preferences
import { useReducedMotion } from 'framer-motion'

function MyComponent() {
    const shouldReduceMotion = useReducedMotion()
    
    return (
        <motion.div
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
        >
```

### Don't Use Layout Animations on Images

Image layout animations cause jank and layout shifts. Use opacity/scale instead:

```tsx
// ❌ Don't do this
<motion.img layout src={image.src} />

// ✅ Do this
<motion.img initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} src={image.src} />
```

## Performance Tips

1. **Use `viewport={{ once: true }}`** — Animate only once, not every time the element scrolls in/out
2. **Prefer `opacity` and `transform`** — These are GPU-accelerated and don't trigger layout
3. **Debounce scroll events** — If you use scroll-based animations, debounce them
4. **Limit concurrent animations** — Don't have more than 5 elements animating simultaneously on screen
5. **Use `whileInView` instead of scroll events** — Let Framer Motion handle the viewport detection
