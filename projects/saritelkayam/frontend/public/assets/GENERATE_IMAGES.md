# Generate Images for Sarit Elkayam Website

> **Status**: Draw Things API unavailable at `http://localhost:7860` — all image generation deferred.
> **Created**: 2026-05-20 by Media Agent (crash recovery)
> **Action**: When Draw Things is running, execute the script below or run individual commands.

## Prerequisites

1. Start Draw Things app on Mac
2. Verify model `juggernaut_xl_ragnarok_f16.ckpt` is selected
3. Verify API is listening on port 7860:

```bash
curl -s http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","steps":1,"width":64,"height":64,"cfg_scale":5}' | head -c 100
```

## Quick Start — Generate All Images

Run this single command from the project root (`dev-env/projects/saritelkayam/`):

```bash
bash frontend/public/assets/generate_all.sh
```

Or copy the script below and run it.

---

## Complete Generation Script

Save as `frontend/public/assets/generate_all.sh` and run:

```bash
#!/bin/bash
# Generate all image assets for Sarit Elkayam website
# Run from: dev-env/projects/saritelkayam/

set -e

API="http://localhost:7860/sdapi/v1/txt2img"
NEGATIVE="blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed, identifiable face, person face, portrait, headshot, hands with too many fingers, extra limbs, mutated anatomy, cartoon, illustration, painting, sketch, anime"

generate() {
    local prompt="$1"
    local width="$2"
    local height="$3"
    local output="$4"
    local label="$5"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Generating: $label"
    echo "  Output: $output"
    echo "  Size: ${width}x${height}"

    mkdir -p "$(dirname "$output")"

    curl -s -X POST "$API" \
         -H "Content-Type: application/json" \
         -d "{
           \"prompt\": $(echo "$prompt" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),
           \"negative_prompt\": $(echo "$NEGATIVE" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),
           \"steps\": 35,
           \"width\": $width,
           \"height\": $height,
           \"cfg_scale\": 6.5
         }" \
         | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('$output','wb').write(base64.b64decode(data['images'][0]))"

    local size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null || echo "?")
    echo "  ✓ Saved ($size bytes)"
}

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Sarit Elkayam — Image Asset Generator                 ║"
echo "║  Model: Juggernaut XL Ragnarok                        ║"
echo "╚══════════════════════════════════════════════════════════╝"

# ═══════════════════════════════════════════════════════════
# TASK 1: Hero Images (1920x1080)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 1: Hero Images ═══"

generate \
  "Elegant luxury cosmetician spa treatment room, warm golden hour sunlight streaming through sheer cream curtains, soft cream and blush color palette, luxurious marble surfaces with rose gold accents, soft diffused natural light, minimal clean composition, high quality professional photography style, wide angle, cinematic composition, feminine elegance, boutique salon atmosphere, no people or faces" \
  1920 1080 "frontend/public/assets/hero/hero-main.png" \
  "Hero Main — Spa treatment room"

generate \
  "Luxury beauty abstract texture, cream white marble surface with rose gold metallic accents, soft cream and blush color palette, elegant minimal composition, high quality professional photography style, commercial aesthetic, warm tones, subtle golden shimmer details, smooth polished surface, no text or logos" \
  1920 1080 "frontend/public/assets/hero/hero-alt.png" \
  "Hero Alt — Abstract marble texture"

# ═══════════════════════════════════════════════════════════
# TASK 2: Service Images (800x800)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 2: Service Images ═══"

generate \
  "Elegant facial treatment close-up, gentle hands applying luxurious gold-toned serum on smooth skin, warm soft diffused lighting, cream and blush tones, professional beauty treatment in luxury spa setting, soft focus blurred background, high quality commercial beauty photography, clean composition" \
  800 800 "frontend/public/assets/services/facial-treatment.png" \
  "Service — Facial Treatment"

generate \
  "Professional skin analysis consultation, magnifying glass and skincare tools arranged on cream marble surface, warm soft lighting, cream and blush color palette, professional beauty treatment setting, soft focus, high quality commercial photography, clean elegant composition, no identifiable faces" \
  800 800 "frontend/public/assets/services/skin-analysis.png" \
  "Service — Skin Analysis"

generate \
  "Luxury body treatment scene, hands gently applying rich golden body cream on smooth skin, minimalist spa setting, warm soft lighting, cream and blush tones with rose gold accents, professional beauty treatment, soft focus elegant background, high quality commercial beauty photography" \
  800 800 "frontend/public/assets/services/body-treatment.png" \
  "Service — Body Treatment"

generate \
  "Professional elegant make-up application, beauty tools and premium cosmetics arranged on cream marble surface with rose gold accents, warm soft lighting, cream and blush color palette, high-end boutique salon atmosphere, soft focus background, high quality commercial beauty photography, clean composition" \
  800 800 "frontend/public/assets/services/makeup.png" \
  "Service — Make-up"

# ═══════════════════════════════════════════════════════════
# TASK 3: Decorative Elements (1024x1024)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 3: Decorative Elements ═══"

generate \
  "Minimalist elegant section divider pattern, delicate botanical line art in soft rose gold on cream background, subtle repeating geometric pattern, high quality professional design, clean composition, warm cream and blush tones, fine line details, no text" \
  1024 1024 "frontend/public/assets/decorative/section-divider.png" \
  "Decorative — Section Divider Pattern"

generate \
  "Warm cream background texture with subtle blush undertones, soft gradient from cream to light blush, minimal elegant texture for website sections, high quality professional design, smooth warm tones, no visible pattern or noise" \
  1024 1024 "frontend/public/assets/decorative/bg-texture.png" \
  "Decorative — Background Texture"

generate \
  "Soft card background texture, warm cream with subtle blush gradient, elegant minimal surface for content cards, high quality professional design, smooth warm tones, cream and blush color palette, no text or visible patterns" \
  1024 1024 "frontend/public/assets/decorative/card-bg.png" \
  "Decorative — Card Background"

# ═══════════════════════════════════════════════════════════
# TASK 4: Testimonial Elements (256x256)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 4: Testimonial Elements ═══"

generate \
  "Elegant decorative quotation mark symbol in rose gold metallic finish, minimalist design on cream background, high quality professional icon design, clean composition, soft shadow, luxury aesthetic" \
  256 256 "frontend/public/assets/testimonials/quote-mark.png" \
  "Testimonial — Quote Mark (Rose Gold)"

generate \
  "Abstract minimalist avatar placeholder, soft cream and blush gradient in circular shape, elegant non-representational design, high quality professional icon, warm tones, subtle texture, no face or identifiable features" \
  256 256 "frontend/public/assets/testimonials/avatar-placeholder.png" \
  "Testimonial — Avatar Placeholder"

generate \
  "Elegant five-star rating icon in rose gold metallic finish, minimalist design on transparent feel cream background, high quality professional icon design, clean composition, luxury aesthetic, warm tones" \
  256 256 "frontend/public/assets/testimonials/star-rating.png" \
  "Testimonial — Star Rating Icon"

# ═══════════════════════════════════════════════════════════
# TASK 5: Blog Featured Images (1200x630)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 5: Blog Featured Images ═══"

generate \
  "Bright clean beauty treatment scene for blog featured image, professional skincare tools and products elegantly arranged on cream marble surface with fresh botanical elements, editorial magazine style photography, cream and blush color palette, soft natural lighting, high quality commercial beauty photography, wide composition for web banner" \
  1200 630 "frontend/public/assets/blog/featured-beauty-tip.png" \
  "Blog — Beauty Tip Featured Image"

generate \
  "Professional skincare product arrangement for blog article, luxury skincare bottles and jars on warm cream marble surface with soft rose gold accents, editorial beauty photography style, cream and blush color palette, bright clean lighting, high quality commercial photography, wide composition for web banner" \
  1200 630 "frontend/public/assets/blog/featured-skincare.png" \
  "Blog — Skincare Featured Image"

generate \
  "Seasonal beauty theme blog featured image, elegant autumn beauty arrangement with warm golden tones, luxurious skincare products on cream marble with dried botanicals, editorial magazine style, warm cream blush and burgundy color palette, soft golden hour lighting, high quality commercial photography, wide composition for web banner" \
  1200 630 "frontend/public/assets/blog/featured-seasonal.png" \
  "Blog — Seasonal Featured Image"

# ═══════════════════════════════════════════════════════════
# TASK 6: Product Placeholder Images (800x800)
# ═══════════════════════════════════════════════════════════

echo ""
echo "═══ TASK 6: Product Placeholder Images ═══"

generate \
  "Generic luxury beauty product bottle, elegant slender design with rose gold cap, standing on cream marble surface, commercial product photography, studio lighting with soft shadows, clean cream background, high quality professional product shot, warm tones, minimalist composition" \
  800 800 "frontend/public/assets/products/luxury-bottle.png" \
  "Product — Generic Luxury Bottle"

generate \
  "Luxury beauty serum bottle with dropper, elegant amber glass with rose gold accents, placed on cream marble surface, commercial product photography, studio lighting with dramatic shadows, clean cream background with warm blush tones, high quality professional product shot" \
  800 800 "frontend/public/assets/products/serum-bottle.png" \
  "Product — Serum Bottle"

generate \
  "Luxury cream jar with rose gold lid, elegant round white ceramic packaging, placed on cream marble surface with soft shadow, commercial product photography, studio lighting, clean cream background with warm blush undertones, high quality professional product shot, minimalist composition" \
  800 800 "frontend/public/assets/products/cream-jar.png" \
  "Product — Cream Jar"

# ═══════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  All 18 images generated successfully!                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Output directory: frontend/public/assets/"
echo ""
ls -la frontend/public/assets/hero/
ls -la frontend/public/assets/services/
ls -la frontend/public/assets/products/
ls -la frontend/public/assets/testimonials/
ls -la frontend/public/assets/blog/
ls -la frontend/public/assets/decorative/
```

