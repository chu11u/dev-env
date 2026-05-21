# Skill: Draw Things API

## Overview

Draw Things API for local AI image generation. Uses `juggernaut_xl_ragnarok_f16.ckpt` model with DPM++ 2M Karras sampler. Runs on `localhost:7860`.

## API Endpoint

```
POST http://localhost:7860/sdapi/v1/txt2img
Content-Type: application/json
```

### Response

```json
{
    "images": ["base64_encoded_png_image..."]
}
```

### Current Model Settings

| Setting | Value |
|---|---|
| Model | `juggernaut_xl_ragnarok_f16.ckpt` |
| Sampler | DPM++ 2M Karras |
| Steps | 35 |
| Guidance Scale | 6.5 |
| Shift | 1 |
| Min dimensions | 128x128 |
| Max dimensions | 8192x8192 |

## Standard Generation Command

### Curl Template

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
    | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('output.png','wb').write(base64.b64decode(data['images'][0]))"
```

## Prompt Engineering for This Project

### Brand Aesthetic: "Warm Luxury"

Every prompt should produce images that match the cosmetician brand: warm tones, elegant, clean, professional.

### Base Prompt Structure

```
elegant [subject], warm soft lighting, cream and blush tones, minimal background,
high quality, professional photography style
```

### Negative Prompt (always include)

```
blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed
```

### Asset-Specific Prompt Modifiers

| Asset Type | Add to Prompt | Dimensions |
|---|---|---|
| Hero background | `wide angle, cinematic composition, golden hour, luxurious spa atmosphere` | 1920x1080 |
| Service card | `close-up, professional beauty treatment, soft focus background, clean composition` | 800x800 |
| Product photo | `commercial product photography, studio lighting, clean cream background, marble surface` | 800x800 |
| Blog featured | `bright and clean, professional beauty imagery, editorial style` | 1200x630 |
| Decorative pattern | `minimalist, elegant pattern, subtle texture, cream background, repeating geometric` | 1024x1024 |
| Testimonial avatar | `abstract, non-representational, soft cream tones, minimalist design, circular` | 256x256 |

## Example Prompts

### Hero — Main

```json
{
    "prompt": "elegant cosmetician spa treatment room, warm golden hour lighting streaming through sheer curtains, cream and blush tones, luxurious marble surfaces, soft diffused light, minimal background, high quality, professional photography style, wide angle, cinematic composition, feminine elegance, boutique salon atmosphere",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1920,
    "height": 1080,
    "cfg_scale": 6.5
}
```

### Hero — Abstract Alternative

```json
{
    "prompt": "luxury beauty texture, cream marble surface with rose gold accents, soft cream and blush color palette, elegant minimal background, high quality, professional photography style, commercial aesthetic, warm tones, golden shimmer details",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1920,
    "height": 1080,
    "cfg_scale": 6.5
}
```

### Service — Facial Treatment

```json
{
    "prompt": "elegant facial treatment, hands gently applying luxurious serum to face, close-up, warm soft lighting, cream and blush tones, professional beauty treatment, soft focus background, high quality, commercial beauty photography",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
}
```

### Product — Serum Bottle

```json
{
    "prompt": "luxury beauty serum bottle on cream marble surface, commercial product photography, studio lighting, soft rose gold accents, clean cream background, elegant packaging, professional product shot, high quality",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 800,
    "height": 800,
    "cfg_scale": 6.5
}
```

### Blog Featured — Beauty Tips

```json
{
    "prompt": "bright and clean beauty treatment scene, professional skincare session, editorial style photography, cream and blush color palette, soft natural lighting, high quality, commercial beauty magazine style",
    "negative_prompt": "blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed",
    "steps": 35,
    "width": 1200,
    "height": 630,
    "cfg_scale": 6.5
}
```

## Batch Generation Script

For generating multiple images at once, use this Python pattern:

```bash
cat << 'EOF' > generate_images.sh
#!/bin/bash

generate() {
    local prompt="$1"
    local negative="$2"
    local width="$3"
    local height="$4"
    local output="$5"
    
    curl -s -X POST http://localhost:7860/sdapi/v1/txt2img \
        -H "Content-Type: application/json" \
        -d "{
          \"prompt\": \"${prompt}\",
          \"negative_prompt\": \"${negative}\",
          \"steps\": 35,
          \"width\": ${width},
          \"height\": ${height},
          \"cfg_scale\": 6.5
        }" \
        | python3 -c "import sys, base64, json; data=json.load(sys.stdin); open('${output}','wb').write(base64.b64decode(data['images'][0]))"
    
    echo "Generated: $output"
}

NEGATIVE="blurry, low quality, distorted, text, watermark, messy, noisy, grainy, ugly, deformed"

# Hero images
generate "elegant cosmetician spa treatment room, warm golden hour lighting, cream and blush tones, luxurious marble surfaces, soft diffused light, minimal background, high quality, professional photography, wide angle, cinematic composition, feminine elegance" \
    "$NEGATIVE" 1920 1080 "frontend/public/assets/hero/hero-main.png"

generate "luxury beauty texture, cream marble with rose gold accents, soft cream and blush tones, elegant minimal background, high quality, commercial aesthetic, warm tones, golden shimmer" \
    "$NEGATIVE" 1920 1080 "frontend/public/assets/hero/hero-alt.png"

echo "Done! All images generated."
EOF

chmod +x generate_images.sh
./generate_images.sh
```

## Quality Assessment Checklist

After generating each image, evaluate:

1. **On-brand colors?** — Warm cream, blush, rose gold, burgundy tones
2. **Clean composition?** — No visual clutter, focused subject
3. **No artifacts?** — No distorted features, weird text, or watermark-like elements
4. **Appropriate for use?** — Suitable for a professional cosmetician website
5. **Correct dimensions?** — Matches the intended use (hero, card, thumbnail)

If any check fails, regenerate with a modified prompt. Adjust:
- Add more specific style keywords if composition is off
- Increase/decrease `cfg_scale` (higher = more prompt adherence, but can introduce artifacts)
- Modify the negative prompt to exclude specific unwanted elements

## Directory Structure

```
frontend/public/assets/
├── hero/
│   ├── hero-main.png          (1920x1080) Main hero background
│   └── hero-alt.png           (1920x1080) Alternative hero
├── services/
│   ├── facial-treatment.png   (800x800)
│   ├── skin-analysis.png      (800x800)
│   ├── body-treatment.png     (800x800)
│   └── makeup.png             (800x800)
├── products/
│   ├── serum-bottle.png       (800x800)
│   └── cream-jar.png          (800x800)
├── testimonials/
│   ├── quote-mark.png         (256x256)
│   └── avatar-placeholder.png (256x256)
├── blog/
│   ├── featured-1.png         (1200x630)
│   ├── featured-2.png         (1200x630)
│   └── featured-3.png         (1200x630)
└── decorative/
    ├── section-divider.png    (1024x1024)
    ├── bg-texture.png         (1024x1024)
    └── card-bg.png            (1024x1024)
```

## Do Not

### Don't: Include People's Faces

The brand needs elegance without privacy concerns. Use hands, products, textures, and abstract compositions.

### Don't: Generate at Wrong Dimensions

Generate at the correct final size (or 2x for retina). Don't upscale/downscale after generation — quality suffers.

### Don't: Skip the Negative Prompt

Always include the full negative prompt. Juggernaut XL responds strongly to negative prompts.

### Don't: Generate Images Not in the Asset Plan

Stay within the planned asset list. Don't generate extras that aren't needed — we can always generate more later.
