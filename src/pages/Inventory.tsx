
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
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface InventoryItem {
  id: string;
  product: {
    name: string;
    category: string;
  };
  quantity: number;
  location: string;
  last_updated: string;
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (!profile?.company_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          location,
          last_updated,
          product:products (
            name,
            category
          )
        `)
        .eq('company_id', profile.company_id);

      if (error) {
        console.error("Error fetching inventory:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger l'inventaire",
        });
        throw error;
      }

      return data as InventoryItem[];
    },
    enabled: !!profile?.company_id
  });

  const filteredInventory = inventory?.filter((item) =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventaire</h1>
            <p className="text-muted-foreground">
              Gérez votre inventaire de produits
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <Plus className="h-5 w-5" />
            Ajouter un article
          </button>
        </div>

        <Card>
          <div className="p-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>{item.product.category}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                    <TableCell>
                      {new Date(item.last_updated).toLocaleDateString()}
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

export default Inventory;
