
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { mockDataFunctions } from "@/utils/mockData";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";

interface ViewSupplierInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: SupplierInvoice | null;
}

interface SupplierInvoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  total_amount: number;
  status: string;
  supplier: {
    name: string;
    email?: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export function ViewSupplierInvoiceDialog({ open, onOpenChange, invoice }: ViewSupplierInvoiceDialogProps) {
  const { toast } = useToast();
  const [displayInvoice, setDisplayInvoice] = useState<SupplierInvoice | null>(null);

  const { data: enterprise } = useQuery({
    queryKey: ['enterprise'],
    queryFn: async () => {
      const { data, error } = await mockDataFunctions.getEnterpriseInfo(); // Fix: Changed getEnterprise to getEnterpriseInfo
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (invoice) {
      setDisplayInvoice(invoice);
    }
  }, [invoice]);

  const handleGeneratePDF = () => {
    if (!enterprise || !invoice) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      // Set initial position
      let yOffset = 20;
      const leftMargin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - (2 * leftMargin);

      // Company header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text(enterprise.name, leftMargin, yOffset);

      // Company info with gray color
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      yOffset += 10;
      doc.text(enterprise.contact.headquarters, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Tél: ${enterprise.contact.phone}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Email: ${enterprise.contact.email}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Site web: ${enterprise.contact.website}`, leftMargin, yOffset);

      // Invoice number in a box
      doc.setFillColor(247, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(140, 20, 50, 25, 3, 3, 'FD');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      doc.text("FACTURE FOURNISSEUR", 165, 30, { align: "center" });
      doc.setFontSize(11);
      doc.text(`N° ${invoice.number}`, 165, 38, { align: "center" });

      // Add decorative line
      yOffset += 10;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, yOffset, pageWidth - leftMargin, yOffset);

      // Supplier information
      yOffset += 15;
      doc.setFillColor(247, 250, 252);
      doc.roundedRect(leftMargin, yOffset - 5, 80, 30, 2, 2, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      doc.text("FOURNISSEUR", leftMargin + 5, yOffset + 5);
      if (invoice.supplier) {
        doc.setFont("helvetica", "normal");
        doc.text(invoice.supplier.name, leftMargin + 5, yOffset + 15);
        if (invoice.supplier.email) {
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          doc.text(invoice.supplier.email, leftMargin + 5, yOffset + 22);
        }
      }

      // Dates
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      yOffset += 40;
      doc.text(`Date de facturation: ${format(new Date(invoice.date), "PP", { locale: fr })}`, leftMargin, yOffset);
      yOffset += 6;
      doc.text(`Date d'échéance: ${format(new Date(invoice.due_date), "PP", { locale: fr })}`, leftMargin, yOffset);

      // Items table
      yOffset += 15;
      const tableHeaders = ["Description", "Quantité", "Prix unitaire", "Montant"];
      const columnWidths = [85, 25, 35, 35];
      
      // Table header
      doc.setFillColor(247, 250, 252);
      doc.rect(leftMargin, yOffset, contentWidth, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      let xPos = leftMargin;
      tableHeaders.forEach((header, index) => {
        doc.text(header, xPos + 3, yOffset + 6);
        xPos += columnWidths[index];
      });

      // Table rows
      yOffset += 10;
      doc.setFont("helvetica", "normal");
      invoice.items.forEach((item, index) => {
        const rowHeight = 8;
        if (index % 2 === 1) {
          doc.setFillColor(252, 252, 253);
          doc.rect(leftMargin, yOffset, contentWidth, rowHeight, 'F');
        }
        
        xPos = leftMargin;
        doc.text(item.description, xPos + 3, yOffset + 5);
        xPos += columnWidths[0];
        doc.text(item.quantity.toString(), xPos + 3, yOffset + 5);
        xPos += columnWidths[1];
        doc.text(`${item.unit_price.toFixed(2)} MAD`, xPos + 3, yOffset + 5);
        xPos += columnWidths[2];
        doc.text(`${item.amount.toFixed(2)} MAD`, xPos + 3, yOffset + 5);
        
        yOffset += rowHeight;
      });

      // Total
      yOffset += 5;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, yOffset, pageWidth - leftMargin, yOffset);
      yOffset += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const totalText = `Total: ${new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'MAD'
      }).format(invoice.total_amount)}`;
      doc.text(totalText, pageWidth - leftMargin, yOffset, { align: "right" });

      // Footer
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const footerY = 280;
      doc.text(enterprise.name, pageWidth / 2, footerY, { align: "center" });
      doc.text(enterprise.contact.headquarters, pageWidth / 2, footerY + 4, { align: "center" });
      doc.text(`${enterprise.contact.phone} | ${enterprise.contact.email}`, pageWidth / 2, footerY + 8, { align: "center" });

      doc.save(`facture-fournisseur-${invoice.number}.pdf`);

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      paid: "default",
      overdue: "destructive",
      cancelled: "outline"
    };
    
    const labels: Record<string, string> = {
      draft: "Brouillon",
      paid: "Payée",
      overdue: "En retard",
      cancelled: "Annulée"
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!displayInvoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Facture fournisseur - {displayInvoice.number}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Fournisseur</Label>
                <p className="mt-1">
                  {displayInvoice.supplier.name}
                  {displayInvoice.supplier.email && (
                    <span className="block text-sm text-muted-foreground">
                      {displayInvoice.supplier.email}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <p className="mt-1 flex justify-end">
                    {getStatusBadge(displayInvoice.status)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date de facturation</Label>
                  <p className="mt-1">
                    {format(new Date(displayInvoice.date), "PP", { locale: fr })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date d'échéance</Label>
                  <p className="mt-1">
                    {format(new Date(displayInvoice.due_date), "PP", { locale: fr })}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Quantité</th>
                    <th className="py-2 text-right">Prix unitaire</th>
                    <th className="py-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {displayInvoice.items.map((item, index) => (
                    <tr key={item.id} className={cn("border-b", index % 2 === 0 ? "bg-muted/50" : "")}>
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        {new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'MAD'
                        }).format(item.unit_price)}
                      </td>
                      <td className="py-2 text-right">
                        {new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'MAD'
                        }).format(item.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td colSpan={3} className="py-4 text-right">Total</td>
                    <td className="py-4 text-right">
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'MAD'
                      }).format(displayInvoice.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleGeneratePDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Générer le PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
