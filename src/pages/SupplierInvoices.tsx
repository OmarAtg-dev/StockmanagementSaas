
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, CalendarIcon, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { mockDataFunctions } from "@/utils/mockData";
import { ViewSupplierInvoiceDialog } from "@/components/suppliers/ViewSupplierInvoiceDialog";
import { SupplierInvoiceDialog } from "@/components/suppliers/SupplierInvoiceDialog";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SupplierInvoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  supplier: {
    name: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

const SupplierInvoices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDueDate, setSelectedDueDate] = useState<Date>();
  const { profile } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<SupplierInvoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<SupplierInvoice | null>(null);

  const handleCreateInvoice = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditInvoice = (invoice: SupplierInvoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setInvoiceToEdit(invoice);
    setIsEditDialogOpen(true);
  };

  const handleViewInvoice = (invoice: SupplierInvoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDeleteInvoice = (invoice: SupplierInvoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click event
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
    // Reset all relevant state
    setSelectedInvoice(null);
    setInvoiceToEdit(null);
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      const { error } = await mockDataFunctions.deleteSupplierInvoice(invoiceToDelete.id);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] });
      toast({
        title: "Facture supprimée",
        description: "La facture a été supprimée avec succès.",
      });
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la facture.",
      });
    }
  };

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getSuppliers();
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['supplier-invoices', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id && profile?.role !== 'super_admin') {
        throw new Error("Aucune entreprise associée à cet utilisateur");
      }

      const { data, error } = await mockDataFunctions.getSupplierInvoices();

      if (error) {
        console.error("Error fetching supplier invoices:", error);
        throw error;
      }

      return data as SupplierInvoice[];
    },
    enabled: !!(profile?.company_id || profile?.role === 'super_admin'),
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSupplier = selectedSupplier === "all" || invoice.supplier?.name === selectedSupplier;

    const matchesDate = !selectedDate || 
      format(new Date(invoice.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    const matchesDueDate = !selectedDueDate || 
      format(new Date(invoice.due_date), 'yyyy-MM-dd') === format(selectedDueDate, 'yyyy-MM-dd');

    return matchesSearch && matchesSupplier && matchesDate && matchesDueDate;
  }) ?? [];

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

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Factures fournisseurs</h1>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "Une erreur est survenue"}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Factures fournisseurs</h1>
            <p className="text-muted-foreground">
              Consultez et gérez vos factures fournisseurs
            </p>
          </div>
          <Button className="gap-2" onClick={handleCreateInvoice}>
            <Plus className="h-5 w-5" />
            Créer une facture
          </Button>
        </div>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une facture..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchParams(e.target.value ? { search: e.target.value } : {});
                  }}
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
                      "Date de facturation"
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
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : !filteredInvoices?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucune facture trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow 
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <TableCell className="font-medium">
                      {invoice.number}
                    </TableCell>
                    <TableCell>
                      {invoice.supplier.name}
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleViewInvoice(invoice)}>
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleEditInvoice(invoice, e)}>
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteInvoice(invoice, e)}
                            className="text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <ViewSupplierInvoiceDialog 
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />

        {profile?.company_id && (
          <>
            <SupplierInvoiceDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              companyId={profile.company_id}
              onSuccess={handleUpdateSuccess}
            />

            {invoiceToEdit && (
              <SupplierInvoiceDialog
                open={isEditDialogOpen}
                onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setInvoiceToEdit(null);
                }}
                companyId={profile.company_id}
                invoice={invoiceToEdit}
                onSuccess={handleUpdateSuccess}
              />
            )}
          </>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Elle supprimera définitivement la facture
                {invoiceToDelete && ` n°${invoiceToDelete.number}`} et toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default SupplierInvoices;
