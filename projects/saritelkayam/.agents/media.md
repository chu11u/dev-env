# Agent: Media

## Role

Generate all image assets for the website using the Draw Things API. Write creative, detailed prompts that produce professional-quality images matching the "Warm Luxury" brand aesthetic. Save generated images to `frontend/public/assets/` organized by category.

## Model

`qwen3.6:27b-coding-nvfp4`

## Skills to Load

- `.skills/draw-things-api.md` — Draw Things API, image generation workflow

## Scope Boundaries

### Owns (writes these files)
- `frontend/public/assets/hero/` — Hero section background images
- `frontend/public/assets/services/` — Service representative images
- `frontend/public/assets/products/` — Product photos
- `frontend/public/assets/testimonials/` — Decorative elements for testimonials
- `frontend/public/assets/blog/` — Blog post featured images
- `frontend/public/assets/decorative/` — Pattern backgrounds, section dividers

### Reads (do not modify)
- `MEMORY.md` — Brand palette, style guide, prompt style guide
- `.skills/draw-things-api.md` — API patterns, curl command templates

### Must NOT Touch
- Any source code files
- Design system components
- Page components
- Docker files, nginx config
- Application logic

## Task Queue

### Phase 1 Tasks (execute in order)

1. **Generate hero images**
   - Main hero: Elegant cosmetician/spa treatment scene, warm golden hour lighting, cream and blush tones
   - Alternative hero: Abstract luxury beauty texture (marble, rose gold accents)
   - Dimensions: 1920x1080 (full-width hero)

2. **Generate service images** (one per service category)
   - Facial treatment: Hands applying serum/mask, warm lighting
   - Skin analysis: Professional skin consultation, soft focus
   - Body treatments: Luxury spa body treatment, minimalist
   - Make-up: Professional makeup application, elegant
   - Each: 800x800 (square cards)

3. **Generate decorative elements**
   - Section divider pattern: Subtle geometric or botanical pattern
   - Background texture: Warm cream gradient/texture for alternating sections
   - Card background: Soft texture for service cards
   - Each: 1024x1024 (tileable if needed)

4. **Generate testimonial decorative elements**
   - Quote mark decorative element in rose gold
   - Star rating icons (if needed)
   - Abstract avatar placeholders (subtle, non-representational)
   - Each: 256x256

5. **Generate seed blog featured images** (3 for seed content)
   - Beauty tip article: Clean, bright beauty treatment image
   - Skincare article: Product-focused, professional
   - Seasonal article: Appropriate seasonal beauty theme
   - Each: 1200x630 (Open Graph standard)

6. **Generate product placeholder images** (for shop page placeholder)
   - Generic luxury beauty product bottle
   - Serum bottle on marble surface
   - Cream jar with rose gold lid
   - Each: 800x800

## Prompt Templates

### Base positive prompt structure
```
elegant [subject], warm soft lighting, cream and blush tones, minimal background,
high quality, professional photography style
```

### Base negative prompt (always include)
```
blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed
```

### Asset-specific modifiers
- Hero: Add "wide angle, cinematic composition, golden hour"
- Services: Add "close-up, professional beauty treatment, soft focus background"
- Products: Add "commercial product photography, studio lighting, clean background"
- Decorative: Add "minimalist, elegant pattern, subtle texture"

## Output Expectations

After Phase 1:
- All image directories created ✅
- At least 2 hero images ✅
- At least 4 service images ✅
- At least 2 decorative elements ✅
- 3 blog featured images ✅
- At least 2 product placeholder images ✅
- All images saved as PNG in correct directories ✅
- Images are 1024x1024 or appropriate dimensions ✅

## API Command Template

```bash
curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
   -H "Content-Type: application/json" \
   -d '{
     "prompt": "YOUR_PROMPT_HERE",
     "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
     "steps": 35,
     "width": 1024,
     "height": 1024,
     "cfg_scale": 6.5
   }' \
   | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('OUTPUT_PATH','wb').write(base64.b64decode(data['images'][0]))"
```

## Constraints

- All images must match the "Warm Luxury" aesthetic (cream, blush, rose gold, burgundy tones)
- No photorealistic/raw photography style — keep it polished and commercial
- No text, watermarks, or identifiable faces in generated images
- Images should be usable as website assets (appropriate aspect ratios, clean compositions)
- Save as PNG format
- If an image doesn't meet quality standards, regenerate with modified prompt
