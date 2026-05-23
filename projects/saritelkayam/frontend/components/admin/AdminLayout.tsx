"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/app/admin/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LocaleProvider } from "@/lib/i18n";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LocaleProvider>
        <AdminInnerLayout>{children}</AdminInnerLayout>
      </LocaleProvider>
    </AuthProvider>
  );
}

function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [clientPath, setClientPath] = useState<string | null>(null);

  // Only runs on client — safely get current path
  useEffect(() => {
    setClientPath(window.location.pathname);
  }, []);

  // Redirect unauthenticated users from nested admin routes
  useEffect(() => {
    if (!isAuthenticated && clientPath && clientPath !== "/admin") {
      if (clientPath.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
  }, [isAuthenticated, clientPath]);

  // SSR fallback or still loading — show placeholder
  if (clientPath === null) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading...</p>
      </div>
    );
  }

  // Not authenticated — only show login form on /admin
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminSidebar />

      <main className="lg:me-64">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
