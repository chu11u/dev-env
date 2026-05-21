"use client";

import { useState } from "react";
import { useAuth } from "./auth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getPosts } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
}

function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(password);
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
            Sarit Elkayam
          </h1>
          <p className="font-body text-charcoal-500">Admin Panel</p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-6">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
                {error}
              </div>
            )}

            <Input
              type="password"
              label="Password"
              name="password"
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || !password}
              className="w-full"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <a
            href="/"
            className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
          Dashboard
        </h1>
        <p className="font-body text-charcoal-500">
          Welcome to the admin panel. Manage your blog content here.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-charcoal-500 mb-1">
                Total Posts
              </p>
              <p className="font-heading text-3xl font-bold text-charcoal-800">
                {posts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <span className="font-heading text-rose-600 text-xl">✦</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-charcoal-500 mb-1">
                Published
              </p>
              <p className="font-heading text-3xl font-bold text-charcoal-800">
                {posts.filter((p) => p.status === "PUBLISHED").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
              <span className="font-heading text-gold-600 text-xl">★</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm text-charcoal-500 mb-1">Drafts</p>
              <p className="font-heading text-3xl font-bold text-charcoal-800">
                {posts.filter((p) => p.status === "DRAFT").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-charcoal-100 rounded-xl flex items-center justify-center">
              <span className="font-heading text-charcoal-600 text-xl">✎</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-4">
          Quick Actions
        </h2>
        <div className="flex gap-3">
          <Button href="/admin/blog/new" variant="primary">
            + New Blog Post
          </Button>
          <Button href="/admin/blog" variant="outline">
            Manage Posts
          </Button>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-4">
          Recent Posts
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-cream-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-cream-100 rounded w-1/4"></div>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-body text-charcoal-500 mb-4">
              No posts yet. Create your first post to get started.
            </p>
            <Button href="/admin/blog/new" variant="primary">
              Create your first post
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-center justify-between">
                  <a
                    href={`/admin/blog/${post.id}`}
                    className="font-body font-medium text-charcoal-800 hover:text-rose-400 transition-colors"
                  >
                    {post.title}
                  </a>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-charcoal-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "Unpublished"}
                    </span>
                    <span
                      className={`
                        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${post.status === "PUBLISHED" ? "bg-gold-100 text-gold-700" : "bg-charcoal-100 text-charcoal-600"}
                        `}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <Login />;
}
