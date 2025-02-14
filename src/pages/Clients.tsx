import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, Receipt, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { mockDataFunctions } from "@/utils/mockData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface ClientInvoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

const clientFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: null,
      phone: null,
      address: null,
    },
  });

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients', profile?.company_id],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getClients();
      if (error) throw error;
      return data;
    },
  });

  const { data: clientInvoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', expandedClient],
    queryFn: async () => {
      if (!expandedClient) return [];
      const { data, error } = await mockDataFunctions.getInvoices();
      if (error) throw error;
      console.log('Fetched invoices:', data); // Debug log
      return data.filter((invoice: ClientInvoice) => 
        invoice.client?.id === expandedClient
      );
    },
    enabled: !!expandedClient,
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (!profile?.company_id) {
        throw new Error("No company ID found");
      }
      
      const { error } = await mockDataFunctions.createClient({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        company_id: profile.company_id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client créé avec succès" });
      setIsClientDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormData & { id: string }) => {
      const { error } = await mockDataFunctions.updateClient(data.id, {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client mis à jour avec succès" });
      setIsClientDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await mockDataFunctions.deleteClient(id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Client supprimé avec succès" });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const handleCreateInvoice = (clientId: string) => {
    if (!profile?.company_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être associé à une entreprise pour créer une facture.",
      });
      return;
    }
    setSelectedClientId(clientId);
    setIsInvoiceDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setIsClientDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToEdit(client);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: ClientFormData) => {
    if (clientToEdit) {
      await updateClientMutation.mutateAsync({ ...data, id: clientToEdit.id });
    } else {
      await createClientMutation.mutateAsync(data);
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Gérez vos clients et leurs informations
            </p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => {
              setClientToEdit(null);
              form.reset();
              setIsClientDialogOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
            Ajouter un client
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Date de création</TableHead>
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
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <>
                    <TableRow key={`row-${client.id}`}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                        >
                          {expandedClient === client.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>{client.address || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(client.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setIsInvoiceDialogOpen(true);
                          }}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClient(client)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClient(client)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedClient === client.id && (
                      <TableRow key={`expanded-${client.id}`}>
                        <TableCell colSpan={7} className="bg-muted/50 p-4">
                          <div className="space-y-4">
                            <h3 className="font-semibold">Historique des factures</h3>
                            {isLoadingInvoices ? (
                              <div className="space-y-2">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                              </div>
                            ) : !clientInvoices?.length ? (
                              <p className="text-muted-foreground">
                                Aucune facture trouvée pour ce client.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {clientInvoices.map((invoice: ClientInvoice) => (
                                  <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-4 bg-background rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                      navigate(`/invoices?search=${invoice.number}`);
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
                                      <Badge variant={
                                        invoice.status === 'paid' ? 'default' :
                                        invoice.status === 'pending' ? 'secondary' :
                                        'destructive'
                                      }>
                                        {invoice.status === 'paid' ? 'Payée' :
                                         invoice.status === 'pending' ? 'En attente' :
                                         'En retard'}
                                      </Badge>
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
      </div>

      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{clientToEdit ? "Modifier le client" : "Ajouter un client"}</DialogTitle>
            <DialogDescription>
              {clientToEdit 
                ? "Modifiez les informations du client ci-dessous." 
                : "Remplissez les informations du nouveau client ci-dessous."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du client" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Email du client"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Téléphone du client"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Adresse du client"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {clientToEdit ? "Mettre à jour" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le client et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToEdit) {
                  deleteClientMutation.mutate(clientToEdit.id);
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedClientId && profile?.company_id && (
        <InvoiceDialog
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          clientId={selectedClientId}
          companyId={profile.company_id}
        />
      )}
    </DashboardLayout>
  );
};

export default Clients;
