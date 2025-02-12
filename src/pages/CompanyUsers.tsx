
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, Plus, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";

type CompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  role: "admin" | "manager" | "staff";
  full_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
};

const UserForm = ({
  user,
  companyId,
  onSubmit,
  onClose,
}: {
  user?: CompanyUser;
  companyId: string;
  onSubmit: (data: {
    email: string;
    password?: string;
    full_name: string;
    role: "admin" | "manager" | "staff";
  }) => void;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState(user?.username || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [role, setRole] = useState<"admin" | "manager" | "staff">(
    user?.role || "staff"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, full_name: fullName, role });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email de l'utilisateur
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required={!user}
          disabled={!!user}
        />
      </div>
      {!user && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Nom complet
        </label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required={!user}
          disabled={!!user}
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Rôle
        </label>
        <Select value={role} onValueChange={(value: "admin" | "manager" | "staff") => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">{user ? "Modifier" : "Ajouter"}</Button>
      </div>
    </form>
  );
};

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
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
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
      role: "admin" | "manager" | "staff";
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
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      toast({
        title: "Utilisateur ajouté",
        description: "L'utilisateur a été ajouté avec succès",
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

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      role,
    }: {
      id: string;
      role: "admin" | "manager" | "staff";
    }) => {
      const { data, error } = await supabase
        .from("company_user_roles")
        .update({ role })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      toast({
        title: "Utilisateur mis à jour",
        description: "Le rôle de l'utilisateur a été mis à jour avec succès",
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

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("company_user_roles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été retiré de l'entreprise avec succès",
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
                companyId={companyId!}
                onSubmit={(data) => addUser.mutate(data as any)}
                onClose={() => setIsAddOpen(false)}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "manager"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Admin"
                          : user.role === "manager"
                          ? "Manager"
                          : "Staff"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) =>
                          setEditingUser(open ? user : null)
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
                            <DialogTitle>Modifier l'utilisateur</DialogTitle>
                          </DialogHeader>
                          <UserForm
                            user={user}
                            companyId={companyId!}
                            onSubmit={(data) =>
                              updateUser.mutate({ id: user.id, role: data.role })
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
                              "Êtes-vous sûr de vouloir retirer cet utilisateur ?"
                            )
                          ) {
                            deleteUser.mutate(user.id);
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

export default CompanyUsers;
