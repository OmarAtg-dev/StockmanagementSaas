
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Package, 
  History, 
  BarChart,
  Settings,
  Users,
  Boxes
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Products", icon: Package, path: "/products" },
  { title: "Inventory", icon: Boxes, path: "/inventory" },
  { title: "Analytics", icon: BarChart, path: "/analytics" },
  { title: "History", icon: History, path: "/history" },
  { title: "Team", icon: Users, path: "/team" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-lg font-semibold text-primary">StockSy</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.path} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
