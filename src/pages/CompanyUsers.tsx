
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
import { CompanyUser } from "@/types/company-user";
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
      console.log("Fetching users for company:", companyId);
      const { data, error } = await supabase
        .from("company_users_with_roles")
        .select("*")
        .eq("company_id", companyId);

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      console.log("Fetched users:", data);
      return data as CompanyUser[];
    },
    enabled: !!companyId,
  });

  const addUser = useMutation({
    mutationFn: async ({
      email,
      password,
      full_name,
      role,
    }: {
      email: string;
      password: string;
      full_name: string;
      role: UserRole;
    }) => {
      const { data, error } = await supabase.rpc('create_company_user', {
        p_email: email,
        p_password: password,
        p_full_name: full_name,
        p_company_id: companyId,
        p_role: role,
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
    mutationFn: async ({
      id,
      email,
      password,
      full_name,
      role,
    }: {
      id: string;
      email: string;
      password?: string;
      full_name: string;
      role: UserRole;
    }) => {
      console.log("Starting user update for ID:", id);

      // First, get the user data to ensure we have the correct user_id
      const { data: userData, error: userError } = await supabase
        .from("company_users_with_roles")
        .select("user_id")
        .eq("id", id)
        .single();

      if (userError || !userData?.user_id) {
        console.error("Error fetching user data:", userError);
        throw new Error("Failed to get user data");
      }

      console.log("Updating profile for user_id:", userData.user_id);

      // Update the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          username: email,
          full_name: full_name,
          role: role,
        })
        .eq("id", userData.user_id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      // Update the role
      const { error: roleError } = await supabase
        .from("company_user_roles")
        .update({ role })
        .eq("id", id);

      if (roleError) {
        console.error("Role update error:", roleError);
        throw roleError;
      }

      // Update password if provided
      if (password) {
        const { error: authError } = await supabase.functions.invoke('update-user-password', {
          body: { userId: userData.user_id, password }
        });
        if (authError) {
          console.error("Password update error:", authError);
          throw authError;
        }
      }

      // Fetch and return the updated user
      const { data: updatedUser, error: fetchError } = await supabase
        .from("company_users_with_roles")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

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
      console.error("Update error:", error);
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
        .from('company_user_roles')
        .delete()
        .eq('id', id);
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
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'utilisateur",
      });
    },
  });

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
