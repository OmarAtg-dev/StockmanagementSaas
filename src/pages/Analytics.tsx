
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TrendingUp, Package, ShoppingCart, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeRangeFilter } from "@/components/analytics/TimeRangeFilter";
import { MetricsTable } from "@/components/analytics/MetricsTable";
import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";
import { useState } from "react";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");

  const metricsData = [
    { metric: "Chiffre d'affaires", current: 45230, previous: 40340, change: 12.1 },
    { metric: "Nombre de ventes", current: 234, previous: 216, change: 8.3 },
    { metric: "Produits actifs", current: 1245, previous: 1198, change: 3.9 },
    { metric: "Taux de croissance", current: 24, previous: 20, change: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytique</h1>
            <p className="text-muted-foreground">
              Aperçu détaillé des performances et des tendances
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Metrics Section */}
        <AnalyticsSection title="Métriques clés">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Chiffre d'affaires"
              value={new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'MAD'
              }).format(45230)}
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
          <MetricsTable data={metricsData} />
        </AnalyticsSection>

        {/* Charts Section */}
        <AnalyticsSection title="Analyse des tendances">
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Évolution des ventes</h3>
                  <Button variant="outline" size="sm">
                    Voir les détails
                  </Button>
                </div>
                <div className="h-[400px]"> {/* Increased height for better visualization */}
                  <DashboardCharts />
                </div>
              </div>
            </Card>
          </div>
        </AnalyticsSection>

        {/* Detailed Analysis Section */}
        <AnalyticsSection title="Analyse détaillée" defaultExpanded={false}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Distribution des ventes par catégorie</h3>
              <div className="h-[300px]">
                <DashboardCharts />
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 font-semibold">Performance par région</h3>
              <div className="h-[300px]">
                <DashboardCharts />
              </div>
            </Card>
          </div>
        </AnalyticsSection>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
