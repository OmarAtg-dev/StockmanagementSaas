
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
    queryKey: ["enterprise", user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Current user role:", profile?.role);
      
      // For super_admin, get all companies first
      if (profile?.role === 'super_admin') {
        console.log("Fetching as super admin");
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select("*");

        if (companiesError) {
          console.error("Error fetching companies:", companiesError);
          throw companiesError;
        }

        console.log("Found companies:", companies);

        if (!companies || companies.length === 0) {
          throw new Error("No companies found");
        }

        // Use the first company for now
        const company = companies[0];

        // Get user count for this company
        const { count: userCount, error: countError } = await supabase
          .from("company_user_roles")
          .select("*", { count: 'exact', head: true })
          .eq("company_id", company.id);

        if (countError) {
          console.error("Error fetching user count:", countError);
          throw countError;
        }

        return {
          id: company.id,
          name: company.name,
          subscription_status: company.subscription_status,
          user_count: userCount || 0,
          created_at: company.created_at,
        };
      } else {
        // Regular user flow - get their company from roles
        console.log("Fetching as regular user");
        const { data: roleData, error: roleError } = await supabase
          .from("company_user_roles")
          .select("company_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error fetching role:", roleError);
          throw roleError;
        }

        console.log("Role data:", roleData);

        if (!roleData?.company_id) {
          throw new Error("No company associated with user");
        }

        // Fetch the company details
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", roleData.company_id)
          .maybeSingle();

        if (companyError || !companyData) {
          console.error("Error fetching company:", companyError);
          throw companyError || new Error("Company not found");
        }

        console.log("Company data:", companyData);

        // Get user count
        const { count: userCount, error: countError } = await supabase
          .from("company_user_roles")
          .select("*", { count: 'exact', head: true })
          .eq("company_id", roleData.company_id);

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
        };
      }
    },
    enabled: !!user?.id,
  });

  if (error) {
    console.error("Query error:", error);
    toast({
      title: "Erreur",
      description: error.message,
      variant: "destructive",
    });
  }

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
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">
              Une erreur est survenue lors du chargement des données.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
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
