
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
import { mockDataFunctions } from "@/utils/mockData";
import { useQuery } from "@tanstack/react-query";

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

  const { data: enterprise } = useQuery({
    queryKey: ["enterprise"],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockDataFunctions.getEnterpriseInfo();
    },
  });

  const handleGeneratePDF = () => {
    if (!enterprise) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les informations de l'entreprise.",
      });
      return;
    }

    try {
      // Create a new PDF document with slightly larger margins
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      let yOffset = 20;

      // Add company information with better styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(enterprise.name, 20, yOffset);
      
      // Add company contact details with improved spacing
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

      // Add a subtle separator line
      yOffset += 8;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, yOffset, 190, yOffset);

      // Add invoice number in a box at the top right
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(247, 247, 247);
      doc.roundedRect(140, yOffset - 35, 50, 15, 2, 2, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text(`N° ${invoice.number}`, 165, yOffset - 25, { align: "center" });

      // Add invoice title with better positioning
      yOffset += 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80); // Dark blue-grey color
      doc.text("FACTURE", 105, yOffset, { align: "center" });
      
      // Add invoice details with improved layout
      doc.setTextColor(0);
      doc.setFontSize(11);
      yOffset += 15;
      doc.text(`Date: ${format(new Date(invoice.date), "PP", { locale: fr })}`, 20, yOffset);
      yOffset += 8;
      doc.text(`Échéance: ${format(new Date(invoice.due_date), "PP", { locale: fr })}`, 20, yOffset);

      // Add client information with better styling
      yOffset += 15;
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

      // Add items table with improved styling
      yOffset += 15;
      
      // Table styling
      const tableTop = yOffset;
      const tableLeft = 20;
      const colWidth = [75, 30, 30, 35];
      const rowHeight = 10;
      
      // Table header with better visual design
      doc.setFillColor(244, 244, 244);
      doc.rect(tableLeft, tableTop, 170, rowHeight, "F");
      
      // Header text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      let xOffset = tableLeft;
      ["Description", "Quantité", "Prix unitaire", "Montant"].forEach((header, i) => {
        doc.text(header, xOffset + 3, tableTop + 7);
        xOffset += colWidth[i];
      });

      // Table rows with alternating background
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.setFontSize(9);
      
      let currentY = tableTop + rowHeight;
      invoice.items.forEach((item, index) => {
        // Alternate row background
        if (index % 2 === 1) {
          doc.setFillColor(249, 249, 249);
          doc.rect(tableLeft, currentY, 170, rowHeight, "F");
        }
        
        // Item data
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

      // Add total with improved styling
      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const totalText = `Total: ${new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'MAD'
      }).format(invoice.total_amount)}`;
      doc.text(totalText, 190, currentY, { align: "right" });

      // Add footer with refined styling
      const footerY = 280;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(enterprise.name, 105, footerY, { align: "center" });
      doc.text(enterprise.contact.headquarters, 105, footerY + 4, { align: "center" });
      doc.text(`${enterprise.contact.phone} | ${enterprise.contact.email}`, 105, footerY + 8, { align: "center" });

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
