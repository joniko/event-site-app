import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - App de Conferencias",
  description: "Panel de administración",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* TODO: Add admin sidebar/navigation */}
      <main className="p-8">{children}</main>
    </div>
  );
}
