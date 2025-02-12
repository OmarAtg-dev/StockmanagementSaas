
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Calendar, Plus, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

type Enterprise = {
  id: string;
  name: string;
  subscription_status: string;
  user_count: number;
  created_at: string;
};

const CompanyForm = ({
  company,
  onSubmit,
  onClose,
}: {
  company?: Enterprise;
  onSubmit: (data: { name: string; subscription_status: string }) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(company?.name || "");
  const [status, setStatus] = useState(company?.subscription_status || "active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, subscription_status: status });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nom de l'entreprise
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium">
          Statut de l'abonnement
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="pending">En attente</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">{company ? "Modifier" : "Créer"}</Button>
      </div>
    </form>
  );
};

const Enterprise = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Redirect super_admin to companies page
  if (profile?.role === "super_admin") {
    return <Navigate to="/companies" replace />;
  }

  const { data: enterprise, isLoading } = useQuery({
    queryKey: ["enterprise", profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id) return null;
      
      const { data, error } = await supabase
        .from("companies_with_users")
        .select("*")
        .eq("id", profile.company_id)
        .single();

      if (error) throw error;
      return data as Enterprise;
    },
    enabled: !!profile?.company_id,
  });

  // Create company mutation
  const createCompany = useMutation({
    mutationFn: async (newCompany: { name: string; subscription_status: string }) => {
      const { data: company, error: createError } = await supabase
        .from("companies")
        .insert([newCompany])
        .select()
        .single();

      if (createError) throw createError;

      // Update user profile with new company_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ company_id: company.id })
        .eq("id", profile?.id);

      if (updateError) throw updateError;

      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise"] });
      toast({
        title: "Entreprise créée",
        description: "L'entreprise a été créée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async (updates: { name: string; subscription_status: string }) => {
      const { error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", profile?.company_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise"] });
      toast({
        title: "Entreprise mise à jour",
        description: "L'entreprise a été mise à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  if (!profile) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (!enterprise && profile.role !== "company_admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          Vous n'êtes pas associé à une entreprise.
        </div>
      </DashboardLayout>
    );
  }

  if (!enterprise && profile.role === "company_admin") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer mon entreprise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer mon entreprise</DialogTitle>
                </DialogHeader>
                <CompanyForm
                  onSubmit={(data) => createCompany.mutate(data)}
                  onClose={() => setIsCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-center py-8">
            Créez votre entreprise pour commencer.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Mon Entreprise</h1>
          {profile.role === "company_admin" && (
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier mon entreprise</DialogTitle>
                </DialogHeader>
                <CompanyForm
                  company={enterprise}
                  onSubmit={(data) => updateCompany.mutate(data)}
                  onClose={() => setIsEditOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

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
      </div>
    </DashboardLayout>
  );
};

export default Enterprise;
