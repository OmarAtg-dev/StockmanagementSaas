
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <SidebarTrigger />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
