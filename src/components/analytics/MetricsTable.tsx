
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricData {
  metric: string;
  current: number;
  previous: number;
  change: number;
}

interface MetricsTableProps {
  data: MetricData[];
}

export function MetricsTable({ data }: MetricsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Métrique</TableHead>
            <TableHead className="text-right">Valeur actuelle</TableHead>
            <TableHead className="text-right">Valeur précédente</TableHead>
            <TableHead className="text-right">Variation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.metric}>
              <TableCell className="font-medium">{row.metric}</TableCell>
              <TableCell className="text-right">{row.current.toLocaleString()}</TableCell>
              <TableCell className="text-right">{row.previous.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {row.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  {Math.abs(row.change)}%
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
