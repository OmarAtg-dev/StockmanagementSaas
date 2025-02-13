
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
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface HistoryEntry {
  id: string;
  event_type: 'stock_in' | 'stock_out' | 'price_change' | 'new_product' | 'deleted_product';
  product_name: string;
  quantity: number | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  created_by_name: string;
}

const getEventTypeLabel = (type: HistoryEntry['event_type']) => {
  const labels: Record<HistoryEntry['event_type'], string> = {
    'stock_in': 'Entrée de stock',
    'stock_out': 'Sortie de stock',
    'price_change': 'Changement de prix',
    'new_product': 'Nouveau produit',
    'deleted_product': 'Produit supprimé'
  };
  return labels[type];
};

const getEventDescription = (entry: HistoryEntry) => {
  switch (entry.event_type) {
    case 'stock_in':
      return `Ajout de ${entry.quantity} unités`;
    case 'stock_out':
      return `Retrait de ${entry.quantity} unités`;
    case 'price_change':
      return `Prix modifié de ${entry.old_value}€ à ${entry.new_value}€`;
    case 'new_product':
      return 'Produit ajouté au catalogue';
    case 'deleted_product':
      return 'Produit retiré du catalogue';
    default:
      return '';
  }
};

// Mock history data
const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    event_type: 'stock_in',
    product_name: 'Product 1',
    quantity: 50,
    old_value: null,
    new_value: null,
    created_at: new Date().toISOString(),
    created_by_name: 'John Doe'
  },
  {
    id: "2",
    event_type: 'price_change',
    product_name: 'Product 2',
    quantity: null,
    old_value: '99.99',
    new_value: '149.99',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_by_name: 'Jane Smith'
  },
  {
    id: "3",
    event_type: 'new_product',
    product_name: 'Product 3',
    quantity: null,
    old_value: null,
    new_value: null,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    created_by_name: 'John Doe'
  }
];

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      if (!profile?.company_id) {
        return [];
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return mockHistory;
    },
    enabled: !!profile?.company_id
  });

  const filteredHistory = history?.filter((entry) =>
    entry.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique</h1>
          <p className="text-muted-foreground">
            Suivi des activités et des modifications
          </p>
        </div>

        <Card>
          <div className="p-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun événement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'Pp', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.event_type.includes('stock')
                            ? 'bg-blue-100 text-blue-800'
                            : entry.event_type === 'price_change'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.event_type === 'new_product'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {getEventTypeLabel(entry.event_type)}
                      </span>
                    </TableCell>
                    <TableCell>{entry.product_name || '-'}</TableCell>
                    <TableCell>{getEventDescription(entry)}</TableCell>
                    <TableCell>{entry.created_by_name}</TableCell>
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

export default History;
