
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyUser } from "@/types/company-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/company-users/UserForm";

const Team = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      if (!profile?.company_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('company_users_with_roles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('role', { ascending: false });

      if (error) {
        console.error("Error fetching team members:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger l'équipe",
        });
        throw error;
      }

      return data as CompanyUser[];
    },
    enabled: !!profile?.company_id
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
      role: string;
    }) => {
      const { data, error } = await supabase.rpc('create_company_user', {
        p_email: email,
        p_password: password,
        p_full_name: full_name,
        p_company_id: profile?.company_id,
        p_role: role,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
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
      full_name,
      role,
    }: {
      id: string;
      email: string;
      full_name: string;
      role: string;
    }) => {
      // Update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: email,
          full_name: full_name,
        })
        .eq('id', id);

      if (profileError) throw profileError;

      // Update the role
      const { error: roleError } = await supabase
        .from('company_user_roles')
        .update({ role })
        .eq('id', id);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
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
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('company_user_roles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été retiré de l'équipe avec succès",
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

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'admin': 'Administrateur',
      'manager': 'Manager',
      'staff': 'Staff'
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser.mutate(userId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Équipe</h1>
            <p className="text-muted-foreground">
              Gérez les membres de votre équipe et leurs rôles
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un membre</DialogTitle>
              </DialogHeader>
              <UserForm
                onSubmit={(data) => addUser.mutate(data as { email: string; password: string; full_name: string; role: string })}
                onClose={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : !teamMembers?.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Aucun membre dans l'équipe
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.full_name}</TableCell>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          member.role
                        )}`}
                      >
                        {getRoleLabel(member.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le membre</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <UserForm
                user={editingUser}
                onSubmit={(data) =>
                  updateUser.mutate({
                    id: editingUser.id,
                    ...data,
                  })
                }
                onClose={() => setEditingUser(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Team;
