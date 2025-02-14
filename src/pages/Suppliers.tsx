import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Plus, Pencil, Trash2, Receipt, ChevronRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SupplierInvoiceDialog } from "@/components/suppliers/SupplierInvoiceDialog";
import { mockDataFunctions } from "@/utils/mockData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  status: string;
}

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>(["active", "inactive", "blocked"]);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['suppliers', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id && profile?.role !== 'super_admin') {
        throw new Error("Aucune entreprise associée à cet utilisateur");
      }

      const { data, error } = await mockDataFunctions.getSuppliers();

      if (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
      }

      return data as Supplier[];
    },
    enabled: !!(profile?.company_id || profile?.role === 'super_admin'),
  });

  const { data: supplierInvoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['supplierInvoices', expandedSupplier],
    queryFn: async () => {
      if (!expandedSupplier) return [];
      const { data, error } = await mockDataFunctions.getSupplierInvoices();
      if (error) throw error;
      return data;
    },
    enabled: !!expandedSupplier,
  });

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter.includes(supplier.status);

    return matchesSearch && matchesStatus;
  }) ?? [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      blocked: "destructive"
    };
    
    const labels: Record<string, string> = {
      active: "Actif",
      inactive: "Inactif",
      blocked: "Bloqué"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getInvoiceStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
    };
    
    const labels: Record<string, string> = {
      paid: "Payée",
      pending: "En attente",
      overdue: "En retard"
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
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
            <p className="text-muted-foreground">
              Gérez vos fournisseurs et leurs informations
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Ajouter un fournisseur
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Statut</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('active')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(
                        checked
                          ? [...statusFilter, 'active']
                          : statusFilter.filter((s) => s !== 'active')
                      );
                    }}
                  >
                    Actif
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('inactive')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(
                        checked
                          ? [...statusFilter, 'inactive']
                          : statusFilter.filter((s) => s !== 'inactive')
                      );
                    }}
                  >
                    Inactif
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('blocked')}
                    onCheckedChange={(checked) => {
                      setStatusFilter(
                        checked
                          ? [...statusFilter, 'blocked']
                          : statusFilter.filter((s) => s !== 'blocked')
                      );
                    }}
                  >
                    Bloqué
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
              ) : filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucun fournisseur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <>
                    <TableRow key={`row-${supplier.id}`}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)}
                        >
                          {expandedSupplier === supplier.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{supplier.contact_person}</div>
                          <div className="text-sm text-muted-foreground">
                            {supplier.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{supplier.phone || '-'}</TableCell>
                      <TableCell>{supplier.address || '-'}</TableCell>
                      <TableCell>
                        {getStatusBadge(supplier.status)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSupplierId(supplier.id);
                          }}
                          title="Créer une facture"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedSupplier === supplier.id && (
                      <TableRow key={`expanded-${supplier.id}`}>
                        <TableCell colSpan={7} className="bg-muted/50 p-4">
                          <div className="space-y-4">
                            <h3 className="font-semibold">Historique des factures</h3>
                            {isLoadingInvoices ? (
                              <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                              </div>
                            ) : !supplierInvoices?.length ? (
                              <p className="text-muted-foreground">
                                Aucune facture trouvée pour ce fournisseur.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {supplierInvoices.map((invoice) => (
                                  <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-4 bg-background rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                      navigate(`/supplier-invoices?search=${invoice.number}`);
                                    }}
                                  >
                                    <div className="space-y-1">
                                      <p className="font-medium">
                                        Facture N° {invoice.number}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {format(new Date(invoice.date), 'PP', { locale: fr })}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <p className="font-medium">
                                        {new Intl.NumberFormat('fr-FR', {
                                          style: 'currency',
                                          currency: 'MAD'
                                        }).format(invoice.total_amount)}
                                      </p>
                                      {getInvoiceStatusBadge(invoice.status)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {selectedSupplierId && profile?.company_id && (
          <SupplierInvoiceDialog
            open={!!selectedSupplierId}
            onOpenChange={(open) => !open && setSelectedSupplierId(null)}
            companyId={profile.company_id}
            invoice={{ supplier: { id: selectedSupplierId } }}
            onSuccess={() => {
              setSelectedSupplierId(null);
              toast({
                title: "Facture créée",
                description: "La facture a été créée avec succès.",
              });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
