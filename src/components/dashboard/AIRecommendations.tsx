import { Brain, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  id: string;
  type: "irrigation" | "fertilizer" | "pest_control" | "harvest";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  confidence: number;
  estimatedImpact: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: "1",
    type: "irrigation",
    priority: "high",
    title: "Increase Irrigation Schedule",
    description: "Soil moisture levels are below optimal range. Recommend increasing irrigation frequency by 20%.",
    confidence: 94,
    estimatedImpact: "15% yield improvement"
  }
];

export function AIRecommendations() {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "medium":
        return <Lightbulb className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg animate-pulse-glow">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-card-foreground">AI Recommendations</h2>
          <p className="text-sm text-muted-foreground">Smart insights for optimal farming</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {mockRecommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(recommendation.priority)}
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {recommendation.title}
                </h3>
              </div>
              <Badge variant={getPriorityColor(recommendation.priority) as any} className="text-xs">
                {recommendation.priority.toUpperCase()}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {recommendation.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-xs">
                  <span className="text-muted-foreground">Confidence: </span>
                  <span className="font-medium text-primary">{recommendation.confidence}%</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Impact: </span>
                  <span className="font-medium text-success">{recommendation.estimatedImpact}</span>
                </div>
              </div>
              
              <div className="w-16 bg-muted rounded-full h-1">
                <div 
                  className="bg-gradient-primary h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${recommendation.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          <span className="text-xs text-primary font-medium">AI Engine Active</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Analyzing field data continuously for optimal recommendations
        </p>
      </div>
    </Card>
  );
}