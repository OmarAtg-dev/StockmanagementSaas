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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isWithinInterval, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { mockDataFunctions } from "@/utils/mockData";
import { ViewInvoiceDialog } from "@/components/invoices/ViewInvoiceDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchParams } from "react-router-dom";

interface Invoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  client: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];
}

const Invoices = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedDueDate, setSelectedDueDate] = useState<Date>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getClients();
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices', profile?.company_id],
    queryFn: async () => {
      if (!profile?.company_id && profile?.role !== 'super_admin') {
        throw new Error("Aucune entreprise associée à cet utilisateur");
      }

      const { data, error } = await mockDataFunctions.getInvoices();

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }

      return data as Invoice[];
    },
    enabled: !!(profile?.company_id || profile?.role === 'super_admin'),
  });

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClient = selectedClient === "all" || invoice.client?.name === selectedClient;

    const matchesDate = !selectedDate || 
      format(new Date(invoice.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    const matchesDueDate = !selectedDueDate || 
      format(new Date(invoice.due_date), 'yyyy-MM-dd') === format(selectedDueDate, 'yyyy-MM-dd');

    return matchesSearch && matchesClient && matchesDate && matchesDueDate;
  }) ?? [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      paid: "default",
      overdue: "destructive",
      pending: "outline"
    };
    
    const labels: Record<string, string> = {
      draft: "Brouillon",
      paid: "Payée",
      overdue: "En retard",
      pending: "En attente"
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
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Gérez vos factures et leur statut
          </p>
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

              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrer par client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
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

              {(selectedDate || selectedDueDate || selectedClient !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedDueDate(undefined);
                    setSelectedClient("all");
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
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucune facture trouvée
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
                      <div>
                        <div>{invoice.client?.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.client?.email}
                        </div>
                      </div>
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

        <ViewInvoiceDialog 
          open={!!selectedInvoice}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
