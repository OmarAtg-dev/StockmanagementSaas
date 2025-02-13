
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
  created_at: string;
};

const Enterprise = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const { data: enterprise, isLoading } = useQuery({
    queryKey: ["enterprise", user?.id, profile?.role],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Current user role:", profile?.role);
      console.log("Current user id:", user.id);
      
      // For super_admin, get all companies first
      if (profile?.role === 'super_admin') {
        const { data: companies, error: companiesError } = await supabase
          .from("companies")
          .select("*");

        if (companiesError) {
          console.error("Companies error:", companiesError);
          throw companiesError;
        }

        console.log("Found companies for super_admin:", companies);

        if (!companies || companies.length === 0) {
          throw new Error("No companies found");
        }

        // Use the first company for now
        const company = companies[0];

        return {
          id: company.id,
          name: company.name,
          subscription_status: company.subscription_status,
          created_at: company.created_at,
        };
      } else {
        // Regular user flow - get their company from profile
        if (!profile?.company_id) {
          throw new Error("No company associated with user");
        }

        // Fetch the company details
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .maybeSingle();

        if (companyError) {
          console.error("Company error:", companyError);
          throw companyError;
        }

        console.log("Company data:", companyData);

        if (!companyData) {
          throw new Error("Company not found");
        }

        return {
          id: companyData.id,
          name: companyData.name,
          subscription_status: companyData.subscription_status,
          created_at: companyData.created_at,
        };
      }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>

        {enterprise ? (
          <div className="grid gap-4 md:grid-cols-2">
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
