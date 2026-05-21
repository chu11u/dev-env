# Skill: Tailwind CSS

## Overview

Tailwind CSS utility-first framework for styling. Configure design tokens in `tailwind.config.js`, use utility classes in components.

## Project-Specific Configuration

### Brand Palette

```js
// tailwind.config.js
module.exports = {
    content: [
        './app/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Warm Luxury palette
                rose: {
                    DEFAULT: '#D4A59A',    // Primary — soft rose gold
                    light: '#E8C4B8',       // Primary light — blush
                    50: '#F9F3F1',          // Lightest tint
                    100: '#F2E8E3',
                    200: '#E8C4B8',
                    300: '#D4A59A',
                    400: '#C08B80',
                    500: '#AC7267',
                    600: '#98594E',
                    700: '#844035',
                    800: '#702F25',
                    900: '#5C201A',
                },
                cream: {
                    DEFAULT: '#FAF6F2',    // Secondary — warm cream
                    50: '#FDFCFA',
                    100: '#FAF6F2',
                    200: '#F5EDE5',
                    300: '#EDE1D7',
                    400: '#E3D4C5',
                    500: '#D9C7B3',
                    600: '#CBBAA1',
                    700: '#BDA98F',
                    800: '#AF977D',
                    900: '#A1866B',
                },
                burgundy: {
                    DEFAULT: '#6B3A3A',    // Accent — deep burgundy
                    light: '#8B5A5A',
                    50: '#F5EEEE',
                    100: '#E8D5D5',
                    200: '#D4B3B3',
                    300: '#BF9191',
                    400: '#AA6F6F',
                    500: '#954D4D',
                    600: '#6B3A3A',
                    700: '#543030',
                        800: '#3D2525',
                    900: '#261A1A',
                },
                charcoal: {
                    DEFAULT: '#3D2B2B',    // Text — rich charcoal
                    50: '#F3F0F0',
                    100: '#E5E0E0',
                    200: '#C9BCBC',
                    300: '#AC9797',
                    400: '#907B7B',
                    500: '#735F5F',
                    600: '#574343',
                    700: '#3D2B2B',
                    800: '#322323',
                    900: '#271B1B',
                },
                gold: {
                    DEFAULT: '#C8A979',    // Highlight — gold shimmer
                    light: '#D9BE99',
                    50: '#FAF6EE',
                    100: '#F5EDDD',
                    200: '#E9D9BD',
                    300: '#DCC5AD',
                    400: '#D0B19D',
                    500: '#C8A979',
                    600: '#B69466',
                    700: '#A47F53',
                    800: '#926A40',
                    900: '#81552D',
                },
            },
            fontFamily: {
                heading: ['Playfair Display', 'Georgia', 'serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(61, 43, 43, 0.07), 0 10px 20px -2px rgba(61, 43, 43, 0.04)',
                'soft-lg': '0 4px 25px -3px rgba(61, 43, 43, 0.08), 0 12px 30px -2px rgba(61, 43, 43, 0.05)',
                'lift': '0 8px 30px -4px rgba(61, 43, 43, 0.1), 0 16px 40px -4px rgba(61, 43, 43, 0.06)',
            },
        },
    },
    plugins: [],
}
```

### Using Design Tokens in Components

```tsx
// ✅ Use semantic color names
<div className="bg-cream-100 text-charcoal-700 rounded-2xl shadow-soft">
    <h2 className="font-heading text-rose-600">Service</h2>
    <p className="font-body text-charcoal-500">Description</p>
</div>

// ❌ Don't use hex literals in components
<div className="bg-[#FAF6F2] text-[#3D2B2B]">
```

## Typography Scale

```css
/* In globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    h1 {
        @apply font-heading text-4xl md:text-5xl lg:text-6xl text-charcoal-800;
    }
    h2 {
        @apply font-heading text-3xl md:text-4xl text-charcoal-700;
    }
    h3 {
        @apply font-heading text-2xl md:text-3xl text-charcoal-700;
    }
    h4 {
        @apply font-heading text-xl md:text-2xl text-charcoal-600;
    }
    p {
        @apply font-body text-base md:text-lg text-charcoal-600 leading-relaxed;
    }
}
```

## Component Patterns

### Button Variants

```tsx
// Primary — rose gold background, white text
interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    onClick?: () => void
    href?: string
}

export function Button({ children, variant = 'primary', size = 'md', onClick, href }: ButtonProps) {
    const base = 'inline-flex items-center justify-center font-body font-medium rounded-xl transition-all duration-200'
    const variants = {
        primary: 'bg-rose DEFAULT text-white hover:bg-rose-400 shadow-soft hover:shadow-lift',
        secondary: 'bg-burgundy DEFAULT text-white hover:bg-burgundy-700 shadow-soft hover:shadow-lift',
        outline: 'border-2 border-rose DEFAULT text-rose-600 hover:bg-rose-50',
    }
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    }
    
    const classes = `${base} ${variants[variant]} ${sizes[size]}`
    
    if (href) return <a href={href} className={classes}>{children}</a>
    return <button onClick={onClick} className={classes}>{children}</button>
}
```

### Card Pattern

```tsx
export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-soft hover:shadow-lift transition-shadow duration-300 p-6 ${className}`}>
            {children}
        </div>
    )
}
```

### Input Pattern

```tsx
interface InputProps {
    label?: string
    type?: 'text' | 'email' | 'tel' | 'password'
    placeholder?: string
    name?: string
    required?: boolean
}

export function Input({ label, type = 'text', placeholder, name, required }: InputProps) {
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-body font-medium text-charcoal-700">{label}{required && '*'}</label>}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 rounded-xl border border-cream-300 bg-white text-charcoal-700 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200"
            />
        </div>
    )
}
```

## Responsive Design Patterns

### Mobile-First Breakpoints

```
sm: 640px   — Small phones (rarely needed, base is mobile)
md: 768px   — Tablets, landscape phones
lg: 1024px  — Laptops, desktops
xl: 1280px  — Large screens
2xl: 1536px — Extra large screens
```

### Common Responsive Patterns

```tsx
// Stacking on mobile, side-by-side on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hidden on mobile, visible on desktop
<nav className="hidden md:flex space-x-6">

// Mobile menu trigger
<button className="md:hidden">...</button>

// Responsive padding
<div className="px-4 sm:px-6 lg:px-8">

// Responsive text
<h1 className="text-3xl md:text-4xl lg:text-5xl">
```

## Container Pattern

```tsx
export function Container({ children, className = '' }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    )
}
```

## Color Usage Guidelines

| Element | Background | Text | Border |
|---|---|---|---|
| Page background | `bg-cream-50` or `bg-white` | — | — |
| Section alternating | `bg-cream-100` | — | — |
| Cards | `bg-white` | `text-charcoal-700` | — |
| Headings | — | `text-charcoal-800` | — |
| Body text | — | `text-charcoal-600` | — |
| Primary CTA | `bg-rose-DEFAULT` | `text-white` | — |
| Secondary CTA | `bg-burgundy-DEFAULT` | `text-white` | — |
| Links | — | `text-rose-600` hover: `text-rose-500` | — |
| Input borders | — | — | `border-cream-300` |
| Input focus | — | — | `ring-rose-300` |

## Do Not

- Don't use arbitrary values (`bg-[#D4A59A]`) — use named tokens
- Don't skip responsive design — all components must work on mobile
- Don't use inline styles — use Tailwind classes
- Don't create custom CSS unless it's in `globals.css` for truly unique things
- Don't forget accessibility — proper contrast ratios, focus states, ARIA attributes
