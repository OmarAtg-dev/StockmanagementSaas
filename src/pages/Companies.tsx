
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Company = {
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
  company?: Company;
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

const Companies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompany, setEditingUser] = useState<Company | null>(null);
  const navigate = useNavigate();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      // Get all companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (companiesError) throw companiesError;

      // Get user counts using a separate count query
      const { data: userCounts, error: userCountsError } = await supabase
        .from("company_users_with_roles")
        .select("company_id, count", { count: "exact", head: false })
        .groupBy("company_id");

      if (userCountsError) throw userCountsError;

      // Create a map of company_id to user count
      const userCountMap = new Map(
        userCounts.map((item: any) => [item.company_id, parseInt(item.count)])
      );

      // Combine the data
      return companiesData.map(company => ({
        ...company,
        user_count: userCountMap.get(company.id) || 0
      })) as Company[];
    },
  });

  const createCompany = useMutation({
    mutationFn: async (newCompany: { name: string; subscription_status: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .insert([newCompany])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Entreprise créée",
        description: "L'entreprise a été créée avec succès",
      });
      setIsCreateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const updateCompany = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name: string;
      subscription_status: string;
    }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Entreprise mise à jour",
        description: "L'entreprise a été mise à jour avec succès",
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({
        title: "Entreprise supprimée",
        description: "L'entreprise a été supprimée avec succès",
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

  if (!profile || profile.role !== "super_admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          Vous n'avez pas accès à cette page.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Entreprises</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle entreprise
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
              </DialogHeader>
              <CompanyForm
                onSubmit={(data) => createCompany.mutate(data)}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies?.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          company.subscription_status === "active"
                            ? "bg-green-100 text-green-800"
                            : company.subscription_status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {company.subscription_status === "active"
                          ? "Actif"
                          : company.subscription_status === "inactive"
                          ? "Inactif"
                          : "En attente"}
                      </span>
                    </TableCell>
                    <TableCell>{company.user_count}</TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/companies/${company.id}/users`)}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Dialog
                        open={editingUser?.id === company.id}
                        onOpenChange={(open) =>
                          setEditingUser(open ? company : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier l'entreprise</DialogTitle>
                          </DialogHeader>
                          <CompanyForm
                            company={company}
                            onSubmit={(data) =>
                              updateCompany.mutate({ id: company.id, ...data })
                            }
                            onClose={() => setEditingUser(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Êtes-vous sûr de vouloir supprimer cette entreprise ?"
                            )
                          ) {
                            deleteCompany.mutate(company.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Companies;
