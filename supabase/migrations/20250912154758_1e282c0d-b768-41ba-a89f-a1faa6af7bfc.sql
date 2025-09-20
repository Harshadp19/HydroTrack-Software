-- Create tables for smart agriculture system

-- Sensor data table for environmental monitoring
CREATE TABLE public.sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'soil_moisture', 'temperature', 'humidity', 'ph', 'light'
  location TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sensor readings table
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planted_date DATE,
  expected_harvest_date DATE,
  field_location TEXT,
  area_size DECIMAL, -- in hectares or acres
  status TEXT DEFAULT 'growing', -- 'planted', 'growing', 'harvested'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Irrigation schedules and controls
CREATE TABLE public.irrigation_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  zone_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  frequency_days INTEGER NOT NULL, -- every X days
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'irrigation', 'fertilizer', 'pest_control', 'harvest'
  priority TEXT NOT NULL, -- 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 100),
  estimated_impact TEXT,
  is_read BOOLEAN DEFAULT false,
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  farm_name TEXT,
  location TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific data access
-- Sensors policies
CREATE POLICY "Users can view their own sensors" ON public.sensors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sensors" ON public.sensors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sensors" ON public.sensors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sensors" ON public.sensors FOR DELETE USING (auth.uid() = user_id);

-- Sensor readings policies
CREATE POLICY "Users can view readings from their sensors" ON public.sensor_readings 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sensors 
    WHERE sensors.id = sensor_readings.sensor_id AND sensors.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create readings for their sensors" ON public.sensor_readings 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sensors 
    WHERE sensors.id = sensor_readings.sensor_id AND sensors.user_id = auth.uid()
  )
);

-- Crops policies
CREATE POLICY "Users can view their own crops" ON public.crops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own crops" ON public.crops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own crops" ON public.crops FOR DELETE USING (auth.uid() = user_id);

-- Irrigation schedules policies
CREATE POLICY "Users can view their own irrigation schedules" ON public.irrigation_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own irrigation schedules" ON public.irrigation_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own irrigation schedules" ON public.irrigation_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own irrigation schedules" ON public.irrigation_schedules FOR DELETE USING (auth.uid() = user_id);

-- AI recommendations policies
CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recommendations" ON public.ai_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON public.ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recommendations" ON public.ai_recommendations FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_sensors_user_id ON public.sensors(user_id);
CREATE INDEX idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX idx_crops_user_id ON public.crops(user_id);
CREATE INDEX idx_irrigation_schedules_user_id ON public.irrigation_schedules(user_id);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_created_at ON public.ai_recommendations(created_at DESC);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Create trigger functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON public.sensors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_irrigation_schedules_updated_at BEFORE UPDATE ON public.irrigation_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_recommendations_updated_at BEFORE UPDATE ON public.ai_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();