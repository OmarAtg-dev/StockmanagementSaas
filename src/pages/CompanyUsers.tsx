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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { CompanyUser, UserFormData } from "@/types/company-user";
import { UserRole } from "@/types/auth";
import { UserForm } from "@/components/company-users/UserForm";
import { UsersTable } from "@/components/company-users/UsersTable";

const CompanyUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { companyId } = useParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["company-users", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_users_with_roles")
        .select("*")
        .eq("company_id", companyId);

      if (error) throw error;
      return data as CompanyUser[];
    },
    enabled: !!companyId,
  });

  const addUser = useMutation({
    mutationFn: async (formData: UserFormData) => {
      if (!formData.password) {
        throw new Error("Password is required when creating a new user");
      }

      const { data, error } = await supabase.functions.invoke('create-company-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          company_id: companyId,
          role: formData.role as UserRole,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Utilisateur ajouté",
        description: "L'utilisateur a été ajouté avec succès",
      });
      setIsAddOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...formData }: UserFormData & { id: string }) => {
      // First update the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: formData.email,
          full_name: formData.full_name,
          role: formData.role as UserRole,
        })
        .eq("id", id);

      if (profileError) throw profileError;

      // Update password if provided
      if (formData.password) {
        const { error: passwordError } = await supabase.functions.invoke('update-user-password', {
          body: { userId: id, password: formData.password }
        });
        if (passwordError) throw passwordError;
      }

      // Get updated user data
      const { data: updatedUser, error: fetchError } = await supabase
        .from("company_users_with_roles")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      return updatedUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Utilisateur mis à jour",
        description: "Les informations de l'utilisateur ont été mises à jour avec succès",
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

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users", companyId] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été retiré de l'entreprise avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'utilisateur",
      });
    },
  });

  if (!profile?.company_id && profile?.role !== "super_admin") {
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
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un utilisateur</DialogTitle>
              </DialogHeader>
              <UserForm
                onSubmit={(data) => addUser.mutate(data)}
                onClose={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <>
            <Dialog
              open={!!editingUser}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingUser(null);
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier l'utilisateur</DialogTitle>
                </DialogHeader>
                {editingUser && (
                  <UserForm
                    user={editingUser}
                    onSubmit={(data) =>
                      updateUser.mutate({ id: editingUser.id, ...data })
                    }
                    onClose={() => setEditingUser(null)}
                  />
                )}
              </DialogContent>
            </Dialog>
            <UsersTable
              users={users || []}
              onEdit={(user) => {
                console.log("Editing user:", user);
                setEditingUser(user);
              }}
              onDelete={(id) => deleteUser.mutate(id)}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyUsers;
