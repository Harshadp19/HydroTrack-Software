import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ESP32Data {
  device_id: string;
  sensors: {
    soil_moisture_1: number;
    soil_moisture_2: number;
    water_volume: number;
  };
  actuators: {
    pump_1_status: boolean;
    pump_2_status: boolean;
  };
  timestamp?: string;
}

interface PumpCommand {
  device_id: string;
  pump_id: 1 | 2;
  action: 'start' | 'stop';
  duration_minutes?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'POST' && path === '/esp32-data/sensor-data') {
      // Handle sensor data from ESP32
      const data: ESP32Data = await req.json();
      console.log('Received sensor data:', data);

      // Find the user's sensors by device mapping (you'll need to implement device registration)
      const { data: sensors, error: sensorsError } = await supabase
        .from('sensors')
        .select('id, type, name')
        .in('type', ['soil_moisture', 'volume']);

      if (sensorsError) {
        console.error('Error fetching sensors:', sensorsError);
        return new Response(JSON.stringify({ error: 'Failed to fetch sensors' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Insert sensor readings
      const readings = [];
      
      // Soil moisture sensors
      const soilSensors = sensors.filter(s => s.type === 'soil_moisture');
      if (soilSensors[0]) {
        readings.push({
          sensor_id: soilSensors[0].id,
          value: data.sensors.soil_moisture_1,
          unit: '%',
          timestamp: data.timestamp || new Date().toISOString()
        });
      }
      if (soilSensors[1]) {
        readings.push({
          sensor_id: soilSensors[1].id,
          value: data.sensors.soil_moisture_2,
          unit: '%',
          timestamp: data.timestamp || new Date().toISOString()
        });
      }

      // Volume sensor
      const volumeSensor = sensors.find(s => s.type === 'volume');
      if (volumeSensor) {
        readings.push({
          sensor_id: volumeSensor.id,
          value: data.sensors.water_volume,
          unit: 'ml',
          timestamp: data.timestamp || new Date().toISOString()
        });
      }

      const { error: readingsError } = await supabase
        .from('sensor_readings')
        .insert(readings);

      if (readingsError) {
        console.error('Error inserting readings:', readingsError);
        return new Response(JSON.stringify({ error: 'Failed to insert sensor readings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update actuator status if provided
      if (data.actuators) {
        const { data: actuators } = await supabase
          .from('actuators')
          .select('id, name')
          .eq('type', 'water_pump');

        if (actuators) {
          const updates = [];
          const pump1 = actuators.find(a => a.name.includes('1'));
          const pump2 = actuators.find(a => a.name.includes('2'));

          if (pump1) {
            updates.push({
              id: pump1.id,
              status: data.actuators.pump_1_status ? 'active' : 'inactive',
              last_activated: data.actuators.pump_1_status ? new Date().toISOString() : undefined
            });
          }
          if (pump2) {
            updates.push({
              id: pump2.id,
              status: data.actuators.pump_2_status ? 'active' : 'inactive',
              last_activated: data.actuators.pump_2_status ? new Date().toISOString() : undefined
            });
          }

          for (const update of updates) {
            await supabase
              .from('actuators')
              .update({
                status: update.status,
                ...(update.last_activated && { last_activated: update.last_activated })
              })
              .eq('id', update.id);
          }
        }
      }

      return new Response(JSON.stringify({ success: true, message: 'Data received and stored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST' && path === '/esp32-data/pump-command') {
      // Handle pump commands to ESP32
      const command: PumpCommand = await req.json();
      console.log('Pump command:', command);

      // Log the command
      const { data: actuators } = await supabase
        .from('actuators')
        .select('id')
        .eq('type', 'water_pump')
        .ilike('name', `%${command.pump_id}%`);

      if (actuators && actuators[0]) {
        await supabase
          .from('actuator_logs')
          .insert({
            actuator_id: actuators[0].id,
            action: command.action,
            duration_minutes: command.duration_minutes,
            triggered_by: 'manual',
            timestamp: new Date().toISOString()
          });
      }

      // Return command for ESP32 to process
      return new Response(JSON.stringify({
        success: true,
        command: {
          pump_id: command.pump_id,
          action: command.action,
          duration_minutes: command.duration_minutes || 5
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET' && path === '/esp32-data/commands') {
      // Endpoint for ESP32 to poll for commands
      const deviceId = url.searchParams.get('device_id');
      
      // Here you would implement a command queue system
      // For now, return empty commands
      return new Response(JSON.stringify({ commands: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});