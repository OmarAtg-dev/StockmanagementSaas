
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

const getSidebarSections = () => [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", icon: LayoutDashboard, path: "/" },
      { title: "Entreprises", icon: Building2, path: "/enterprise" },
    ]
  },
  {
    label: "Commercial",
    items: [
      { title: "Clients", icon: UserCircle, path: "/clients" },
      { title: "Factures", icon: Receipt, path: "/invoices" },
      { title: "Fournisseurs", icon: Truck, path: "/suppliers" },
      { title: "Factures fournisseurs", icon: FileText, path: "/supplier-invoices" },
    ]
  },
  {
    label: "Stock",
    items: [
      { title: "Produits", icon: Package, path: "/products" },
      { title: "Inventaire", icon: Boxes, path: "/inventory" },
    ]
  },
  {
    label: "Données",
    items: [
      { title: "Analytique", icon: BarChart, path: "/analytics" },
      { title: "Historique", icon: History, path: "/history" },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Équipe", icon: Users, path: "/team" },
      { title: "Paramètres", icon: Settings, path: "/settings" },
    ]
  }
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const sidebarSections = getSidebarSections();

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
          <SidebarGroupLabel className="px-4">
            <div className="flex items-center gap-2 py-6 border-b">
              <span className="text-2xl font-bold text-primary">StockSy</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="py-4">
            {sidebarSections.map((section, index) => (
              <div key={section.label} className={cn("space-y-1", index > 0 && "mt-6")}>
                <div className="px-4 py-2">
                  <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    {section.label}
                  </h2>
                </div>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.path} 
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                            "text-sm font-medium",
                            "hover:bg-accent hover:text-accent-foreground",
                            location.pathname === item.path && "bg-accent text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))}
            
            <div className="mt-6">
              <div className="px-4 py-2">
                <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Compte
                </h2>
              </div>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleSignOut}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 w-full rounded-md transition-colors",
                      "text-sm font-medium text-destructive hover:bg-destructive/10"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
