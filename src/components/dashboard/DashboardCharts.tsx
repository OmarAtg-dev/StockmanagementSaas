
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
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
  { month: "Jan", sales: 4000 },
  { month: "Fév", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Avr", sales: 4600 },
  { month: "Mai", sales: 6800 },
  { month: "Juin", sales: 7000 },
];

const stockData = [
  { category: "Électronique", stock: 145 },
  { category: "Accessoires", stock: 235 },
  { category: "Gadgets", stock: 187 },
  { category: "Téléphones", stock: 156 },
  { category: "Ordinateurs", stock: 112 },
];

type ChartType = "area" | "line" | "bar";

export function DashboardCharts() {
  const [salesChartType, setSalesChartType] = useState<ChartType>("area");
  const [stockChartType, setStockChartType] = useState<ChartType>("bar");

  const renderChart = (
    data: typeof salesData | typeof stockData,
    chartType: ChartType,
    dataKey: string,
    name: string,
    color: string,
    xAxisKey: string
  ) => {
    const ChartComponent = {
      area: AreaChart,
      line: LineChart,
      bar: BarChart,
    }[chartType];

    const DataComponent = {
      area: (
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          fill={color}
          fillOpacity={0.2}
        />
      ),
      line: (
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2}
        />
      ),
      bar: (
        <Bar
          dataKey={dataKey}
          name={name}
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      ),
    }[chartType];

    return (
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        {DataComponent}
      </ChartComponent>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Tendance des Ventes</h3>
          <Select
            defaultValue="area"
            onValueChange={(value) => setSalesChartType(value as ChartType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de graphique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Graphique en aire</SelectItem>
              <SelectItem value="line">Graphique en ligne</SelectItem>
              <SelectItem value="bar">Graphique en barres</SelectItem>
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
            {renderChart(salesData, salesChartType, "sales", "ventes", "#2DD4BF", "month")}
          </ChartContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Distribution des Stocks</h3>
          <Select
            defaultValue="bar"
            onValueChange={(value) => setStockChartType(value as ChartType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de graphique" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Graphique en aire</SelectItem>
              <SelectItem value="line">Graphique en ligne</SelectItem>
              <SelectItem value="bar">Graphique en barres</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            {renderChart(stockData, stockChartType, "stock", "stock", "#FB923C", "category")}
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
