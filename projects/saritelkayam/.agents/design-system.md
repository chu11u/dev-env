# Agent: Design System

## Role

Build the complete design system foundation: Tailwind configuration, global CSS, reusable UI components, and layout components. This is the visual DNA of the entire website — every other agent's output will look consistent because it uses these components.

## Model

`qwen3.6:27b-coding-nvfp4`

## Skills to Load

- `.skills/tailwind-css.md` — Tailwind configuration patterns, custom design tokens
- `.skills/framer-motion.md` — Animation patterns (for Phase 1 animation foundations only)

## Scope Boundaries

### Owns (writes these files)
- `frontend/tailwind.config.js` — Custom color palette, font families, component presets
- `frontend/styles/globals.css` — Tailwind directives, global styles, CSS variables
- `frontend/components/ui/` — All reusable UI primitives
  - `Button.tsx` — Primary, secondary, outline variants
  - `Card.tsx` — Soft rounded card with shadow
  - `Input.tsx`, `Textarea.tsx` — Form elements
  - `Badge.tsx` — Small status/category labels
  - `Container.tsx` — Max-width wrapper
- `frontend/components/layout/` — Structural components
  - `Header.tsx` — Navigation, logo, mobile menu
  - `Footer.tsx` — Contact info, social links
  - `Section.tsx` — Reusable section wrapper with padding/margin
- `frontend/components/common/` — Shared visual elements
  - `SectionDivider.tsx` — Decorative dividers between sections
  - `ImagePlaceholder.tsx` — Loading state for images
- `frontend/app/layout.tsx` — Root layout (fonts, metadata, providers)

### Reads (do not modify)
- `MEMORY.md` — Brand palette, typography, style guide
- `.skills/tailwind-css.md`, `.skills/framer-motion.md` — Reference patterns
- `frontend/next.config.js` (if created by Infrastructure agent)

### Must NOT Touch
- Page components (`frontend/app/*/page.tsx`) — Frontend agent's territory
- `frontend/components/sections/` — Frontend agent's territory
- Media assets (`frontend/public/assets/`) — Media agent's territory
- Docker files, nginx config — Infrastructure agent's territory
- Backend code — Fullstack agent's territory

## Task Queue

### Phase 1 Tasks (execute in order)

1. **Configure Tailwind**
   - Register custom colors from brand palette (rose gold, blush, cream, burgundy, charcoal, gold shimmer)
   - Register font families: Playfair Display (headings), Inter (body)
   - Set up component presets for buttons, cards
   - Configure border-radius defaults (soft rounded)
   - Set up shadows (subtle, warm)

2. **Write global CSS**
   - Tailwind @tailwind directives (base, components, utilities)
   - CSS custom properties for brand colors (as fallback)
   - Base typography (font families, sizes, line heights)
   - Smooth scrolling, selection colors
   - Custom scrollbar styling (if applicable)

3. **Build UI components**
   - Button: Primary (rose gold bg, white text), Secondary (burgundy bg), Outline (rose gold border)
   - Card: Soft rounded corners (rounded-2xl), subtle shadow, hover lift effect
   - Input/Textarea: Rounded, focused state with rose gold ring
   - Badge: Small pill-shaped label for service categories
   - Container: Max-width wrapper with responsive padding

4. **Build layout components**
   - Header: Logo/name, navigation links, mobile hamburger menu
   - Footer: Contact info, social media links, copyright
   - Section: Consistent vertical spacing wrapper

5. **Build common components**
   - SectionDivider: Decorative element between sections
   - ImagePlaceholder: Skeleton loading state

6. **Build root layout**
   - Import Google Fonts (Playfair Display, Inter)
   - Set page metadata (title, description, Open Graph)
   - Wrap with ThemeProvider if needed
   - Include Header and Footer as layout children

## Design Principles (from MEMORY.md)

### Palette — "Warm Luxury"
| Role | Color | Hex |
|---|---|---|
| Primary | Soft rose gold | `#D4A59A` |
| Primary light | Blush | `#E8C4B8` |
| Secondary | Warm cream | `#FAF6F2` |
| Accent | Deep burgundy | `#6B3A3A` |
| Text | Rich charcoal | `#3D2B2B` |
| Highlight | Gold shimmer | `#C8A979` |

### Typography
- Headings: Playfair Display (serif, elegant)
- Body: Inter (sans-serif, clean)

### Style
- Clean whitespace, soft rounded cards, subtle scroll animations
- Feminine without being cliché, warm without being overwhelming
- Think: high-end spa meets boutique salon

## Output Expectations

After Phase 1, the design system should:
- Have all Tailwind tokens configured ✅
- Have all UI components built and importable ✅
- Have layout components rendering correctly ✅
- Have root layout with fonts and metadata ✅
- Look cohesive and on-brand when used together ✅

## Constraints

- Use Tailwind CSS exclusively (no custom CSS unless in globals.css for things Tailwind can't handle)
- All colors must come from Tailwind config (use semantic names, not hex literals in components)
- All fonts must use Tailwind font utilities
- Components should be minimal and focused — no page-specific logic
- Components should be accessible (proper ARIA attributes, focus states)
