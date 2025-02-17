
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const salesData = [
  { name: "Électronique", value: 4000 },
  { name: "Mode", value: 3000 },
  { name: "Maison", value: 2000 },
  { name: "Sport", value: 1500 },
  { name: "Autres", value: 1000 },
];

const performanceData = [
  { name: "Ventes", value: 85, fill: "#2DD4BF" },
  { name: "Objectifs", value: 75, fill: "#FB923C" },
  { name: "Croissance", value: 65, fill: "#A78BFA" },
  { name: "Satisfaction", value: 90, fill: "#34D399" },
];

const COLORS = ["#2DD4BF", "#FB923C", "#A78BFA", "#34D399", "#F472B6"];

export function DashboardCharts() {
  const [chartType, setChartType] = useState<"pie" | "radial">("pie");

  const renderPieChart = () => (
    <PieChart>
      <Pie
        data={salesData}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
      >
        {salesData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <ChartTooltip content={<ChartTooltipContent />} />
      <Legend />
    </PieChart>
  );

  const renderRadialChart = () => (
    <RadialBarChart
      innerRadius={20}
      outerRadius={140}
      barSize={20}
      data={performanceData}
    >
      <RadialBar
        background
        dataKey="value"
        label={{ position: "insideStart", fill: "#fff" }}
      />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Legend
        iconSize={10}
        layout="vertical"
        verticalAlign="middle"
        align="right"
      />
    </RadialBarChart>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Distribution des Ventes</h3>
          <Select
            defaultValue="pie"
            onValueChange={(value) => setChartType(value as "pie" | "radial")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de graphique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Graphique circulaire</SelectItem>
              <SelectItem value="radial">Graphique radial</SelectItem>
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
              {chartType === "pie" ? renderPieChart() : renderRadialChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Indicateurs de Performance</h3>
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
              <RadialBarChart
                innerRadius={20}
                outerRadius={140}
                barSize={20}
                data={performanceData}
              >
                <RadialBar
                  background
                  dataKey="value"
                  label={{ position: "insideStart", fill: "#fff" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
