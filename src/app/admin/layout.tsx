import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminOrEditor, getCurrentUser } from "@/lib/auth-server";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminTopBar from "@/components/admin/admin-topbar";

export const metadata: Metadata = {
  title: "Admin - App de Conferencias",
  description: "Panel de administración",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has admin/editor role
  const user = await getCurrentUser();
  const hasAccess = await isAdminOrEditor();

  if (!user || !hasAccess) {
    redirect("/login?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop: Sidebar + Content */}
      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <AdminSidebar className="hidden lg:flex" />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <AdminTopBar user={user} />

          {/* Content */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
