
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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { mockDataFunctions } from "@/utils/mockData";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  companyId: string;
  onSuccess?: () => void;
}

interface InvoiceItem {
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: string;
}

export function InvoiceDialog({ open, onOpenChange, clientId, companyId, onSuccess }: InvoiceDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState("");

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getProducts();
      if (error) throw error;
      return data as Product[];
    }
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

  const handleProductSelect = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        description: product.name,
        unit_price: product.price,
        amount: product.price * newItems[index].quantity
      };
      setItems(newItems);
    }
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

    try {
      // Generate invoice number (you might want to implement a more sophisticated system)
      const number = `INV-${Date.now()}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          client_id: clientId,
          company_id: companyId,
          number,
          date: format(date, 'yyyy-MM-dd'),
          due_date: format(dueDate, 'yyyy-MM-dd'),
          total_amount: calculateTotal(),
          notes,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const { error: itemsError } = await supabase
        .from("invoice_items")
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
        title: "Facture créée",
        description: "La facture a été créée avec succès.",
      });

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
      <DialogContent className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>
              Créez une nouvelle facture pour votre client.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
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
                <div className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  <Label>Articles</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-6">
                      <Label className="text-sm mb-2">Produit</Label>
                      <Select
                        value={item.product_id}
                        onValueChange={(value) => handleProductSelect(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.price} MAD
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm mb-2">Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quantité"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label className="text-sm mb-2">Prix unitaire</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Prix unitaire"
                        value={item.unit_price}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="col-span-1 pt-7">
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
              </div>

              <div className="flex justify-end border-t pt-4">
                <div className="w-[200px]">
                  <Label>Total</Label>
                  <Input
                    value={`${calculateTotal().toFixed(2)} MAD`}
                    readOnly
                    className="bg-muted font-bold"
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
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer la facture</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
