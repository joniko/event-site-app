import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "App de Conferencias",
  description: "Tu evento, en tu bolsillo",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* TODO: Add navigation tabs here */}
      <main className="min-h-screen">{children}</main>
    </>
  );
}
