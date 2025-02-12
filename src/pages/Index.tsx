
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your inventory today.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Products"
            value="2,420"
            icon={<Package className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Value"
            value="$142,040"
            icon={<DollarSign className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Low Stock Items"
            value="12"
            icon={<AlertTriangle className="h-6 w-6" />}
            trend={{ value: 2, isPositive: false }}
          />
          <StatsCard
            title="Monthly Growth"
            value="24%"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={{ value: 18, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity />
          {/* We'll add more components here in future iterations */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
