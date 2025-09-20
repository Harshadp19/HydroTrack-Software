-- Create demo and guest user accounts with sample data
-- First, let's create some sample profiles (these will be created automatically via trigger when users sign up)

-- Insert sample sensor data for demo purposes
INSERT INTO public.sensors (name, type, location, status, user_id) VALUES
  ('Soil Moisture Sensor 1', 'soil_moisture', 'Field A - Zone 1', 'active', '00000000-0000-0000-0000-000000000001'),
  ('Temperature Sensor 1', 'temperature', 'Field A - Zone 1', 'active', '00000000-0000-0000-0000-000000000001'),
  ('pH Sensor 1', 'ph', 'Field A - Zone 2', 'active', '00000000-0000-0000-0000-000000000001'),
  ('Humidity Sensor 1', 'humidity', 'Field B - Zone 1', 'active', '00000000-0000-0000-0000-000000000001'),
  ('Light Sensor 1', 'light', 'Greenhouse 1', 'active', '00000000-0000-0000-0000-000000000001');

-- Insert sample crops for demo user
INSERT INTO public.crops (name, variety, planted_date, expected_harvest_date, area_size, field_location, status, user_id) VALUES
  ('Tomatoes', 'Cherry Tomatoes', '2024-01-15', '2024-04-15', 2.5, 'Field A', 'growing', '00000000-0000-0000-0000-000000000001'),
  ('Lettuce', 'Romaine', '2024-02-01', '2024-03-15', 1.0, 'Field B', 'growing', '00000000-0000-0000-0000-000000000001'),
  ('Carrots', 'Purple Haze', '2024-01-20', '2024-05-20', 1.5, 'Field C', 'growing', '00000000-0000-0000-0000-000000000001'),
  ('Basil', 'Sweet Basil', '2024-02-10', '2024-04-10', 0.5, 'Greenhouse 1', 'growing', '00000000-0000-0000-0000-000000000001');

-- Insert some sample sensor readings (last 24 hours)
INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp) 
SELECT 
  s.id,
  CASE 
    WHEN s.type = 'soil_moisture' THEN random() * 40 + 30  -- 30-70%
    WHEN s.type = 'temperature' THEN random() * 15 + 20   -- 20-35°C
    WHEN s.type = 'ph' THEN random() * 2 + 6              -- 6-8 pH
    WHEN s.type = 'humidity' THEN random() * 30 + 50      -- 50-80%
    WHEN s.type = 'light' THEN random() * 500 + 200       -- 200-700 lux
  END,
  CASE 
    WHEN s.type = 'soil_moisture' THEN '%'
    WHEN s.type = 'temperature' THEN '°C'
    WHEN s.type = 'ph' THEN 'pH'
    WHEN s.type = 'humidity' THEN '%'
    WHEN s.type = 'light' THEN 'lux'
  END,
  NOW() - INTERVAL '1 hour' * generate_series(0, 23)
FROM public.sensors s
WHERE s.user_id = '00000000-0000-0000-0000-000000000001';

-- Insert sample irrigation schedules
INSERT INTO public.irrigation_schedules (zone_name, start_time, duration_minutes, frequency_days, is_active, user_id, crop_id) 
SELECT 
  'Zone ' || (ROW_NUMBER() OVER ()),
  ('08:00:00'::time + INTERVAL '1 hour' * (ROW_NUMBER() OVER () - 1)),
  30 + (ROW_NUMBER() OVER () * 10),
  CASE WHEN ROW_NUMBER() OVER () % 2 = 0 THEN 2 ELSE 3 END,
  true,
  '00000000-0000-0000-0000-000000000001',
  c.id
FROM public.crops c 
WHERE c.user_id = '00000000-0000-0000-0000-000000000001';

-- Insert sample AI recommendations
INSERT INTO public.ai_recommendations (title, description, type, priority, confidence, estimated_impact, user_id) VALUES
  ('Increase Irrigation Frequency', 'Soil moisture levels are consistently below optimal range. Consider increasing irrigation frequency for tomato field.', 'irrigation', 'high', 0.85, 'High - Expected 15% yield increase', '00000000-0000-0000-0000-000000000001'),
  ('pH Adjustment Needed', 'pH levels in Field A are trending acidic. Apply lime to raise pH to optimal range of 6.5-7.0.', 'soil_management', 'medium', 0.92, 'Medium - Improved nutrient uptake', '00000000-0000-0000-0000-000000000001'),
  ('Pest Risk Alert', 'Weather conditions favorable for aphid infestation. Consider preventive measures for lettuce crop.', 'pest_control', 'high', 0.78, 'High - Prevent potential 25% crop loss', '00000000-0000-0000-0000-000000000001'),
  ('Harvest Window Optimization', 'Carrot crop showing signs of maturity. Optimal harvest window opens in 3-5 days.', 'harvest', 'low', 0.89, 'Medium - Maximize market value', '00000000-0000-0000-0000-000000000001'),
  ('Nutrient Deficiency Detection', 'Basil plants showing signs of nitrogen deficiency. Consider organic fertilizer application.', 'fertilization', 'medium', 0.81, 'Medium - Restore plant health', '00000000-0000-0000-0000-000000000001');

-- Add some guest user data as well (we'll use a different user ID for guest)
INSERT INTO public.sensors (name, type, location, status, user_id) VALUES
  ('Basic Soil Sensor', 'soil_moisture', 'Demo Field', 'active', '00000000-0000-0000-0000-000000000002'),
  ('Weather Station', 'temperature', 'Demo Field', 'active', '00000000-0000-0000-0000-000000000002');

INSERT INTO public.crops (name, variety, planted_date, expected_harvest_date, area_size, field_location, status, user_id) VALUES
  ('Demo Crop', 'Mixed Vegetables', '2024-02-01', '2024-05-01', 1.0, 'Demo Field', 'growing', '00000000-0000-0000-0000-000000000002');

-- Add sample readings for guest sensors too
INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp) 
SELECT 
  s.id,
  CASE 
    WHEN s.type = 'soil_moisture' THEN random() * 40 + 30
    WHEN s.type = 'temperature' THEN random() * 15 + 20
  END,
  CASE 
    WHEN s.type = 'soil_moisture' THEN '%'
    WHEN s.type = 'temperature' THEN '°C'
  END,
  NOW() - INTERVAL '1 hour' * generate_series(0, 11)
FROM public.sensors s
WHERE s.user_id = '00000000-0000-0000-0000-000000000002';