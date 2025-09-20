import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  icon: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  status?: "optimal" | "warning" | "critical";
  className?: string;
}

export function KPICard({
  title,
  value,
  unit,
  icon,
  trend = "stable",
  trendValue,
  status = "optimal",
  className
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />;
      case "down":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "optimal":
        return "border-success/20 shadow-success/10";
      case "warning":
        return "border-warning/20 shadow-warning/10";
      case "critical":
        return "border-destructive/20 shadow-destructive/10";
      default:
        return "border-border";
    }
  };

  return (
    <div className={cn(
      "relative p-6 bg-card rounded-xl border transition-all duration-300 group",
      "hover:shadow-card hover:-translate-y-1 animate-fade-in",
      getStatusColor(),
      className
    )}>
      {/* Status indicator */}
      <div className={cn(
        "absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse-glow",
        status === "optimal" && "bg-success",
        status === "warning" && "bg-warning",
        status === "critical" && "bg-destructive"
      )} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg group-hover:animate-float">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-card-foreground/80">{title}</h3>
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* Trend */}
      {trendValue && (
        <div className={cn(
          "flex items-center space-x-1 text-sm",
          getTrendColor()
        )}>
          {getTrendIcon()}
          <span>{trendValue}</span>
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      )}

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
    </div>
  );
}