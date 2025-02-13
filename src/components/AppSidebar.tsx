
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
  LogOut,
  UserCircle,
  Receipt,
  Truck,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const getMenuItems = (role: string | null) => {
  console.log("Current user role:", role);
  
  const baseItems = [
    { title: "Tableau de bord", icon: LayoutDashboard, path: "/" },
    { title: "Entreprises", icon: Building2, path: "/enterprise" },
    { title: "Clients", icon: UserCircle, path: "/clients" },
    { title: "Factures", icon: Receipt, path: "/invoices" },
    { title: "Fournisseurs", icon: Truck, path: "/suppliers" },
    { title: "Factures fournisseurs", icon: FileText, path: "/supplier-invoices" },
    { title: "Produits", icon: Package, path: "/products" },
    { title: "Inventaire", icon: Boxes, path: "/inventory" },
    { title: "Analytique", icon: BarChart, path: "/analytics" },
    { title: "Historique", icon: History, path: "/history" },
    { title: "Équipe", icon: Users, path: "/team" },
    { title: "Paramètres", icon: Settings, path: "/settings" },
  ];

  if (role === "super_admin") {
    return [
      { title: "Entreprises", icon: Building2, path: "/companies" },
      ...baseItems.filter(item => item.title !== "Entreprises")
    ];
  }

  return baseItems;
}

export function AppSidebar() {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("Full profile data:", profile);

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
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2">
            <div className="flex items-center gap-2 py-4">
              <span className="text-xl font-bold text-primary">StockSy</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                        "text-sm font-medium",
                        location.pathname === item.path && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors",
                    "text-sm font-medium text-destructive hover:bg-destructive/10"
                  )}
                >
                  <LogOut className="h-4 w-4" />
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
