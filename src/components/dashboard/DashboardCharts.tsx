
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4600 },
  { month: "May", sales: 6800 },
  { month: "Jun", sales: 7000 },
];

const stockData = [
  { category: "Electronics", stock: 145 },
  { category: "Accessories", stock: 235 },
  { category: "Gadgets", stock: 187 },
  { category: "Phones", stock: 156 },
  { category: "Laptops", stock: 112 },
];

export function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Sales Trend</h3>
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
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="sales"
                name="sales"
                stroke="#2DD4BF"
                fill="#2DD4BF"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Stock Distribution</h3>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              stock: {
                theme: {
                  light: "#FB923C",
                  dark: "#FB923C",
                },
              },
            }}
          >
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="stock"
                name="stock"
                fill="#FB923C"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
