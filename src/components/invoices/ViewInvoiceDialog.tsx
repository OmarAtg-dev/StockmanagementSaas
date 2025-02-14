
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Edit2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import { mockDataFunctions } from "@/utils/mockData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    date: string;
    due_date: string;
    total_amount: number;
    status: string;
    client: {
      name: string;
      email: string;
    } | null;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }[];
  } | null;
}

export function ViewInvoiceDialog({ open, onOpenChange, invoice }: ViewInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [date, setDate] = useState<Date | undefined>(
    invoice ? new Date(invoice.date) : undefined
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    invoice ? new Date(invoice.due_date) : undefined
  );

  React.useEffect(() => {
    if (invoice) {
      setEditedInvoice(invoice);
      setDate(new Date(invoice.date));
      setDueDate(new Date(invoice.due_date));
    }
  }, [invoice]);

  const { data: enterprise } = useQuery({
    queryKey: ["enterprise"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockDataFunctions.getEnterpriseInfo();
    },
  });

  const handleUpdateInvoice = async () => {
    if (!editedInvoice || !date || !dueDate) return;

    try {
      const updatedInvoice = {
        ...editedInvoice,
        date: format(date, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        total_amount: editedInvoice.items.reduce((sum, item) => sum + item.amount, 0),
      };

      await mockDataFunctions.updateInvoice(updatedInvoice);
      
      toast({
        title: "Facture mise à jour",
        description: "La facture a été mise à jour avec succès.",
      });

      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la facture.",
      });
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    if (!editedInvoice) return;

    const newItems = [...editedInvoice.items];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unit_price') {
      const numValue = Number(value);
      item[field] = numValue;
      item.amount = item.quantity * item.unit_price;
    } else {
      item[field as 'description'] = value as string;
    }

    newItems[index] = item;
    setEditedInvoice({
      ...editedInvoice,
      items: newItems,
      total_amount: newItems.reduce((sum, item) => sum + item.amount, 0),
    });
  };

  const handleGeneratePDF = () => {
    if (!enterprise || !invoice) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      let yOffset = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(enterprise.name, 20, yOffset);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      yOffset += 8;
      doc.text(enterprise.contact.headquarters, 20, yOffset);
      yOffset += 5;
      doc.text(`Tél: ${enterprise.contact.phone}`, 20, yOffset);
      yOffset += 5;
      doc.text(`Email: ${enterprise.contact.email}`, 20, yOffset);
      yOffset += 5;
      doc.text(`Site web: ${enterprise.contact.website}`, 20, yOffset);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, yOffset, 190, yOffset);

      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(247, 247, 247);
      doc.roundedRect(140, yOffset - 35, 50, 15, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(`N° ${invoice.number}`, 165, yOffset - 25, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80);
      doc.text("FACTURE", 105, yOffset, { align: "center" });
      
      doc.setTextColor(0);
      doc.setFontSize(11);
      yOffset += 15;
      doc.text(`Date: ${format(new Date(invoice.date), "PP", { locale: fr })}`, 20, yOffset);
      yOffset += 8;
      doc.text(`Échéance: ${format(new Date(invoice.due_date), "PP", { locale: fr })}`, 20, yOffset);

      doc.setFontSize(12);
      doc.text("FACTURER À", 20, yOffset);
      yOffset += 8;
      if (invoice.client) {
        doc.setFont("helvetica", "bold");
        doc.text(invoice.client.name, 20, yOffset);
        yOffset += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(invoice.client.email, 20, yOffset);
      }

      const tableTop = yOffset;
      const tableLeft = 20;
      const colWidth = [75, 30, 30, 35];
      const rowHeight = 10;
      
      doc.setFillColor(244, 244, 244);
      doc.rect(tableLeft, tableTop, 170, rowHeight, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      let xOffset = tableLeft;
      ["Description", "Quantité", "Prix unitaire", "Montant"].forEach((header, i) => {
        doc.text(header, xOffset + 3, tableTop + 7);
        xOffset += colWidth[i];
      });

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.setFontSize(9);
      
      let currentY = tableTop + rowHeight;
      invoice.items.forEach((item, index) => {
        if (index % 2 === 1) {
          doc.setFillColor(249, 249, 249);
          doc.rect(tableLeft, currentY, 170, rowHeight, "F");
        }
        
        xOffset = tableLeft;
        doc.text(item.description, xOffset + 3, currentY + 7);
        xOffset += colWidth[0];
        doc.text(item.quantity.toString(), xOffset + 3, currentY + 7);
        xOffset += colWidth[1];
        doc.text(`${item.unit_price.toFixed(2)} MAD`, xOffset + 3, currentY + 7);
        xOffset += colWidth[2];
        doc.text(`${item.amount.toFixed(2)} MAD`, xOffset + 3, currentY + 7);
        
        currentY += rowHeight;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const totalText = `Total: ${new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'MAD'
      }).format(invoice.total_amount)}`;
      doc.text(totalText, 190, currentY, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(enterprise.name, 105, 280, { align: "center" });
      doc.text(enterprise.contact.headquarters, 105, 280 + 4, { align: "center" });
      doc.text(`${enterprise.contact.phone} | ${enterprise.contact.email}`, 105, 280 + 8, { align: "center" });

      doc.save(`facture-${invoice.number}.pdf`);

      toast({
        title: "PDF généré",
        description: "Le PDF a été téléchargé avec succès.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du PDF.",
      });
    }
  };

  if (!invoice) return null;

  const displayInvoice = isEditing ? editedInvoice : invoice;
  if (!displayInvoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facture {displayInvoice.number}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <Button 
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={handleUpdateInvoice}
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleGeneratePDF}
                  >
                    <Download className="h-4 w-4" />
                    Générer PDF
                  </Button>
                  <Button 
                    variant="default"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setEditedInvoice(invoice);
                      setDate(new Date(invoice.date));
                      setDueDate(new Date(invoice.due_date));
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Détails de la facture
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Client</h3>
                <p className="mt-1">{displayInvoice.client?.name}</p>
                <p className="text-sm text-muted-foreground">{displayInvoice.client?.email}</p>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedInvoice?.status}
                      onValueChange={(value) => {
                        if (editedInvoice) {
                          setEditedInvoice({
                            ...editedInvoice,
                            status: value
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Sélectionner un status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payée</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1">
                      {displayInvoice.status === 'paid' ? 'Payée' :
                       displayInvoice.status === 'pending' ? 'En attente' :
                       'En retard'}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date de facturation</Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="mt-1">
                      {format(new Date(displayInvoice.date), "PP", { locale: fr })}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date d'échéance</Label>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="mt-1">
                      {format(new Date(displayInvoice.due_date), "PP", { locale: fr })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Articles</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayInvoice.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        ) : (
                          item.description
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-20 ml-auto"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                            className="w-32 ml-auto"
                          />
                        ) : (
                          new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'MAD'
                          }).format(item.unit_price)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MAD'
                        }).format(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="text-right">
                <h3 className="font-semibold mb-2">Montant total</h3>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'MAD'
                  }).format(displayInvoice.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
        {isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateInvoice}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
