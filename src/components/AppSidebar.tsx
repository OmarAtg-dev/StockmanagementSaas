
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
  Boxes,
  Building2,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const getMenuItems = (role: string | null) => {
  const items = [
    { title: "Tableau de bord", icon: LayoutDashboard, path: "/" },
    { title: "Produits", icon: Package, path: "/products" },
    { title: "Inventaire", icon: Boxes, path: "/inventory" },
    { title: "Analytique", icon: BarChart, path: "/analytics" },
    { title: "Historique", icon: History, path: "/history" },
    { title: "Équipe", icon: Users, path: "/team" },
    { title: "Paramètres", icon: Settings, path: "/settings" },
  ];

  if (role === "super_admin") {
    items.unshift({ title: "Entreprises", icon: Building2, path: "/companies" });
  }

  return items;
};

export function AppSidebar() {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const menuItems = getMenuItems(profile?.role);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: error.message,
      });
    }
  };

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
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 w-full text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
