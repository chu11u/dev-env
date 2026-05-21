"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Only protect nested admin routes (blog/, etc.)
  // The /admin page itself handles login UI
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      // Check if we're on a nested admin route
      const path = window.location.pathname;
      if (path !== "/admin" && path.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Only show children when on /admin (the login page)
    const path = window.location.pathname;
    if (path !== "/admin") {
      return null; // Redirecting to login...
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {isAuthenticated && (
        <div className="bg-white border-b border-cream-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a
              href="/admin"
              className="font-heading text-xl font-semibold text-charcoal-800 hover:text-rose-400 transition-colors"
            >
              Sarit Elkayam{" "}
              <span className="text-sm font-body font-normal text-charcoal-400">
                — Admin
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors"
              >
                View Site
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem("admin_token");
                  window.location.href = "/admin";
                }}
                className="font-body text-sm text-charcoal-500 hover:text-burgundy-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
