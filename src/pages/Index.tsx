
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";
import { MADIcon } from "@/components/icons/MADIcon";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue ! Voici ce qui se passe avec votre inventaire aujourd'hui.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Produits"
            value="2 420"
            icon={<Package className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Valeur Totale"
            value={new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'MAD'
            }).format(142040)}
            icon={<MADIcon className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Stock Faible"
            value="12"
            icon={<AlertTriangle className="h-6 w-6" />}
            trend={{ value: 2, isPositive: false }}
          />
          <StatsCard
            title="Croissance Mensuelle"
            value="24%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        <DashboardCharts />

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
