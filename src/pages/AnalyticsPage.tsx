import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartWidget } from '@/components/dashboard/ChartWidget';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { DashboardLayout } from './DashboardPage';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      const { data: sensors } = await supabase
        .from('sensors')
        .select('*')
        .eq('user_id', user?.id);

      if (sensors) {
        const { data: readings } = await supabase
          .from('sensor_readings')
          .select('*, sensors!inner(*)')
          .eq('sensors.user_id', user?.id)
          .order('timestamp', { ascending: false })
          .limit(100);
        
        setSensorData(readings || []);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Detailed sensor data and performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Soil Moisture Zone A</CardTitle>
            <CardDescription>Zone A soil moisture levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWidget type="line" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soil Moisture Zone B</CardTitle>
            <CardDescription>Zone B soil moisture levels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWidget type="area" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rainfall Measurements</CardTitle>
            <CardDescription>Water volume collected via ultrasonic sensor</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartWidget type="bar" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sensor Performance Summary</CardTitle>
          <CardDescription>Overview of all sensor readings and status</CardDescription>
        </CardHeader>
        <CardContent>
          {sensorData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sensor data available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Add sensors and start collecting data to see analytics here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sensorData.slice(0, 5).map((reading) => (
                <div key={reading.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{reading.sensors?.name}</p>
                    <p className="text-sm text-muted-foreground">{reading.sensors?.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{reading.value} {reading.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reading.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}