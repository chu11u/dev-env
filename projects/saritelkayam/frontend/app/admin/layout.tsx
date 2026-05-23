import AdminLayout from "@/components/admin/AdminLayout";

// Prevent Next.js from trying to statically prerender admin pages
export const dynamic = "force-dynamic";

export default function AdminServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
