import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Droplets, Plus, Play, Pause, Settings, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ControlsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    zone_name: '',
    crop_id: '',
    start_time: '',
    duration_minutes: 30,
    frequency_days: 1,
  });

  useEffect(() => {
    if (user) {
      fetchSchedules();
      fetchCrops();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      const { data } = await supabase
        .from('irrigation_schedules')
        .select(`
          *,
          crops(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .eq('user_id', user?.id);

      setCrops(data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const createSchedule = async () => {
    if (!newSchedule.zone_name || !newSchedule.start_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .insert([{
          ...newSchedule,
          user_id: user?.id,
          crop_id: newSchedule.crop_id || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Irrigation schedule created successfully",
      });

      setShowDialog(false);
      setNewSchedule({
        zone_name: '',
        crop_id: '',
        start_time: '',
        duration_minutes: 30,
        frequency_days: 1,
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create irrigation schedule",
        variant: "destructive",
      });
    }
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .update({ is_active: isActive })
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId ? { ...schedule, is_active: isActive } : schedule
        )
      );

      toast({
        title: "Success",
        description: `Schedule ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const runImmediately = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .update({ 
          last_run: new Date().toISOString(),
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Irrigation started manually",
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error running irrigation:', error);
      toast({
        title: "Error",
        description: "Failed to start irrigation",
        variant: "destructive",
      });
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplets className="h-8 w-8" />
            Irrigation Controls
          </h1>
          <p className="text-muted-foreground">
            Manage automated irrigation schedules and manual controls
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Irrigation Schedule</DialogTitle>
              <DialogDescription>
                Set up a new automated irrigation schedule for your crops.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="zone_name">Zone Name *</Label>
                <Input
                  id="zone_name"
                  placeholder="e.g., North Field, Greenhouse A"
                  value={newSchedule.zone_name}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, zone_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="crop_id">Associated Crop (Optional)</Label>
                <Select
                  value={newSchedule.crop_id}
                  onValueChange={(value) => setNewSchedule(prev => ({ ...prev, crop_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        {crop.name} - {crop.variety}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={newSchedule.start_time}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  value={newSchedule.duration_minutes}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="frequency_days">Frequency (every X days)</Label>
                <Input
                  id="frequency_days"
                  type="number"
                  min="1"
                  value={newSchedule.frequency_days}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency_days: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createSchedule}>Create Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                <p className="text-2xl font-bold">
                  {schedules.filter(s => s.is_active).length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zones Covered</p>
                <p className="text-2xl font-bold">
                  {new Set(schedules.map(s => s.zone_name)).size}
                </p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Irrigation Schedules */}
      <Card>
        <CardHeader>
          <CardTitle>Irrigation Schedules</CardTitle>
          <CardDescription>
            Manage your automated irrigation schedules and manual controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No irrigation schedules set up yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first schedule to automate your irrigation system.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{schedule.zone_name}</h3>
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {schedule.crops?.name && (
                            <Badge variant="outline">{schedule.crops.name}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Start: {schedule.start_time}</span>
                          </div>
                          <div>
                            Duration: {schedule.duration_minutes}min
                          </div>
                          <div>
                            Every {schedule.frequency_days} day(s)
                          </div>
                          <div>
                            {schedule.last_run ? (
                              <span>Last run: {new Date(schedule.last_run).toLocaleDateString()}</span>
                            ) : (
                              <span>Never run</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.is_active}
                          onCheckedChange={(checked) => toggleSchedule(schedule.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => runImmediately(schedule.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Run Now
                        </Button>
                      </div>
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