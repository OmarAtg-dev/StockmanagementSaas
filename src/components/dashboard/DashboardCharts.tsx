
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const data = [
  { name: "Jan", sales: 4000, goal: 3000 },
  { name: "Fév", sales: 3000, goal: 3200 },
  { name: "Mar", sales: 5000, goal: 3500 },
  { name: "Avr", sales: 2780, goal: 3800 },
  { name: "Mai", sales: 4890, goal: 4000 },
  { name: "Juin", sales: 3390, goal: 4200 },
];

const performanceData = [
  { name: "Lun", value: 2400, trend: 1800 },
  { name: "Mar", value: 1398, trend: 1600 },
  { name: "Mer", value: 9800, trend: 9000 },
  { name: "Jeu", value: 3908, trend: 3800 },
  { name: "Ven", value: 4800, trend: 4300 },
  { name: "Sam", value: 3800, trend: 3600 },
  { name: "Dim", value: 4300, trend: 4100 },
];

export function DashboardCharts() {
  const [chartType, setChartType] = useState<"line" | "area">("line");

  const renderLineChart = () => (
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip content={<ChartTooltipContent />} />
      <Legend />
      <Line
        type="monotone"
        dataKey="sales"
        name="Ventes"
        stroke="#2DD4BF"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="goal"
        name="Objectif"
        stroke="#FB923C"
        strokeWidth={2}
      />
    </LineChart>
  );

  const renderAreaChart = () => (
    <AreaChart data={performanceData}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip content={<ChartTooltipContent />} />
      <Legend />
      <Area
        type="monotone"
        dataKey="value"
        name="Performance"
        stroke="#2DD4BF"
        fill="#2DD4BF"
        fillOpacity={0.3}
      />
      <Area
        type="monotone"
        dataKey="trend"
        name="Tendance"
        stroke="#FB923C"
        fill="#FB923C"
        fillOpacity={0.3}
      />
    </AreaChart>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Ventes vs Objectifs</h3>
          <Select
            defaultValue="line"
            onValueChange={(value) => setChartType(value as "line" | "area")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de graphique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Graphique linéaire</SelectItem>
              <SelectItem value="area">Graphique de zone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              sales: {
                theme: {
                  light: "#2DD4BF",
                  dark: "#2DD4BF",
                },
              },
            }}
          >
            <ResponsiveContainer>
              {chartType === "line" ? renderLineChart() : renderAreaChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Performance Hebdomadaire</h3>
        </div>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              performance: {
                theme: {
                  light: "#FB923C",
                  dark: "#FB923C",
                },
              },
            }}
          >
            <ResponsiveContainer>
              <AreaChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Performance"
                  stroke="#2DD4BF"
                  fill="#2DD4BF"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="trend"
                  name="Tendance"
                  stroke="#FB923C"
                  fill="#FB923C"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
