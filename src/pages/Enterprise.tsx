
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
import { 
  Building2, 
  Users, 
  CalendarDays, 
  BadgeCheck,
  AlertCircle 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Enterprise {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
}

// Mock data for enterprise
const mockEnterprise: Enterprise = {
  id: "1",
  name: "Acme Corporation",
  subscription_status: "active",
  created_at: "2024-01-01T00:00:00.000Z",
  user_count: 25
};

const Enterprise = () => {
  const { user } = useAuth();

  const { data: enterprise, isLoading } = useQuery({
    queryKey: ["enterprise", user?.id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockEnterprise;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!enterprise) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune information d'entreprise disponible
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nom de l'entreprise
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enterprise.name}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membres
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enterprise.user_count}</div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Statut
              </CardTitle>
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {enterprise.subscription_status === 'active' ? 'Actif' : 'Inactif'}
              </div>
              <p className="text-xs text-muted-foreground">
                Statut de l'abonnement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Date de création
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(enterprise.created_at).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Membre depuis
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Enterprise;
