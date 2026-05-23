"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// Prevent Next.js from trying to statically prerender admin pages
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminInnerLayout>{children}</AdminInnerLayout>
    </AuthProvider>
  );
}

function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [clientPath, setClientPath] = useState<string | null>(null);

  useEffect(() => {
    setClientPath(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && clientPath && clientPath !== "/admin") {
      if (clientPath.startsWith("/admin")) {
        window.location.href = "/admin";
      }
    }
  }, [isAuthenticated, clientPath]);

  if (clientPath === null) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (clientPath === "/admin") {
      return <div className="min-h-screen bg-cream-50">{children}</div>;
    }
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