---

## Individual Commands (Run One at a Time)

Use these if you prefer to generate images selectively or retry individual assets.

### Task 1: Hero Images (1920×1080)

**Hero Main — Spa Treatment Room**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elegant luxury cosmetician spa treatment room, warm golden hour sunlight streaming through sheer cream curtains, soft cream and blush color palette, luxurious marble surfaces with rose gold accents, soft diffused natural light, minimal clean composition, high quality professional photography style, wide angle, cinematic composition, feminine elegance, boutique salon atmosphere, no people or faces",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed, identifiable face, person face, portrait, headshot",
    "steps": 35,
    "width": 1920,
    "height": 1080,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/hero/hero-main.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Hero Alt — Abstract Marble Texture**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury beauty abstract texture, cream white marble surface with rose gold metallic accents, soft cream and blush color palette, elegant minimal composition, high quality professional photography style, commercial aesthetic, warm tones, subtle golden shimmer details, smooth polished surface, no text or logos",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1920,
    "height": 1080,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/hero/hero-alt.png','wb').write(base64.b64decode(data['images'][0]))"
```

### Task 2: Service Images (800×800)

**Facial Treatment**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elegant facial treatment close-up, gentle hands applying luxurious gold-toned serum on smooth skin, warm soft diffused lighting, cream and blush tones, professional beauty treatment in luxury spa setting, soft focus blurred background, high quality commercial beauty photography, clean composition",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed, identifiable face, person face, portrait, headshot",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/services/facial-treatment.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Skin Analysis**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional skin analysis consultation, magnifying glass and skincare tools arranged on cream marble surface, warm soft lighting, cream and blush color palette, professional beauty treatment setting, soft focus, high quality commercial photography, clean elegant composition, no identifiable faces",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/services/skin-analysis.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Body Treatment**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury body treatment scene, hands gently applying rich golden body cream on smooth skin, minimalist spa setting, warm soft lighting, cream and blush tones with rose gold accents, professional beauty treatment, soft focus elegant background, high quality commercial beauty photography",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed, identifiable face, person face, portrait",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/services/body-treatment.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Make-up**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional elegant make-up application, beauty tools and premium cosmetics arranged on cream marble surface with rose gold accents, warm soft lighting, cream and blush color palette, high-end boutique salon atmosphere, soft focus background, high quality commercial beauty photography, clean composition",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/services/makeup.png','wb').write(base64.b64decode(data['images'][0]))"
```

