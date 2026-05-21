# Skill: Next.js 15 App Router

## Overview

Next.js 15 with App Router (React 19). Server Components by default, explicit client boundaries, streaming, and optimized data fetching.

## Project-Specific Context

- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS 4 (or 3 — check project config)
- **Fonts**: Google Fonts via `next/font/google` (Playfair Display + Inter)
- **Images**: Next.js Image component + local storage
- **Deployment**: Docker + nginx (not Vercel)

## App Router Patterns

### Directory Structure

```
app/
├── layout.tsx          # Root layout (wraps all pages)
├── page.tsx            # Home page (/)
├── not-found.tsx       # 404 page
├── robots.ts           # robots.txt generation
├── sitemap.ts          # Dynamic sitemap
├── manifest.ts         # PWA manifest
├── services/
│    └── page.tsx       # /services
├── blog/
│    ├── page.tsx       # /blog (listing)
│    └── [slug]/
│         └── page.tsx  # /blog/[slug]
├── admin/
│    ├── layout.tsx     # Admin-only layout (auth guard)
│    ├── page.tsx       # Admin dashboard
│    └── blog/
│         ├── page.tsx       # Admin blog list
│         ├── new/
│         │    └── page.tsx  # New post form
│         └── [id]/
│              └── page.tsx  # Edit post
```

### Server Components (default)

All components in App Router are Server Components by default. No `"use client"` needed for most pages.

```tsx
// Server Component — no directive needed
export default function Page() {
    return <h1>Server rendered</h1>
}
```

### Client Components

Only add `"use client"` when you need:
- State/hooks (`useState`, `useEffect`, `useContext`)
- Event handlers that need client-side interactivity
- Browser APIs
- Third-party libraries that require client-side rendering

```tsx
"use client"

import { useState } from 'react'

export default function InteractiveComponent() {
    const [open, setOpen] = useState(false)
    return <button onClick={() => setOpen(!open)}>{open ? 'Close' : 'Open'}</button>
}
```

### Metadata (SEO)

```tsx
// Static metadata
export const metadata = {
    title: 'Sarit Elkayam | Professional Cosmetician',
    description: 'Professional cosmetician services... ',
    openGraph: {
        title: 'Sarit Elkayam',
        description: 'Professional cosmetician services...',
        images: ['/assets/hero/og-image.png'],
    },
}

// Dynamic metadata (Server Component)
export async function generateMetadata({ params }) {
    const post = await getPost(params.slug)
    return {
        title: `${post.title} | Sarit Elkayam Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.featuredImage],
        },
    }
}
```

### Dynamic Routes

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
    const posts = await getPostSlugs()
    return posts.map((slug) => ({ slug }))
}

export default async function Page({ params }) {
    const { slug } = await params
    const post = await getPost(slug)
    if (!post) notFound()
    return <article>{/* render post */}</article>
}
```

### Nested Layouts

```tsx
// app/admin/layout.tsx — wraps all admin pages
export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <main className="p-8">{children}</main>
        </div>
    )
}
```

### API Routes (App Router)

```tsx
// app/api/blog/posts/route.ts — GET handler
export async function GET() {
    const posts = await db.post.findMany({ where: { status: 'published' } })
    return Response.json(posts)
}

// app/api/admin/blog/posts/route.ts — POST handler
export async function POST(request: Request) {
    const body = await request.json()
    const post = await db.post.create({ data: body })
    return Response.json(post, { status: 201 })
}
```

### Streaming with Suspense

```tsx
import { Suspense } from 'react'

export default function Page() {
    return (
        <main>
            <h1>Blog</h1>
            <Suspense fallback={<PostsSkeleton />}>
                <PostsList />
            </Suspense>
        </main>
    )
}
```

## Markdown Rendering (Blog)

### Reading Markdown Files

```ts
// lib/blog.ts
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), 'public', 'content', 'posts')

export function getPostSlugs(): string[] {
    const files = fs.readdirSync(CONTENT_DIR)
    return files.map(f => f.replace('.md', ''))
}

export function getPost(slug: string) {
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    if (!fs.existsSync(filePath)) return null
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)
    return { slug, ...frontmatter, content: body }
}

function parseFrontmatter(content: string) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (!match) return { frontmatter: {}, body: content }
    
    const frontmatter = Object.fromEntries(
        match[1].split('\n').filter(Boolean).map(line => {
            const [key, ...value] = line.split(': ')
            return [key.toLowerCase(), value.join(': ')]
        })
    )
    return { frontmatter, body: match[2] }
}
```

### Markdown to HTML (server-side)

```tsx
// Use a markdown library like gray-matter + remark
import grayMatter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export async function getPostContent(slug: string) {
    const file = fs.readFileSync(contentPath, 'utf-8')
    const { data, content } = grayMatter(file)
    const result = await remark().use(html).process(content)
    return { frontmatter: data, htmlString: result.toString() }
}
```

## Image Optimization

```tsx
import Image from 'next/image'

// Local image
<Image src="/assets/hero/hero-main.png" alt="Hero" width={1920} height={1080} />

// With next.config.js settings
// images: {
//    remotePatterns: [], // not needed for local images
//    formats: ['image/webp', 'image/avif'],
// }
```

## Common Patterns to Avoid

### Don't: Use useEffect for data fetching in App Router

```tsx
// ❌ WRONG — don't do this in App Router pages
"use client"
export default function Page() {
    const [data, setData] = useState([])
    useEffect(() => { fetch('/api/data').then(r => r.json()).then(setData) }, [])
    return <div>{/* render data */}</div>
}

// ✅ RIGHT — fetch directly in Server Components
export default async function Page() {
    const data = await fetch('/api/data').then(r => r.json())
    return <div>{/* render data */}</div>
}
```

### Don't: Add "use client" to every component

Only add it when the component needs hooks or browser APIs. Keep the majority of your app as Server Components for performance.

### Don't: Inline large components in pages

Extract reusable sections into `components/sections/` to keep pages clean and maintainable.

## TypeScript Configuration

```json
{
    "compilerOptions": {
        "target": "ES2017",
        "lib": ["dom", "dom.iterable", "esnext"],
        "jsx": "preserve",
        "module": "esnext",
        "moduleResolution": "bundler",
        "strict": true,
        "incremental": true,
        "skipLibCheck": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "plugins": [{ "name": "next" }]
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    "exclude": ["node_modules"]
}
```
