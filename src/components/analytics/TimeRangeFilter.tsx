
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeRange = "7d" | "30d" | "90d" | "1y" | "all";

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimeRange)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner une période" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">7 derniers jours</SelectItem>
        <SelectItem value="30d">30 derniers jours</SelectItem>
        <SelectItem value="90d">90 derniers jours</SelectItem>
        <SelectItem value="1y">Dernière année</SelectItem>
        <SelectItem value="all">Toutes les données</SelectItem>
      </SelectContent>
    </Select>
  );
}