### Task 3: Decorative Elements (1024×1024)

**Section Divider Pattern**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Minimalist elegant section divider pattern, delicate botanical line art in soft rose gold on cream background, subtle repeating geometric pattern, high quality professional design, clean composition, warm cream and blush tones, fine line details, no text",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1024,
    "height": 1024,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/decorative/section-divider.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Background Texture**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Warm cream background texture with subtle blush undertones, soft gradient from cream to light blush, minimal elegant texture for website sections, high quality professional design, smooth warm tones, no visible pattern or noise",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1024,
    "height": 1024,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/decorative/bg-texture.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Card Background**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Soft card background texture, warm cream with subtle blush gradient, elegant minimal surface for content cards, high quality professional design, smooth warm tones, cream and blush color palette, no text or visible patterns",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1024,
    "height": 1024,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/decorative/card-bg.png','wb').write(base64.b64decode(data['images'][0]))"
```

### Task 4: Testimonial Elements (256×256)

**Quote Mark (Rose Gold)**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elegant decorative quotation mark symbol in rose gold metallic finish, minimalist design on cream background, high quality professional icon design, clean composition, soft shadow, luxury aesthetic",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 256,
    "height": 256,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/testimonials/quote-mark.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Avatar Placeholder**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Abstract minimalist avatar placeholder, soft cream and blush gradient in circular shape, elegant non-representational design, high quality professional icon, warm tones, subtle texture, no face or identifiable features",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed, face, person, portrait",
    "steps": 35,
    "width": 256,
    "height": 256,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/testimonials/avatar-placeholder.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Star Rating**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elegant five-star rating icon in rose gold metallic finish, minimalist design on transparent feel cream background, high quality professional icon design, clean composition, luxury aesthetic, warm tones",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 256,
    "height": 256,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/testimonials/star-rating.png','wb').write(base64.b64decode(data['images'][0]))"
```

