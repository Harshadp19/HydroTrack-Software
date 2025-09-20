import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Gauge,
  CloudRain,
  Sprout
} from "lucide-react";
import { KPICard } from "./KPICard";
import { ChartWidget } from "./ChartWidget";
import { AIRecommendations } from "./AIRecommendations";

// Mock data for charts
const rainfallData = [
  { name: "6AM", value: 230, time: "06:00" },
  { name: "9AM", value: 410, time: "09:00" },
  { name: "12PM", value: 680, time: "12:00" },
  { name: "3PM", value: 320, time: "15:00" },
  { name: "6PM", value: 180, time: "18:00" },
  { name: "9PM", value: 50, time: "21:00" },
];

const temperatureData = [
  { name: "6AM", value: 18, time: "06:00" },
  { name: "9AM", value: 22, time: "09:00" },
  { name: "12PM", value: 28, time: "12:00" },
  { name: "3PM", value: 32, time: "15:00" },
  { name: "6PM", value: 26, time: "18:00" },
  { name: "9PM", value: 21, time: "21:00" },
];

const soilMoistureData = [
  { name: "6AM", value: 45, time: "06:00" },
  { name: "9AM", value: 42, time: "09:00" },
  { name: "12PM", value: 38, time: "12:00" },
  { name: "3PM", value: 35, time: "15:00" },
  { name: "6PM", value: 41, time: "18:00" },
  { name: "9PM", value: 43, time: "21:00" },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Farm Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time monitoring and intelligent agriculture insights
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Soil Moisture Zone A"
          value="42"
          unit="%"
          icon={<Droplets className="w-6 h-6 text-primary animate-float" />}
          trend="down"
          trendValue="-3%"
          status="warning"
        />
        
        <KPICard
          title="Soil Moisture Zone B"
          value="38"
          unit="%"
          icon={<Gauge className="w-6 h-6 text-primary animate-float" />}
          trend="down"
          trendValue="-5%"
          status="critical"
        />
        
        <KPICard
          title="Rainfall"
          value="2840"
          unit="ml"
          icon={<CloudRain className="w-6 h-6 text-primary animate-float" />}
          trend="up"
          trendValue="+450ml"
          status="optimal"
        />
      </div>

      {/* Charts and AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWidget
            title="Soil Moisture Zone A"
            data={soilMoistureData}
            color="hsl(var(--primary))"
          />
          
          <ChartWidget
            title="Soil Moisture Zone B"
            data={soilMoistureData}
            color="hsl(var(--warning))"
          />
          
          <ChartWidget
            title="Rainfall Volume"
            data={rainfallData}
            color="hsl(var(--success))"
            className="lg:col-span-2"
          />
        </div>

        {/* AI Recommendations */}
        <div className="lg:col-span-1">
          <AIRecommendations />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300 group animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:animate-float">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Irrigation Control</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Manage automated irrigation systems and schedules
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            <span className="text-xs text-success">System Active</span>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300 group animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:animate-float">
              <Gauge className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Field Sensors</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Real-time data from field monitoring devices
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            <span className="text-xs text-success">12 Sensors Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}