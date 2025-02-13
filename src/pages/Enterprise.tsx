import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, MapPin, Phone, Mail, Globe, Building, Warehouse, Package, AlertTriangle, Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Enterprise {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
  contact: {
    headquarters: string;
    branches: string[];
    phone: string;
    email: string;
    website: string;
    social: {
      linkedin: string;
      twitter: string;
    };
  };
  inventory: {
    primary_warehouse: {
      name: string;
      address: string;
    };
    additional_warehouses: Array<{
      name: string;
      address: string;
    }>;
    valuation_method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
    stock_thresholds: {
      alert_level: number;
      reorder_level: number;
    };
    active_suppliers: number;
  };
}

// Mock data for enterprise info (replace with actual API call later)
const mockEnterpriseInfo: Enterprise = {
  id: "1",
  name: "Acme Corporation",
  subscription_status: "active",
  created_at: "2024-01-01T00:00:00.000Z",
  user_count: 25,
  contact: {
    headquarters: "123 Boulevard Mohammed V, Casablanca, Maroc",
    branches: [
      "45 Avenue Hassan II, Rabat, Maroc",
      "78 Rue Atlas, Marrakech, Maroc"
    ],
    phone: "+212 522-123456",
    email: "contact@acme-corp.ma",
    website: "www.acme-corp.ma",
    social: {
      linkedin: "linkedin.com/company/acme-corp-ma",
      twitter: "twitter.com/acme_corp_ma"
    }
  },
  inventory: {
    primary_warehouse: {
      name: "Entrepôt Principal Casablanca",
      address: "Zone Industrielle Sidi Maârouf, Casablanca"
    },
    additional_warehouses: [
      {
        name: "Entrepôt Tanger Med",
        address: "Zone Franche Tanger Med"
      }
    ],
    valuation_method: "FIFO",
    stock_thresholds: {
      alert_level: 100,
      reorder_level: 50
    },
    active_suppliers: 12
  }
};

const Enterprise = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: enterprise, isLoading } = useQuery({
    queryKey: ["enterprise", user?.id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockEnterpriseInfo;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les informations de votre entreprise
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Informations Générales</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nom de l'entreprise
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enterprise?.name}</div>
                <p className="text-xs text-muted-foreground">
                  Créée le {new Date(enterprise?.created_at || "").toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Statut de l'abonnement
                </CardTitle>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    enterprise?.subscription_status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {enterprise?.subscription_status === "active" ? "Actif" : "Inactif"}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enterprise?.subscription_status === "active" 
                    ? "Abonnement actif"
                    : "Abonnement inactif"}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate('/team')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nombre d'utilisateurs
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enterprise?.user_count}</div>
                <p className="text-xs text-muted-foreground">
                  Utilisateurs actifs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Contact & Coordonnées</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Siège Social
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">{enterprise?.contact.headquarters}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Agences
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enterprise?.contact.branches.map((branch, index) => (
                    <div key={index} className="text-sm">{branch}</div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contact
                </CardTitle>
                <div className="flex space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Téléphone:</span> {enterprise?.contact.phone}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Email:</span> {enterprise?.contact.email}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Présence en ligne
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Site web:</span>{" "}
                    <a href={`https://${enterprise?.contact.website}`} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {enterprise?.contact.website}
                    </a>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">LinkedIn:</span>{" "}
                    <a href={`https://${enterprise?.contact.social.linkedin}`} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:underline">
                      {enterprise?.contact.social.linkedin}
                    </a>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Twitter:</span>{" "}
                    <a href={`https://${enterprise?.contact.social.twitter}`} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:underline">
                      {enterprise?.contact.social.twitter}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Stock & Configuration d'Inventaire</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Entrepôt Principal
                </CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{enterprise?.inventory?.primary_warehouse.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {enterprise?.inventory?.primary_warehouse.address}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Entrepôts Additionnels
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enterprise?.inventory?.additional_warehouses.map((warehouse, index) => (
                    <div key={index} className="border-b last:border-0 pb-2 last:pb-0">
                      <div className="font-medium">{warehouse.name}</div>
                      <div className="text-sm text-muted-foreground">{warehouse.address}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate('/team')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Équipe
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{enterprise?.user_count}</div>
                  <div className="text-sm text-muted-foreground">
                    Membres dans l'équipe
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Seuils de Stock
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Niveau d'alerte</div>
                    <div className="text-lg text-yellow-600">
                      {enterprise?.inventory?.stock_thresholds.alert_level} unités
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Niveau de réapprovisionnement</div>
                    <div className="text-lg text-red-600">
                      {enterprise?.inventory?.stock_thresholds.reorder_level} unités
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => navigate('/suppliers')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gestion des Fournisseurs
                </CardTitle>
                <Users2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enterprise?.inventory?.active_suppliers}</div>
                <p className="text-sm text-muted-foreground">
                  Fournisseurs actifs
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Enterprise;
