import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const [editedInvoice, setEditedInvoice] = useState<typeof invoice>(invoice);
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
      setIsEditing(false);
    }
  }, [invoice]);

  const updateItem = (index: number, field: string, value: string | number) => {
    if (!editedInvoice) return;

    const newItems = [...editedInvoice.items];
    const item = { ...newItems[index] };

    if (field === 'quantity' || field === 'unit_price') {
      const numValue = Number(value);
      item[field] = numValue;
      item.amount = item.quantity * item.unit_price;
    } else if (field === 'product') {
      const selectedProduct = products?.find(p => p.id === value);
      if (selectedProduct) {
        item.description = selectedProduct.name;
        item.unit_price = selectedProduct.price;
        item.amount = item.quantity * item.unit_price;
      }
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

  const handleUpdateClient = (field: string, value: string) => {
    if (!editedInvoice) return;
    
    setEditedInvoice({
      ...editedInvoice,
      client: editedInvoice.client ? {
        ...editedInvoice.client,
        [field]: value
      } : null
    });
  };

  const handleUpdateDates = (type: 'date' | 'dueDate', newDate: Date | undefined) => {
    if (!editedInvoice || !newDate) return;
    
    const formattedDate = format(newDate, 'yyyy-MM-dd');
    
    if (type === 'date') {
      setDate(newDate);
      setEditedInvoice(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          date: formattedDate
        };
      });
    } else {
      setDueDate(newDate);
      setEditedInvoice(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          due_date: formattedDate
        };
      });
    }
  };

  const handleUpdateStatus = (status: string) => {
    if (!editedInvoice) return;
    
    setEditedInvoice({
      ...editedInvoice,
      status
    });
  };

  const handleUpdateInvoice = async () => {
    if (!editedInvoice || !date || !dueDate) return;

    try {
      const updatedInvoice = {
        ...editedInvoice,
        date: format(date, 'yyyy-MM-dd'),
        due_date: format(dueDate, 'yyyy-MM-dd'),
        total_amount: editedInvoice.items.reduce((sum, item) => sum + item.amount, 0),
      };

      await mockDataFunctions.updateInvoice(editedInvoice.id, updatedInvoice);
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      toast({
        title: "Facture mise à jour",
        description: "La facture a été mise à jour avec succès.",
      });

      setIsEditing(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la facture.",
      });
    }
  };

  const handleGeneratePDF = () => {
    if (!enterprise || !invoice) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let yOffset = 25;
      const leftMargin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - (2 * leftMargin);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, 277);
      doc.setFillColor(250, 250, 250);
      doc.rect(11, 11, pageWidth - 22, 275);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(44, 62, 80);
      doc.text(enterprise.name, leftMargin, yOffset);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      yOffset += 15;
      doc.text(enterprise.contact.headquarters, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Tél: ${enterprise.contact.phone}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Email: ${enterprise.contact.email}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Site web: ${enterprise.contact.website}`, leftMargin, yOffset);

      doc.setFillColor(247, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(140, 20, 55, 45, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("FACTURE", 167.5, 32, { align: "center" });
      doc.setFontSize(11);
      doc.text(`N° ${invoice.number}`, 167.5, 42, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Date d'émission:", 145, 52);
      doc.text(format(new Date(invoice.date), "PP", { locale: fr }), 167.5, 52, { align: "center" });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(leftMargin, yOffset, pageWidth - leftMargin, yOffset);

      doc.setFillColor(247, 250, 252);
      doc.roundedRect(leftMargin, yOffset, 85, 40, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      doc.text("FACTURER À", leftMargin + 5, yOffset + 8);
      
      if (invoice.client) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(invoice.client.name, leftMargin + 5, yOffset + 20);
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(invoice.client.email, leftMargin + 5, yOffset + 28);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      yOffset += 50;
      doc.text("Conditions de paiement: 30 jours", leftMargin, yOffset);
      doc.text(`Date d'échéance: ${format(new Date(invoice.due_date), "PP", { locale: fr })}`, leftMargin, yOffset + 5);

      const tableHeaders = ["Description", "Quantité", "Prix unitaire", "Montant"];
      const colWidths = [85, 25, 35, 35];
      
      doc.setFillColor(247, 250, 252);
      doc.roundedRect(leftMargin, yOffset, contentWidth, 10, 1, 1, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(44, 62, 80);
      
      let xPos = leftMargin;
      tableHeaders.forEach((header, index) => {
        const align = index === 0 ? "left" : "right";
        doc.text(header, index === 0 ? xPos + 3 : xPos + colWidths[index] - 3, yOffset + 7, { align });
        xPos += colWidths[index];
      });

      yOffset += 10;
      doc.setFont("helvetica", "normal");
      invoice.items?.forEach((item, index) => {
        const rowHeight = 8;
        if (index % 2 === 1) {
          doc.setFillColor(252, 252, 253);
          doc.rect(leftMargin, yOffset, contentWidth, rowHeight, 'F');
        }
        
        xPos = leftMargin;
        doc.text(item.description, xPos + 3, yOffset + 5);
        xPos += colWidths[0];
        doc.text(item.quantity.toString(), xPos + colWidths[1] - 3, yOffset + 5, { align: "right" });
        xPos += colWidths[1];
        doc.text(`${item.unit_price.toFixed(2)} MAD`, xPos + colWidths[2] - 3, yOffset + 5, { align: "right" });
        xPos += colWidths[2];
        doc.text(`${item.amount.toFixed(2)} MAD`, xPos + colWidths[3] - 3, yOffset + 5, { align: "right" });
        
        yOffset += rowHeight;
      });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, yOffset, pageWidth - leftMargin, yOffset);
      
      const subtotal = invoice.total_amount;
      const tva = subtotal * 0.20; // 20% TVA
      const total = subtotal + tva;

      yOffset += 5;
      const totalsX = pageWidth - leftMargin - 60;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Sous-total:", totalsX, yOffset);
      doc.text(`${subtotal.toFixed(2)} MAD`, pageWidth - leftMargin, yOffset, { align: "right" });
      
      yOffset += 5;
      doc.text("TVA (20%):", totalsX, yOffset);
      doc.text(`${tva.toFixed(2)} MAD`, pageWidth - leftMargin, yOffset, { align: "right" });
      
      yOffset += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Total:", totalsX, yOffset);
      doc.text(`${total.toFixed(2)} MAD`, pageWidth - leftMargin, yOffset, { align: "right" });

      yOffset += 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Instructions de paiement", leftMargin, yOffset);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      yOffset += 5;
      doc.text("Veuillez effectuer votre paiement sur le compte bancaire suivant:", leftMargin, yOffset);
      yOffset += 4;
      doc.text("IBAN: MA00 0000 0000 0000 0000 0000", leftMargin, yOffset);
      yOffset += 4;
      doc.text("BIC: XXXXXXXX", leftMargin, yOffset);
      yOffset += 4;
      doc.text("Banque: Nom de la banque", leftMargin, yOffset);

      yOffset += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Conditions", leftMargin, yOffset);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      yOffset += 4;
      doc.text("Le paiement est dû dans les 30 jours suivant la date de facturation.", leftMargin, yOffset);

      doc.setFillColor(247, 250, 252);
      doc.rect(10, 270, pageWidth - 20, 17, 'F');
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerY = 275;
      doc.text(enterprise.name, pageWidth / 2, footerY, { align: "center" });
      doc.text(enterprise.contact.headquarters, pageWidth / 2, footerY + 4, { align: "center" });
      doc.text(`${enterprise.contact.phone} | ${enterprise.contact.email}`, pageWidth / 2, footerY + 8, { align: "center" });

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

  const { data: enterprise } = useQuery({
    queryKey: ["enterprise"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockDataFunctions.getEnterpriseInfo();
    },
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await mockDataFunctions.getProducts();
      return data;
    },
  });

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
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Client</h3>
                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    <Input
                      placeholder="Nom du client"
                      value={displayInvoice.client?.name || ''}
                      onChange={(e) => handleUpdateClient('name', e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email du client"
                      value={displayInvoice.client?.email || ''}
                      onChange={(e) => handleUpdateClient('email', e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <p className="mt-1">{displayInvoice.client?.name}</p>
                    <p className="text-sm text-muted-foreground">{displayInvoice.client?.email}</p>
                  </>
                )}
              </div>
              <div className="text-right space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  {isEditing ? (
                    <Select
                      value={displayInvoice.status}
                      onValueChange={handleUpdateStatus}
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
                          onSelect={(newDate) => handleUpdateDates('date', newDate)}
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
                            "w-full justify-start text-left font-normal mt-1 cursor-pointer",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <div className="p-2">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(newDate) => {
                              console.log("Selected date:", newDate);
                              handleUpdateDates('dueDate', newDate || undefined);
                            }}
                            disabled={(date) => date < (new Date(displayInvoice.date))}
                            defaultMonth={dueDate}
                            className="border rounded-md"
                            classNames={{
                              cell: "text-center p-0",
                              day: "h-9 w-9 p-0 font-normal cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground aria-selected:opacity-100",
                              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                              day_today: "bg-accent text-accent-foreground",
                              day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                            }}
                          />
                        </div>
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
                    <TableHead>Produit</TableHead>
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
                          <Select
                            value={products?.find(p => p.name === item.description)?.id}
                            onValueChange={(value) => updateItem(index, 'product', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>
                                {item.description}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
