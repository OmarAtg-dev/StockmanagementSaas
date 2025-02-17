
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyUser, UserFormData } from "@/types/company-user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/company-users/UserForm";
import { mockDataFunctions, mockProfiles } from "@/utils/mockData";
import { UserRole } from "@/types/auth";

const Team = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);

  if (!profile?.company_id) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          Vous n'avez pas accès à cette page.
        </div>
      </DashboardLayout>
    );
  }

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      console.log("Fetching team members with company_id:", profile.company_id);
      const result = await mockDataFunctions.getSession();
      if (result.error) {
        throw result.error;
      }
      return mockProfiles as CompanyUser[];
    },
    enabled: !!profile.company_id
  });

  const addUser = useMutation({
    mutationFn: async (data: UserFormData) => {
      console.log("Form submitted with data:", data);
      const result = await mockDataFunctions.signUp({
        email: data.email,
        password: data.password || 'default123',
        username: data.email,
        fullName: data.full_name,
        companyName: 'Mock Company'
      });
      if (result.error) {
        throw result.error;
      }

      // After signup, add the user to mockProfiles with the correct role
      const newUser = {
        id: String(mockProfiles.length + 1),
        user_id: String(mockProfiles.length + 1),
        company_id: profile.company_id,
        username: data.email,
        full_name: data.full_name,
        role: data.role as UserRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockProfiles.push(newUser);

      return result.data;
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
      console.error("Error in addUser mutation:", error);
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
      console.log("Updating user with data:", { id, email, full_name, role });
      const userIndex = mockProfiles.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        mockProfiles[userIndex] = {
          ...mockProfiles[userIndex],
          username: email,
          full_name,
          role: role as UserRole,
          updated_at: new Date().toISOString()
        };
      }
      return { success: true };
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
      // Remove user from mockProfiles
      const index = mockProfiles.findIndex(user => user.id === userId);
      if (index !== -1) {
        mockProfiles.splice(index, 1);
      }
      return { success: true };
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
                onSubmit={(data) => {
                  console.log("Form submitted with data:", data);
                  addUser.mutate(data);
                }}
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
                    email: data.email,
                    full_name: data.full_name,
                    role: data.role,
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
