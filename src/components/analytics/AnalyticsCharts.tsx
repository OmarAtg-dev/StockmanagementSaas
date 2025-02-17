
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
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const salesData = [
  { name: "Électronique", value: 35 },
  { name: "Mode", value: 25 },
  { name: "Maison", value: 20 },
  { name: "Autres", value: 20 },
];

const performanceData = [
  { name: "Complétés", value: 65 },
  { name: "En cours", value: 25 },
  { name: "En retard", value: 10 },
];

const COLORS = ["#2DD4BF", "#FB923C", "#F43F5E", "#A855F7"];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Distribution des Ventes</h3>
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
              <PieChart>
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Performance des Objectifs</h3>
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
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
