-- Create Post table
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- Create Author table
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- Create PostAuthor junction table
CREATE TABLE "PostAuthor" (
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "PostAuthor_pkey" PRIMARY KEY ("postId", "authorId")
);

-- Create indexes
CREATE INDEX "Post_slug_idx" ON "Post"("slug");
CREATE INDEX "Post_status_idx" ON "Post"("status");
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- Create unique constraints
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

-- Create foreign keys
ALTER TABLE "PostAuthor" ADD CONSTRAINT "PostAuthor_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostAuthor" ADD CONSTRAINT "PostAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
