import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-foreground">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </div>
  );
}
