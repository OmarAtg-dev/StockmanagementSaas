
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

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

interface ExpectedInventoryItem {
  id: string;
  product: {
    name: string;
    category: string;
  };
  quantity: number;
  expected_date: string;
  status: string;
  notes: string | null;
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: inventory, isLoading: isLoadingInventory } = useQuery({
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

  const { data: expectedInventory, isLoading: isLoadingExpected } = useQuery({
    queryKey: ['expected-inventory'],
    queryFn: async () => {
      if (!profile?.company_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('expected_inventory')
        .select(`
          id,
          quantity,
          expected_date,
          status,
          notes,
          product:products (
            name,
            category
          )
        `)
        .eq('company_id', profile.company_id)
        .order('expected_date', { ascending: true });

      if (error) {
        console.error("Error fetching expected inventory:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger l'inventaire attendu",
        });
        throw error;
      }

      return data as ExpectedInventoryItem[];
    },
    enabled: !!profile?.company_id
  });

  const filteredInventory = inventory?.filter((item) =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const filteredExpectedInventory = expectedInventory?.filter((item) =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmé</Badge>;
      case 'delayed':
        return <Badge variant="destructive">Retardé</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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

        <div className="space-y-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Stock actuel</TabsTrigger>
              <TabsTrigger value="expected">Stock attendu</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <Card>
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
                    {isLoadingInventory ? (
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
            </TabsContent>

            <TabsContent value="expected">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Quantité attendue</TableHead>
                      <TableHead>Date prévue</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingExpected ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Chargement...
                        </TableCell>
                      </TableRow>
                    ) : filteredExpectedInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Aucun stock attendu trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpectedInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {format(new Date(item.expected_date), "dd/MM/yyyy", { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell>{item.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
