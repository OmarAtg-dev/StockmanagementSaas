
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
import { Building2, Users, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Enterprise = {
  id: string;
  name: string;
  subscription_status: string;
  user_count: number;
  created_at: string;
};

const Enterprise = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const { data: enterprise, isLoading, error } = useQuery({
    queryKey: ["enterprise", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      let companyId: string | null = null;

      // If user is not a super_admin, get their company_id from roles
      if (profile?.role !== 'super_admin') {
        const { data: roleData, error: roleError } = await supabase
          .from("company_user_roles")
          .select("company_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching role:", roleError);
          throw roleError;
        }

        if (!roleData?.company_id) {
          throw new Error("No company associated with user");
        }

        companyId = roleData.company_id;
      } else {
        // For super_admin, get the first company (or you could add company selection logic)
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select("id")
          .limit(1)
          .single();

        if (companiesError) {
          console.error("Error fetching companies:", companiesError);
          throw companiesError;
        }

        companyId = companies.id;
      }

      // Fetch the company details
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();

      if (companyError || !companyData) {
        console.error("Error fetching company:", companyError);
        throw companyError || new Error("Company not found");
      }

      // Get user count
      const { count: userCount, error: countError } = await supabase
        .from("company_user_roles")
        .select("*", { count: 'exact', head: true })
        .eq("company_id", companyId);

      if (countError) {
        console.error("Error fetching user count:", countError);
        throw countError;
      }

      return {
        id: companyData.id,
        name: companyData.name,
        subscription_status: companyData.subscription_status,
        user_count: userCount || 0,
        created_at: companyData.created_at,
      } as Enterprise;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user?.id) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Mon Entreprise</h1>
          <p className="text-muted-foreground">
            Vous n'êtes pas connecté.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Mon Entreprise</h1>
          <p className="text-red-500">
            Une erreur est survenue lors du chargement des données.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error.message}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>

        {enterprise ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nom de l'entreprise
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enterprise.name}</div>
                <p className="text-xs text-muted-foreground">
                  Statut: {enterprise.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nombre d'utilisateurs
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
                  Date de création
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Impossible de charger les informations de l'entreprise.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Enterprise;
