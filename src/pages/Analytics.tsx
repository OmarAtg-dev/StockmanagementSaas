
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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
                  <h3 className="font-semibold">Performance Globale</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetailsDialog(true)}
                  >
                    Voir les détails
                  </Button>
                </div>
                <div className="h-[400px]">
                  <DashboardCharts />
                </div>
              </div>
            </Card>
          </div>
        </AnalyticsSection>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la Performance</DialogTitle>
            <DialogDescription>
              Analyse approfondie des indicateurs de performance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Distribution des Ventes</h4>
              <p className="text-sm text-muted-foreground">
                La répartition des ventes montre une forte dominance dans le secteur de l'électronique,
                représentant 35% du total des ventes. Les secteurs de la mode et de la maison suivent
                avec respectivement 25% et 20%.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Indicateurs de Performance</h4>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ventes</p>
                    <p className="text-sm text-muted-foreground">
                      85% de l'objectif atteint ce mois-ci
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Objectifs</p>
                    <p className="text-sm text-muted-foreground">
                      75% des objectifs trimestriels atteints
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Croissance</p>
                    <p className="text-sm text-muted-foreground">
                      65% de croissance par rapport à l'année précédente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Satisfaction Client</p>
                    <p className="text-sm text-muted-foreground">
                      90% de satisfaction client globale
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Analytics;
