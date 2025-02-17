
import React, { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
import { useNavigate, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const getSidebarSections = () => [
  {
    label: "Commercial",
    items: [
      { title: "Clients", icon: UserCircle, path: "/clients" },
      {
        title: "Facture",
        icon: Receipt,
        subItems: [
          { title: "Factures", path: "/invoices" },
          { title: "Factures fournisseurs", path: "/supplier-invoices" }
        ]
      },
      { title: "Fournisseurs", icon: Truck, path: "/suppliers" },
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
  const location = useLocation();
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const sidebarSections = getSidebarSections();

  useEffect(() => {
    const currentSection = sidebarSections.find(section =>
      section.items.some(item =>
        'subItems' in item &&
        item.subItems.some(subItem => subItem.path === location.pathname)
      )
    );

    if (currentSection) {
      const item = currentSection.items.find(item =>
        'subItems' in item &&
        item.subItems.some(subItem => subItem.path === location.pathname)
      );
      
      if (item && !openItems.includes(item.title)) {
        setOpenItems(prev => [...prev, item.title]);
      }
    }
  }, [location.pathname]);

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

  const toggleItem = (title: string) => {
    setOpenItems(current => 
      current.includes(title) 
        ? current.filter(item => item !== title)
        : [...current, title]
    );
  };

  return (
    <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">
            <div className="flex items-center gap-2 py-4 border-b border-border/40">
              <img 
                src="/lovable-uploads/4da8a0ef-8e85-426d-bee1-03483f555554.png" 
                alt="Global Watech Logo" 
                className="h-8 w-auto"
              />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/" 
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                      "text-sm font-medium",
                      "hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1",
                      location.pathname === "/" && "text-primary font-medium translate-x-1"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/enterprise" 
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                      "text-sm font-medium",
                      "hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1",
                      location.pathname === "/enterprise" && "text-primary font-medium translate-x-1"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Entreprises</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {sidebarSections.map((section, index) => (
              <div key={section.label} className="mt-8">
                <div className="px-4 py-2">
                  <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    {section.label}
                  </h2>
                </div>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {'subItems' in item ? (
                        <>
                          <SidebarMenuButton
                            onClick={() => toggleItem(item.title)}
                            data-state={openItems.includes(item.title) ? 'open' : 'closed'}
                            className={cn(
                              "flex items-center justify-between w-full",
                              "px-4 py-2.5 rounded-md",
                              "transition-all duration-200",
                              "text-sm font-medium",
                              "hover:bg-accent/70 hover:text-accent-foreground",
                              "group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              openItems.includes(item.title) && "bg-accent/10",
                              (location.pathname === "/invoices" || location.pathname === "/supplier-invoices") && 
                              "text-primary"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={cn(
                                "transform transition-transform duration-200",
                                openItems.includes(item.title) ? "rotate-180" : ""
                              )}
                            >
                              <path
                                d="M2 4L6 8L10 4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </SidebarMenuButton>
                          {openItems.includes(item.title) && (
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link 
                                      to={subItem.path}
                                      className={cn(
                                        "flex items-center gap-3",
                                        "w-full px-4 py-2.5 pl-8",
                                        "rounded-md text-sm",
                                        "transition-all duration-200",
                                        "hover:bg-accent/40 hover:text-accent-foreground",
                                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                        "whitespace-nowrap",
                                        location.pathname === subItem.path && [
                                          "bg-accent/10",
                                          "text-primary",
                                          "font-medium"
                                        ]
                                      )}
                                    >
                                      <span className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        "transition-all duration-200",
                                        location.pathname === subItem.path 
                                          ? "bg-primary scale-110"
                                          : "bg-muted-foreground/40"
                                      )}/>
                                      {subItem.title}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.path} 
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                              "text-sm font-medium",
                              "hover:bg-accent/70 hover:text-accent-foreground hover:translate-x-1",
                              location.pathname === item.path && "text-primary font-medium translate-x-1"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))}
            
            <div className="mt-8">
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
                      "flex items-center gap-3 px-4 py-2.5 w-full rounded-md transition-all duration-200",
                      "text-sm font-medium text-destructive",
                      "hover:bg-destructive/10 hover:translate-x-1"
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
