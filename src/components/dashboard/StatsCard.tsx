
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("p-6 animate-fade-up", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </Card>
  );
}
