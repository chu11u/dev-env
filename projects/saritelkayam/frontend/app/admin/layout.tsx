"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LocaleProvider } from "@/lib/i18n";

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
    <LocaleProvider>
      <div className="min-h-screen bg-cream-50">
        {isAuthenticated && <AdminSidebar />}

        <main className="lg:me-64">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">{children}</div>
        </main>
      </div>
    </LocaleProvider>
  );
}
