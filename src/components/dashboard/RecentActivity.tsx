
import { Card } from "@/components/ui/card";
import { Package, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    type: "stock-in",
    product: "iPhone 14 Pro",
    quantity: 50,
    date: "il y a 2 heures",
  },
  {
    type: "stock-out",
    product: "MacBook Air M2",
    quantity: 10,
    date: "il y a 5 heures",
  },
  {
    type: "stock-in",
    product: "AirPods Pro",
    quantity: 100,
    date: "il y a 1 jour",
  },
];

export function RecentActivity() {
  return (
    <Card className="p-6 animate-fade-up">
      <h3 className="font-semibold mb-4">Activité Récente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              activity.type === "stock-in" ? "bg-green-100" : "bg-red-100"
            )}>
              {activity.type === "stock-in" ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.product}</p>
              <p className="text-sm text-muted-foreground">
                {activity.type === "stock-in" ? "Ajout de" : "Retrait de"} {activity.quantity} unités
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{activity.date}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
