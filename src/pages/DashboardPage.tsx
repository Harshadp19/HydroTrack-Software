import { Sidebar } from "@/components/layout/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-hero">
      <Sidebar />
      <main className="flex-1 ml-16 lg:ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}