### Task 5: Blog Featured Images (1200×630)

**Beauty Tip**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Bright clean beauty treatment scene for blog featured image, professional skincare tools and products elegantly arranged on cream marble surface with fresh botanical elements, editorial magazine style photography, cream and blush color palette, soft natural lighting, high quality commercial beauty photography, wide composition for web banner",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1200,
    "height": 630,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/blog/featured-beauty-tip.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Skincare**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional skincare product arrangement for blog article, luxury skincare bottles and jars on warm cream marble surface with soft rose gold accents, editorial beauty photography style, cream and blush color palette, bright clean lighting, high quality commercial photography, wide composition for web banner",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1200,
    "height": 630,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/blog/featured-skincare.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Seasonal**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Seasonal beauty theme blog featured image, elegant autumn beauty arrangement with warm golden tones, luxurious skincare products on cream marble with dried botanicals, editorial magazine style, warm cream blush and burgundy color palette, soft golden hour lighting, high quality commercial photography, wide composition for web banner",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1200,
    "height": 630,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/blog/featured-seasonal.png','wb').write(base64.b64decode(data['images'][0]))"
```

### Task 6: Product Placeholders (800×800)

**Generic Luxury Bottle**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generic luxury beauty product bottle, elegant slender design with rose gold cap, standing on cream marble surface, commercial product photography, studio lighting with soft shadows, clean cream background, high quality professional product shot, warm tones, minimalist composition",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/products/luxury-bottle.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Serum Bottle**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury beauty serum bottle with dropper, elegant amber glass with rose gold accents, placed on cream marble surface, commercial product photography, studio lighting with dramatic shadows, clean cream background with warm blush tones, high quality professional product shot",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/products/serum-bottle.png','wb').write(base64.b64decode(data['images'][0]))"
```

**Cream Jar**
```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury cream jar with rose gold lid, elegant round white ceramic packaging, placed on cream marble surface with soft shadow, commercial product photography, studio lighting, clean cream background with warm blush undertones, high quality professional product shot, minimalist composition",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
  }' \
  | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('frontend/public/assets/products/cream-jar.png','wb').write(base64.b64decode(data['images'][0]))"
```

---

## Quality Checklist

After generating each image, verify:

| # | Check | Details |
|---|-------|---------|
| 1 | On-brand colors | Warm cream, blush, rose gold, burgundy tones |
| 2 | Clean composition | No visual clutter, focused subject |
| 3 | No artifacts | No distorted features, weird text, or watermark-like elements |
| 4 | Appropriate | Suitable for professional cosmetician website |
| 5 | Correct dimensions | Matches intended use (hero, card, thumbnail) |

If an image fails quality checks, regenerate with modified prompt:
- Add more specific style keywords if composition is off
- Increase `cfg_scale` (7-8) for more prompt adherence
- Decrease `cfg_scale` (5-5.5) if artifacts appear
- Add unwanted elements to the negative prompt

---

## Expected Output Structure

```
frontend/public/assets/
├── hero/
│   ├── hero-main.png           (1920×1080) — Spa treatment room
│   └── hero-alt.png            (1920×1080) — Abstract marble texture
├── services/
│   ├── facial-treatment.png    (800×800)
│   ├── skin-analysis.png       (800×800)
│   ├── body-treatment.png      (800×800)
│   └── makeup.png              (800×800)
├── products/
│   ├── luxury-bottle.png       (800×800)
│   ├── serum-bottle.png        (800×800)
│   └── cream-jar.png           (800×800)
├── testimonials/
│   ├── quote-mark.png          (256×256)
│   ├── avatar-placeholder.png  (256×256)
│   └── star-rating.png         (256×256)
├── blog/
│   ├── featured-beauty-tip.png (1200×630)
│   ├── featured-skincare.png   (1200×630)
│   └── featured-seasonal.png   (1200×630)
└── decorative/
    ├── section-divider.png     (1024×1024)
    ├── bg-texture.png          (1024×1024)
    └── card-bg.png             (1024×1024)
```

**Total: 18 images across 6 categories.**
