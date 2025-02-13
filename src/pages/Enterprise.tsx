
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Users, 
  Plus,
  Pencil,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Enterprise {
  id: string;
  name: string;
  subscription_status: string;
  created_at: string;
  user_count: number;
}

// Mock data for enterprises
const mockEnterprises: Enterprise[] = [
  {
    id: "1",
    name: "Acme Corporation",
    subscription_status: "active",
    created_at: "2024-01-01T00:00:00.000Z",
    user_count: 25
  },
  {
    id: "2",
    name: "Tech Solutions Inc",
    subscription_status: "active",
    created_at: "2024-02-01T00:00:00.000Z",
    user_count: 15
  },
  {
    id: "3",
    name: "Global Industries",
    subscription_status: "inactive",
    created_at: "2024-03-01T00:00:00.000Z",
    user_count: 10
  }
];

const EnterpriseForm = ({
  enterprise,
  onSubmit,
  onClose,
}: {
  enterprise?: Enterprise;
  onSubmit: (data: { name: string; subscription_status: string }) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(enterprise?.name || "");
  const [status, setStatus] = useState(enterprise?.subscription_status || "active");

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
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">{enterprise ? "Modifier" : "Créer"}</Button>
      </div>
    </form>
  );
};

const Enterprise = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);

  const { data: enterprises, isLoading } = useQuery({
    queryKey: ["enterprises", user?.id],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockEnterprises;
    },
    enabled: !!user?.id,
  });

  const handleCreate = (data: { name: string; subscription_status: string }) => {
    // Simulate API call
    toast({
      title: "Entreprise créée",
      description: `L'entreprise ${data.name} a été créée avec succès`,
    });
    setIsCreateOpen(false);
  };

  const handleUpdate = (id: string, data: { name: string; subscription_status: string }) => {
    // Simulate API call
    toast({
      title: "Entreprise mise à jour",
      description: `L'entreprise ${data.name} a été mise à jour avec succès`,
    });
    setEditingEnterprise(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'entreprise ${name} ?`)) {
      // Simulate API call
      toast({
        title: "Entreprise supprimée",
        description: `L'entreprise ${name} a été supprimée avec succès`,
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Mes Entreprises</h1>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Mes Entreprises</h1>
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
              <EnterpriseForm
                onSubmit={handleCreate}
                onClose={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

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
              {enterprises?.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">{enterprise.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        enterprise.subscription_status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {enterprise.subscription_status === "active" ? "Actif" : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell>{enterprise.user_count}</TableCell>
                  <TableCell>{new Date(enterprise.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog
                      open={editingEnterprise?.id === enterprise.id}
                      onOpenChange={(open) =>
                        setEditingEnterprise(open ? enterprise : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier l'entreprise</DialogTitle>
                        </DialogHeader>
                        <EnterpriseForm
                          enterprise={enterprise}
                          onSubmit={(data) => handleUpdate(enterprise.id, data)}
                          onClose={() => setEditingEnterprise(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDelete(enterprise.id, enterprise.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Enterprise;
