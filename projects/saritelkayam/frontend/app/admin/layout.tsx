"use client";

import { useEffect } from "react";
import { AuthProvider, useAuth } from "./auth";
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

  useEffect(() => {
    if (!isAuthenticated) {
      const path = window.location.pathname;
      if (path !== "/admin" && path.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    const path = window.location.pathname;
    if (path !== "/admin") {
      return null;
    }
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
