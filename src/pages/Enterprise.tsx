
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Enterprise {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  user_count?: number;
}

const Enterprise = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const { data: enterprise, isLoading, error } = useQuery({
    queryKey: ["enterprise", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");

      console.log("Fetching enterprise data for user:", user.id);
      console.log("User profile:", profile);
      console.log("User profile >> ", profile?.role);

      // If user is super_admin and no company_id is set, fetch the first company
      if (profile?.role === 'super_admin') {
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select(`
            *,
            company_user_roles (
              count
            )
          `)
          .limit(1)
          .single();

        if (companiesError) {
          console.error("Error fetching companies:", companiesError);
          throw companiesError;
        }
        console.log('companies >> ', companies);
        if (!companies) {
          throw new Error("Aucune entreprise trouvée");
        }

        return {
          id: companies.id,
          name: companies.name,
          subscription_status: companies.subscription_status,
          created_at: companies.created_at,
          user_count: companies.company_user_roles?.[0]?.count || 0
        };
      }

      // For regular users, fetch their associated company
      const companyId = profile?.company_id;
      if (!companyId) {
        throw new Error("Aucune entreprise associée à cet utilisateur");
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select(`
          *,
          company_user_roles (
            count
          )
        `)
        .eq("id", companyId)
        .single();

      if (companyError) {
        console.error("Error fetching company:", companyError);
        throw companyError;
      }

      if (!company) {
        throw new Error("Entreprise non trouvée");
      }

      return {
        id: company.id,
        name: company.name,
        subscription_status: company.subscription_status,
        created_at: company.created_at,
        user_count: company.company_user_roles?.[0]?.count || 0
      };
    },
    enabled: !!user?.id,
    meta: {
      onError: (error: Error) => {
        console.error("Query error:", error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mes Entreprise</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Une erreur est survenue"}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

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
