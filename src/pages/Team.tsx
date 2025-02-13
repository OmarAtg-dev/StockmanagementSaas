
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface TeamMember {
  id: string;
  username: string;
  full_name: string;
  role: string;
  created_at: string;
}

const Team = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const navigate = useNavigate();

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

      return data as TeamMember[];
    },
    enabled: !!profile?.company_id
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
          <Button onClick={() => navigate(`/companies/${profile?.company_id}/users`)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter un membre
          </Button>
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
                        onClick={() => navigate(`/companies/${profile?.company_id}/users`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => navigate(`/companies/${profile?.company_id}/users`)}
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
      </div>
    </DashboardLayout>
  );
};

export default Team;
