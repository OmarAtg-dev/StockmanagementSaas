
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
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
  const { profile } = useAuth();
  const { toast } = useToast();

  const { data: enterprise, isLoading, error } = useQuery({
    queryKey: ["enterprise", profile?.company_id],
    queryFn: async () => {
      console.log("Fetching enterprise data with profile:", profile);
      
      // First, get the company_id from company_user_roles if not in profile
      if (!profile?.company_id) {
        const { data: roleData, error: roleError } = await supabase
          .from("company_user_roles")
          .select("company_id")
          .eq("user_id", profile?.id)
          .single();

        if (roleError) {
          console.error("Error fetching company role:", roleError);
          throw roleError;
        }

        console.log("Found company_id from roles:", roleData?.company_id);
        
        if (!roleData?.company_id) {
          throw new Error("No company associated with user");
        }

        // Now fetch the company data
        const { data, error } = await supabase
          .from("companies_with_users")
          .select("*")
          .eq("id", roleData.company_id)
          .single();

        if (error) {
          console.error("Error fetching company:", error);
          throw error;
        }

        return data as Enterprise;
      }
      
      // If we have company_id in profile, use it directly
      const { data, error } = await supabase
        .from("companies_with_users")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (error) {
        console.error("Error fetching company:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de l'entreprise.",
        });
        throw error;
      }
      return data as Enterprise;
    },
    enabled: !!profile?.id,
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

  if (!profile?.id) {
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
