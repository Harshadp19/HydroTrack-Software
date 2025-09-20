import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, TrendingUp, Droplets, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    if (user) {
      generateReport();
    }
  }, [user, selectedPeriod]);

  const generateReport = async () => {
    try {
      const daysAgo = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch sensor data for the period
      const { data: readings } = await supabase
        .from('sensor_readings')
        .select(`
          *,
          sensors!inner(*)
        `)
        .eq('sensors.user_id', user?.id)
        .gte('timestamp', startDate.toISOString());

      // Fetch crops data
      const { data: crops } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user?.id);

      // Process the data for report
      const processedData = processReadingsData(readings || []);
      setReportData({
        ...processedData,
        crops: crops || [],
        period: daysAgo,
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReadingsData = (readings: any[]) => {
    const sensorTypes = ['soil_moisture', 'volume'];
    const summary: any = {};

    sensorTypes.forEach(type => {
      const typeReadings = readings.filter(r => r.sensors?.type === type);
      if (typeReadings.length > 0) {
        const values = typeReadings.map(r => parseFloat(r.value));
        summary[type] = {
          count: typeReadings.length,
          average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          unit: typeReadings[0]?.unit || '',
        };
      }
    });

    return {
      totalReadings: readings.length,
      sensorsActive: new Set(readings.map(r => r.sensor_id)).size,
      summary,
    };
  };

  const exportReport = () => {
    const reportContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([reportContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrotrack-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            <FileText className="h-8 w-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Generate and export detailed farm reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 2 Weeks</SelectItem>
              <SelectItem value="30">Last Month</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Readings</p>
                <p className="text-2xl font-bold">{reportData.totalReadings || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sensors</p>
                <p className="text-2xl font-bold">{reportData.sensorsActive || 0}</p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crops Monitored</p>
                <p className="text-2xl font-bold">{reportData.crops?.length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Report Period</p>
                <p className="text-2xl font-bold">{reportData.period || 0}d</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Data Summary</CardTitle>
          <CardDescription>
            Statistical overview of sensor readings for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.summary && Object.keys(reportData.summary).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).map(([type, data]: [string, any]) => (
                <Card key={type} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {type === 'volume' && <Droplets className="h-4 w-4" />}
                      {type === 'soil_moisture' && <Thermometer className="h-4 w-4" />}
                      <Badge variant="outline">
                        {type === 'volume' ? 'RAINFALL' : type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average:</span>
                        <span className="font-medium">{data.average} {data.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min:</span>
                        <span>{data.min} {data.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max:</span>
                        <span>{data.max} {data.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Readings:</span>
                        <span>{data.count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sensor data available for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crops Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Crops Overview</CardTitle>
          <CardDescription>Current crops and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {reportData.crops?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportData.crops.map((crop: any) => (
                <Card key={crop.id} className="border">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{crop.name}</h3>
                    <p className="text-sm text-muted-foreground">{crop.variety}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{crop.field_location || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="outline">{crop.status}</Badge>
                      </div>
                      {crop.area_size && (
                        <div className="flex justify-between">
                          <span>Area:</span>
                          <span>{crop.area_size} ha</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No crops registered yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}