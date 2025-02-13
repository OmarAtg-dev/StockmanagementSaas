
import { LucideProps } from "lucide-react";
import React from "react";

export const MADIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  function MADIcon(props, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <text x="2" y="16" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
          MA
        </text>
        <text x="16" y="16" fontSize="12" fontFamily="sans-serif" fontWeight="bold">
          D
        </text>
      </svg>
    );
  }
);

MADIcon.displayName = "MADIcon";
