import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function AIRecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const { data } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (recommendationId: string) => {
    try {
      await supabase
        .from('ai_recommendations')
        .update({ is_read: true })
        .eq('id', recommendationId);
      
      setRecommendations(prev =>
        prev.map(rec => 
          rec.id === recommendationId ? { ...rec, is_read: true } : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as read:', error);
    }
  };

  const markAsApplied = async (recommendationId: string) => {
    try {
      await supabase
        .from('ai_recommendations')
        .update({ is_applied: true, is_read: true })
        .eq('id', recommendationId);
      
      setRecommendations(prev =>
        prev.map(rec => 
          rec.id === recommendationId ? { ...rec, is_applied: true, is_read: true } : rec
        )
      );
    } catch (error) {
      console.error('Error marking recommendation as applied:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'irrigation':
        return 'bg-blue-100 text-blue-800';
      case 'fertilizer':
        return 'bg-green-100 text-green-800';
      case 'pest_control':
        return 'bg-orange-100 text-orange-800';
      case 'harvest':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadRecommendations = recommendations.filter(rec => !rec.is_read);
  const appliedRecommendations = recommendations.filter(rec => rec.is_applied);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Recommendations
          </h1>
          <p className="text-muted-foreground">
            Intelligent suggestions to optimize your farming operations
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadRecommendations.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{appliedRecommendations.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Recommendations</CardTitle>
          <CardDescription>
            AI-generated suggestions based on your sensor data and farm conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No AI recommendations available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start collecting sensor data to receive intelligent farming suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <Card 
                  key={recommendation.id} 
                  className={`border-l-4 ${
                    recommendation.priority === 'high' ? 'border-l-red-500' :
                    recommendation.priority === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  } ${!recommendation.is_read ? 'bg-muted/30' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityIcon(recommendation.priority)}
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getTypeColor(recommendation.type)}>
                            {recommendation.type.replace('_', ' ')}
                          </Badge>
                          {!recommendation.is_read && (
                            <Badge variant="secondary">NEW</Badge>
                          )}
                          {recommendation.is_applied && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              APPLIED
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">
                          {recommendation.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-3">
                          {recommendation.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span>Confidence: {recommendation.confidence}%</span>
                          {recommendation.estimated_impact && (
                            <span>Impact: {recommendation.estimated_impact}</span>
                          )}
                          <span>
                            {new Date(recommendation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!recommendation.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(recommendation.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      {!recommendation.is_applied && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => markAsApplied(recommendation.id)}
                        >
                          Mark as Applied
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}