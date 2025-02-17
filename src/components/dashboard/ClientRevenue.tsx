
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Client SARL", value: 35, color: "#2DD4BF" },
  { name: "MegaCorp", value: 25, color: "#FB923C" },
  { name: "TechFirm", value: 20, color: "#A78BFA" },
  { name: "Autres Clients", value: 20, color: "#94A3B8" },
];

export function ClientRevenue() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Répartition du chiffre d'affaires par client</h3>
      </div>
      <div className="h-[300px]">
        <ChartContainer
          config={{
            revenue: {
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
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  value,
                  name,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#888888"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-xs"
                    >
                      {`${name} (${value}%)`}
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
}
