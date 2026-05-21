# Skill: Prisma ORM

## Overview

Prisma ORM for PostgreSQL. Type-safe database access with auto-generated client, migrations, and schema-first development.

## Project-Specific Schema

### Database: PostgreSQL 16
### Connection: Via docker-compose, `postgresql://saritelkayam:saritelkayam_password@postgres:5432/saritelkayam`

### Schema Design

```prisma
// backend/prisma/schema.prisma

generator client {
    provider = "prisma-client-js"
    output   = "../generated/prisma"
}

datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

enum PostStatus {
    DRAFT
    PUBLISHED
}

model Post {
    id            String      @id @default(cuid())
    title         String
    slug          String      @unique
    excerpt       String
    content       String      @db.Text
    featuredImage String?
    status        PostStatus  @default(DRAFT)
    publishedAt   DateTime?
    createdAt     DateTime    @default(now())
    updatedAt     DateTime    @updatedAt
    
    authors       Author[]
    
    @@index([slug])
    @@index([status])
    @@index([publishedAt])
}

model Author {
    id        String   @id @default(cuid())
    name      String
    email     String   @unique
    avatar    String?
    bio       String?  @db.Text
    posts     Post[]
    createdAt DateTime @default(now())
}

// If we add services to DB in the future:
model Service {
    id          String   @id @default(cuid())
    name        String
    description String   @db.Text
    price       Float?
    duration    Int?       // in minutes
    category    String
    image       String?
    isActive    Boolean  @default(true)
    sortOrder   Int      @default(0)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    @@index([category])
    @@index([isActive])
}
```

## Prisma Client Singleton

```ts
// backend/lib/db.ts
import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
```

**Why singleton?** Prevents multiple Prisma client instances in development (hot reload causes multiple instances, which exhaust database connections).

## Common Query Patterns

### Create

```ts
import db from './lib/db'

// Create a new post
const post = await db.post.create({
    data: {
        title: 'My First Post',
        slug: 'my-first-post',
        excerpt: 'A brief summary...',
        content: 'Full markdown content...',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        featuredImage: '/assets/blog/my-first-post.png',
    },
})
```

### Read

```ts
// List published posts (for public API)
const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: { authors: true },
    take: 20,
    skip: 0,
})

// Single post by slug (for detail page)
const post = await db.post.findUnique({
    where: { slug: 'my-first-post' },
    include: { authors: true },
})

// Count by status (for admin dashboard)
const counts = await db.post.groupBy({
    by: ['status'],
    _count: true,
})
```

### Update

```ts
const updated = await db.post.update({
    where: { id: post.id },
    data: {
        title: 'Updated Title',
        content: 'Updated content...',
    },
})
```

### Delete

```ts
await db.post.delete({
    where: { id: post.id },
})
```

## Migration Workflow

```bash
# After changing schema.prisma:
cd backend
npx prisma migrate dev --name "description_of_change"

# This generates a migration file in prisma/migrations/
# And updates the Prisma client

# To generate client without migration (e.g., in Docker build):
npx prisma generate

# To apply migrations in production:
npx prisma migrate deploy
```

## Docker Build Considerations

In the Dockerfile, generate the Prisma client during build:

```dockerfile
# Copy prisma schema first (for layer caching)
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy rest of application
COPY . .

# Run migrations on container start
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

## Markdown Content Pipeline

### Writing Markdown Files from Prisma Data

```ts
import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'content', 'posts')

export async function savePostAsMarkdown(post) {
    const frontmatter = `---
title: ${post.title}
slug: ${post.slug}
excerpt: ${post.excerpt}
featuredImage: ${post.featuredImage || ''}
status: ${post.status}
publishedAt: ${post.publishedAt?.toISOString() || ''}
authors: ${post.authors.map(a => a.name).join(', ')}
---

${post.content}
`
    
    const filePath = path.join(CONTENT_DIR, `${post.slug}.md`)
    fs.writeFileSync(filePath, frontmatter, 'utf-8')
    return filePath
}
```

### Reading Markdown Files (Frontend Side)

See `.skills/nextjs-app-router.md` for the markdown reading patterns on the frontend side. The Prisma side stores the data, the frontend reads from markdown files for static generation.

## Database Constraints & Best Practices

### Indexes
- Always index fields used in WHERE clauses
- Composite indexes for multi-field queries
- Prisma's `@@index` for composite indexes, `@index` for single-field

### Data Types
- Use `String` for text fields, `String @db.Text` for long content
- Use `DateTime` with `@default(now())` for timestamps
- Use `@updatedAt` for automatic update tracking
- Use `cuid()` for IDs (not auto-increment — better for distributed systems)

### Relations
- Use explicit relations with naming: `authors Author[]`
- Cascade deletes where appropriate: `@relation(onDelete: Cascade)`
- Optional relations with `?`: `featuredImage String?`

## Do Not

### Don't: Expose Internal IDs to Frontend

```prisma
// Use slug for public-facing routes, not internal ID
// slug is URL-safe and doesn't expose internal structure
```

### Don't: Forget to Generate Client After Schema Changes

Always run `npx prisma generate` after changing `schema.prisma`. In Docker, include this in the build step.

### Don't: Use Raw SQL When Prisma Can Do It

```ts
// ❌ Avoid raw SQL
await db.$queryRaw`SELECT * FROM Post WHERE status = 'PUBLISHED'`

// ✅ Use Prisma's type-safe API
await db.post.findMany({ where: { status: 'PUBLISHED' } })
```

### Don't: Load All Relations by Default

```ts
// ❌ Eager load everything (performance issue)
const posts = await db.post.findMany({ include: { authors: true, comments: true, tags: true } })

// ✅ Select only what you need
const posts = await db.post.findMany({ include: { authors: true } })
```
