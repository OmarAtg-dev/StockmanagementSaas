
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingUp, DollarSign, Package, ShoppingCart } from "lucide-react";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytique</h1>
          <p className="text-muted-foreground">
            Aperçu des performances et des tendances
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Chiffre d'affaires"
            value="45 230 €"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Ventes"
            value="234"
            icon={<ShoppingCart className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Produits"
            value="1 245"
            icon={<Package className="h-6 w-6" />}
            trend={{ value: 4, isPositive: true }}
          />
          <StatsCard
            title="Croissance"
            value="24%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        <DashboardCharts />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
