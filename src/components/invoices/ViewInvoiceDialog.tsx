
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

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
  } | null;
}

export function ViewInvoiceDialog({ open, onOpenChange, invoice }: ViewInvoiceDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facture {invoice.number}
          </DialogTitle>
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
              <h3 className="font-semibold mb-4">Montant total</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'MAD'
                }).format(invoice.total_amount)}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
