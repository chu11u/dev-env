#!/bin/bash
# Generate all image assets for Sarit Elkayam website
# Run from: dev-env/projects/saritelkayam/
# Requires: Draw Things API running at http://localhost:7860
# Model: juggernaut_xl_ragnarok_f16.ckpt

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
    echo "   ✓ Saved ($size bytes)"
}

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Sarit Elkayam — Image Asset Generator                  ║"
echo "║  Model: Juggernaut XL Ragnarok                         ║"
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
echo "║  All 18 images generated successfully!                   ║"
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
