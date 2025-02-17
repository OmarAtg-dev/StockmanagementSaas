
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AnalyticsSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function AnalyticsSection({ 
  title, 
  children, 
  defaultExpanded = true 
}: AnalyticsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="transition-transform"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className={`space-y-4 transition-all duration-300 ${
        isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
      }`}>
        {children}
      </div>
    </section>
  );
}
