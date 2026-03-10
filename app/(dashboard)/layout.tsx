import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
