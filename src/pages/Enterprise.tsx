
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
import { Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Enterprise {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
}

// Mock data for enterprise info (replace with actual API call later)
const mockEnterpriseInfo: Enterprise = {
  id: "1",
  name: "Acme Corporation",
  subscription_status: "active",
  created_at: "2024-01-01T00:00:00.000Z",
  user_count: 25
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
        
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
                Créée le {new Date(enterprise?.created_at).toLocaleDateString()}
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
    </DashboardLayout>
  );
};

export default Enterprise;
