
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
import { Input } from "@/components/ui/input";
import { Search, Plus, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { mockDataFunctions } from "@/utils/mockData";
import { ViewSupplierInvoiceDialog } from "@/components/suppliers/ViewSupplierInvoiceDialog";
import { SupplierInvoiceDialog } from "@/components/suppliers/SupplierInvoiceDialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SupplierInvoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  supplier: {
    id: string;
    name: string;
  } | null;
}

const SupplierInvoices = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDueDate, setSelectedDueDate] = useState<Date>();
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getSuppliers();
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['supplier-invoices'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getSupplierInvoices();
      if (error) throw error;
      return data;
    },
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSupplier = selectedSupplier === "all" || invoice.supplier?.name === selectedSupplier;

    const matchesDate = !selectedDate || 
      format(new Date(invoice.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    const matchesDueDate = !selectedDueDate || 
      format(new Date(invoice.due_date), 'yyyy-MM-dd') === format(selectedDueDate, 'yyyy-MM-dd');

    return matchesSearch && matchesSupplier && matchesDate && matchesDueDate;
  }) ?? [];

  const handleCreateInvoice = () => {
    const selectedSupplierData = suppliers?.find(s => s.name === selectedSupplier);
    
    if (selectedSupplier === "all" || !selectedSupplierData) {
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      paid: "default",
      overdue: "destructive",
      cancelled: "outline"
    };
    
    const labels: Record<string, string> = {
      draft: "Brouillon",
      paid: "Payée",
      overdue: "En retard",
      cancelled: "Annulée"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Devis fournisseurs</h1>
            <p className="text-muted-foreground">
              Gérez vos devis fournisseurs
            </p>
          </div>
          {/* <Button onClick={handleCreateInvoice} className="gap-2">
            <Plus className="h-5 w-5" />
            Créer un devis
          </Button> */}
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${
                      !selectedDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "P", { locale: fr })
                    ) : (
                      "Date du devis"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[240px] justify-start text-left font-normal ${
                      !selectedDueDate && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDueDate ? (
                      format(selectedDueDate, "P", { locale: fr })
                    ) : (
                      "Date d'échéance"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDueDate}
                    onSelect={setSelectedDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(selectedDate || selectedDueDate || selectedSupplier !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedDueDate(undefined);
                    setSelectedSupplier("all");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : !filteredInvoices?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun devis trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedInvoice(invoice)}
                  >
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>
                      {invoice.supplier?.name || 'Fournisseur inconnu'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), "PP", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), "PP", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'MAD'
                      }).format(invoice.total_amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {profile?.company_id && (
          <SupplierInvoiceDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            companyId={profile.company_id}
            supplierId={selectedSupplier !== "all" ? suppliers?.find(s => s.name === selectedSupplier)?.id : undefined}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
            }}
          />
        )}

        <ViewSupplierInvoiceDialog
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      </div>
    </DashboardLayout>
  );
};

export default SupplierInvoices;
