
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  if (!invoice) return null;

  const handleGeneratePDF = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      let yOffset = 20;

      // Add company logo or name
      doc.setFontSize(20);
      doc.text("FACTURE", 105, yOffset, { align: "center" });
      
      // Add invoice details
      doc.setFontSize(12);
      yOffset += 20;
      doc.text(`Facture N°: ${invoice.number}`, 20, yOffset);
      yOffset += 10;
      doc.text(`Date: ${format(new Date(invoice.date), "PP", { locale: fr })}`, 20, yOffset);
      yOffset += 10;
      doc.text(`Échéance: ${format(new Date(invoice.due_date), "PP", { locale: fr })}`, 20, yOffset);

      // Add client information
      yOffset += 20;
      doc.text("Client:", 20, yOffset);
      yOffset += 10;
      if (invoice.client) {
        doc.text(invoice.client.name, 20, yOffset);
        yOffset += 10;
        doc.text(invoice.client.email, 20, yOffset);
      }

      // Add items table
      yOffset += 20;
      const headers = ["Description", "Quantité", "Prix unitaire", "Montant"];
      const itemsData = invoice.items.map(item => [
        item.description,
        item.quantity.toString(),
        `${item.unit_price.toFixed(2)} MAD`,
        `${item.amount.toFixed(2)} MAD`
      ]);

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yOffset, 170, 10, "F");
      doc.setTextColor(0);
      headers.forEach((header, i) => {
        doc.text(header, i === 0 ? 25 : 55 + (i * 40), yOffset + 7);
      });

      // Table rows
      yOffset += 15;
      itemsData.forEach(row => {
        row.forEach((cell, i) => {
          doc.text(cell, i === 0 ? 25 : 55 + (i * 40), yOffset);
        });
        yOffset += 10;
      });

      // Add total
      yOffset += 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total: ${new Intl.NumberFormat('fr-FR', { 
          style: 'currency', 
          currency: 'MAD'
        }).format(invoice.total_amount)}`,
        190,
        yOffset,
        { align: "right" }
      );

      // Download the PDF
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facture {invoice.number}
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleGeneratePDF}
            >
              <Download className="h-4 w-4" />
              Générer PDF
            </Button>
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
                <p className="mt-1">{invoice.client?.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.client?.email}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-sm text-muted-foreground">Détails</h3>
                <p className="mt-1">
                  Date: {format(new Date(invoice.date), "PP", { locale: fr })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Échéance: {format(new Date(invoice.due_date), "PP", { locale: fr })}
                </p>
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
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'MAD'
                        }).format(item.unit_price)}
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
                  }).format(invoice.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
