-- Update the setup_demo_data function to match MVP prototype
CREATE OR REPLACE FUNCTION public.setup_demo_data(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear existing demo data for this user
  DELETE FROM public.actuator_logs WHERE actuator_id IN (SELECT id FROM public.actuators WHERE user_id = user_id_param);
  DELETE FROM public.sensor_readings WHERE sensor_id IN (SELECT id FROM public.sensors WHERE user_id = user_id_param);
  DELETE FROM public.irrigation_schedules WHERE user_id = user_id_param;
  DELETE FROM public.ai_recommendations WHERE user_id = user_id_param;
  DELETE FROM public.crops WHERE user_id = user_id_param;
  DELETE FROM public.actuators WHERE user_id = user_id_param;
  DELETE FROM public.sensors WHERE user_id = user_id_param;

  -- Insert MVP sensors (2 soil moisture + 1 ultrasonic for volume)
  INSERT INTO public.sensors (name, type, location, status, user_id) VALUES
    ('Soil Moisture Sensor 1', 'soil_moisture', 'Zone 1', 'active', user_id_param),
    ('Soil Moisture Sensor 2', 'soil_moisture', 'Zone 2', 'active', user_id_param),
    ('Water Level Sensor', 'volume', 'Water Tank', 'active', user_id_param);

  -- Insert MVP actuators (2 water pumps)
  INSERT INTO public.actuators (name, type, location, status, user_id, is_automated) VALUES
    ('Water Pump 1', 'water_pump', 'Zone 1', 'inactive', user_id_param, true),
    ('Water Pump 2', 'water_pump', 'Zone 2', 'inactive', user_id_param, true);

  -- Insert sample sensor readings for the last 24 hours
  INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp) 
  SELECT 
    s.id,
    CASE 
      WHEN s.type = 'soil_moisture' THEN random() * 40 + 30  -- 30-70%
      WHEN s.type = 'volume' THEN random() * 3000 + 2000    -- 2000-5000ml
    END,
    CASE 
      WHEN s.type = 'soil_moisture' THEN '%'
      WHEN s.type = 'volume' THEN 'ml'
    END,
    NOW() - INTERVAL '1 hour' * generate_series(0, 23)
  FROM public.sensors s
  WHERE s.user_id = user_id_param;

  -- Insert sample actuator logs (pump operations)
  INSERT INTO public.actuator_logs (actuator_id, action, duration_minutes, volume_ml, triggered_by, timestamp)
  SELECT 
    a.id,
    'start',
    5 + (random() * 10)::integer, -- 5-15 minutes
    (200 + random() * 300)::integer, -- 200-500ml
    CASE WHEN random() > 0.5 THEN 'schedule' ELSE 'automation' END,
    NOW() - INTERVAL '1 hour' * generate_series(1, 8, 3) -- Every 3 hours for last 24h
  FROM public.actuators a
  WHERE a.user_id = user_id_param;

  -- Insert sample crops (simplified for MVP)
  INSERT INTO public.crops (name, variety, planted_date, expected_harvest_date, area_size, field_location, status, user_id) VALUES
    ('Tomatoes', 'Cherry Tomatoes', '2024-01-15', '2024-04-15', 2.5, 'Zone 1', 'growing', user_id_param),
    ('Lettuce', 'Romaine', '2024-02-01', '2024-03-15', 1.0, 'Zone 2', 'growing', user_id_param);

  -- Insert sample irrigation schedules for MVP setup
  INSERT INTO public.irrigation_schedules (zone_name, start_time, duration_minutes, frequency_days, is_active, user_id, crop_id) 
  SELECT 
    'Zone ' || (ROW_NUMBER() OVER ()),
    ('08:00:00'::time + INTERVAL '2 hour' * (ROW_NUMBER() OVER () - 1)),
    15 + (ROW_NUMBER() OVER () * 5), -- 15-20 minutes
    2, -- Every 2 days
    true,
    user_id_param,
    c.id
  FROM public.crops c 
  WHERE c.user_id = user_id_param;

  -- Insert relevant AI recommendations for MVP
  INSERT INTO public.ai_recommendations (title, description, type, priority, confidence, estimated_impact, user_id) VALUES
    ('Zone 1 Irrigation Optimization', 'Soil moisture in Zone 1 is consistently low. Consider increasing irrigation frequency for optimal tomato growth.', 'irrigation', 'high', 0.87, 'High - Expected 20% yield increase', user_id_param),
    ('Water Tank Refill Alert', 'Water tank level is below 40%. Schedule a refill to ensure continuous irrigation capability.', 'maintenance', 'medium', 0.95, 'Medium - Prevent irrigation disruption', user_id_param),
    ('Pump Efficiency Check', 'Water Pump 2 showing slightly reduced flow rate. Consider maintenance check to optimize performance.', 'maintenance', 'low', 0.72, 'Low - Maintain optimal efficiency', user_id_param);
END;
$function$