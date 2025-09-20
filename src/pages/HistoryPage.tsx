import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function HistoryPage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistoricalData();
      fetchSensors();
    }
  }, [user, selectedSensor]);

  const fetchSensors = async () => {
    try {
      const { data } = await supabase
        .from('sensors')
        .select('*')
        .eq('user_id', user?.id);
      setSensors(data || []);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      let query = supabase
        .from('sensor_readings')
        .select(`
          *,
          sensors!inner(*)
        `)
        .eq('sensors.user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (selectedSensor !== 'all') {
        query = query.eq('sensor_id', selectedSensor);
      }

      const { data } = await query;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorTypeBadge = (type: string) => {
    const colors = {
      soil_moisture: 'bg-blue-100 text-blue-800',
      volume: 'bg-cyan-100 text-cyan-800',
      water_pump: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Historical Data
          </h1>
          <p className="text-muted-foreground">View and analyze past sensor readings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sensor Reading History</CardTitle>
              <CardDescription>Complete record of all sensor measurements</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by sensor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sensors</SelectItem>
                  {sensors.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>
                      {sensor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No historical data available.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start collecting sensor data to build your historical records.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sensor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">
                      {reading.sensors?.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSensorTypeBadge(reading.sensors?.type)}>
                        {reading.sensors?.type?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {reading.value} {reading.unit}
                      </span>
                    </TableCell>
                    <TableCell>{reading.sensors?.location || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reading.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}