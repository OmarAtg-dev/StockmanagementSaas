import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { mockDataFunctions } from "@/utils/mockData";

interface SupplierInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId?: string;
  companyId: string;
  onSuccess?: () => void;
  invoice?: SupplierInvoice | null;
}

interface SupplierInvoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  notes?: string;
  supplier: {
    id: string;
    name: string;
  } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

interface InvoiceItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export function SupplierInvoiceDialog({ 
  open, 
  onOpenChange, 
  supplierId, 
  companyId, 
  onSuccess,
  invoice 
}: SupplierInvoiceDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(invoice ? new Date(invoice.date) : new Date());
  const [dueDate, setDueDate] = useState<Date>(invoice ? new Date(invoice.due_date) : new Date());
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items 
      ? invoice.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }))
      : [{ description: "", quantity: 1, unit_price: 0, amount: 0 }]
  );
  const [notes, setNotes] = useState(invoice?.notes || "");

  // Fetch supplier information
  const { data: supplier } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      if (!supplierId) return null;
      const { data, error } = await mockDataFunctions.getSuppliers();
      if (error) throw error;
      // Find the specific supplier from the list
      return data?.find(s => s.id === supplierId) || null;
    },
    enabled: !!supplierId,
  });

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };

    if (field === "quantity" || field === "unit_price") {
      item[field] = Number(value);
      item.amount = item.quantity * item.unit_price;
    } else {
      item[field as "description"] = value as string;
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'ID du fournisseur est manquant.",
      });
      return;
    }

    if (!supplier) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les informations du fournisseur sont manquantes.",
      });
      return;
    }

    try {
      if (invoice) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from("supplier_invoices")
          .update({
            date: format(date, 'yyyy-MM-dd'),
            due_date: format(dueDate, 'yyyy-MM-dd'),
            total_amount: calculateTotal(),
            notes,
          })
          .eq('id', invoice.id)
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Handle items update
        const { error: itemsError } = await supabase
          .from("supplier_invoice_items")
          .insert(
            items.map(item => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
              product_id: item.product_id
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Facture mise à jour",
          description: "La facture fournisseur a été mise à jour avec succès.",
        });
      } else {
        // Create new invoice
        const number = `SUPINV-${Date.now()}`;

        const { data: newInvoice, error: invoiceError } = await supabase
          .from("supplier_invoices")
          .insert([{
            supplier_id: supplierId,
            company_id: companyId,
            number,
            date: format(date, 'yyyy-MM-dd'),
            due_date: format(dueDate, 'yyyy-MM-dd'),
            total_amount: calculateTotal(),
            notes,
            supplier: {
              id: supplier.id,
              name: supplier.name
            }
          }])
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        const { error: itemsError } = await supabase
          .from("supplier_invoice_items")
          .insert(
            items.map(item => ({
              invoice_id: newInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount,
              product_id: item.product_id
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Facture créée",
          description: "La facture fournisseur a été créée avec succès.",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="supplier-invoice-description">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {invoice ? "Modifier la facture fournisseur" : "Nouvelle facture fournisseur"}
            </DialogTitle>
            <DialogDescription id="supplier-invoice-description">
              {invoice 
                ? "Modifiez les détails de la facture fournisseur."
                : "Créez une nouvelle facture pour ce fournisseur."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date de facturation</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Date d'échéance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Quantité"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <div className="w-[200px]">
                  <Label>Total</Label>
                  <Input
                    value={calculateTotal().toFixed(2) + " MAD"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Notes ou conditions particulières..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {invoice ? "Mettre à jour" : "Créer la facture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
