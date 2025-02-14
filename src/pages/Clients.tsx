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

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide").nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: 'paid' | 'pending' | 'overdue';
  client: {
    id: string;
    name: string;
    email: string;
  };
}

export const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: null,
      phone: null,
      address: null,
    },
  });

  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getClients();
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['client-invoices', expandedClient],
    queryFn: async () => {
      if (!expandedClient) return [];
      const { data, error } = await mockDataFunctions.getInvoices();
      if (error) throw error;
      return data.filter(invoice => invoice.client?.id === expandedClient) as Invoice[];
    },
    enabled: !!expandedClient,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!profile) throw new Error("Non authentifié");
      const clientData = {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        company_id: profile.company_id,
      };
      return mockDataFunctions.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientDialogOpen(false);
      form.reset();
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès.",
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

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!clientToEdit) throw new Error("Aucun client sélectionné");
      const updateData = {
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      };
      return mockDataFunctions.updateClient(clientToEdit.id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientDialogOpen(false);
      setClientToEdit(null);
      form.reset();
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès.",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return mockDataFunctions.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
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

  const handleCreateInvoice = (clientId: string) => {
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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (clientToEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Une erreur est survenue lors du chargement des clients.
          </AlertDescription>
        </Alert>
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
                <TableHead />
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
                    <TableRow key={client.id}>
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
                        {new Date(client.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCreateInvoice(client.id)}
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
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <div className="p-4">
                            <h3 className="font-semibold mb-4">Factures du client</h3>
                            {isLoadingInvoices ? (
                              <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                  <Skeleton key={i} className="h-8 w-full" />
                                ))}
                              </div>
                            ) : !invoices?.length ? (
                              <p className="text-muted-foreground">Aucune facture trouvée pour ce client.</p>
                            ) : (
                              <div className="space-y-2">
                                {invoices.map((invoice) => (
                                  <div
                                    key={invoice.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                  >
                                    <div className="space-y-1">
                                      <p className="font-medium">Facture N° {invoice.number}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {format(new Date(invoice.date), "PP", { locale: fr })}
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

        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{clientToEdit ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
              <DialogDescription>
                {clientToEdit ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre liste.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
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
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {clientToEdit ? 'Modifier' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le client sera définitivement supprimé
                de notre base de données.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (clientToEdit) {
                    deleteMutation.mutate(clientToEdit.id);
                  }
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <InvoiceDialog 
          open={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          clientId={selectedClientId}
          companyId={profile?.company_id || ''}
        />
      </div>
    </DashboardLayout>
  );
};

export default Clients;
