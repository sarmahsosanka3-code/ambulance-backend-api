-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'doctor', 'staff', 'receptionist')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  blood_group TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ambulance_bookings table
CREATE TABLE public.ambulance_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age TEXT,
  patient_gender TEXT CHECK (patient_gender IN ('Male', 'Female', 'Other')),
  phone_number TEXT NOT NULL,
  problem_type TEXT CHECK (problem_type IN ('With oxygen', 'Without oxygen', 'ICU ambulance', 'Dead body')),
  dispatch_type TEXT CHECK (dispatch_type IN ('Emergency', 'Scheduled')),
  pickup_latitude DOUBLE PRECISION,
  pickup_longitude DOUBLE PRECISION,
  pickup_address TEXT,
  destination_address TEXT,
  schedule_date DATE,
  schedule_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dispatched', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_driver UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  diagnosis TEXT,
  symptoms TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id TEXT UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  department TEXT,
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients policies (authenticated users can manage patients)
CREATE POLICY "Authenticated users can view patients" ON public.patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete patients" ON public.patients
  FOR DELETE TO authenticated USING (true);

-- Ambulance bookings policies
CREATE POLICY "Authenticated users can view ambulance bookings" ON public.ambulance_bookings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create ambulance bookings" ON public.ambulance_bookings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ambulance bookings" ON public.ambulance_bookings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete ambulance bookings" ON public.ambulance_bookings
  FOR DELETE TO authenticated USING (true);

-- Prescriptions policies
CREATE POLICY "Authenticated users can view prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create prescriptions" ON public.prescriptions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update prescriptions" ON public.prescriptions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete prescriptions" ON public.prescriptions
  FOR DELETE TO authenticated USING (true);

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON public.appointments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete appointments" ON public.appointments
  FOR DELETE TO authenticated USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ambulance_bookings_updated_at
  BEFORE UPDATE ON public.ambulance_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate sequential IDs
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.patient_id := 'PAT-' || LPAD(nextval('patient_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1;

CREATE TRIGGER set_patient_id
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  WHEN (NEW.patient_id IS NULL)
  EXECUTE FUNCTION public.generate_patient_id();

-- Similar for bookings
CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_id := 'AMB-' || LPAD(nextval('booking_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_id_seq START 1;

CREATE TRIGGER set_booking_id
  BEFORE INSERT ON public.ambulance_bookings
  FOR EACH ROW
  WHEN (NEW.booking_id IS NULL)
  EXECUTE FUNCTION public.generate_booking_id();

-- Prescription ID
CREATE OR REPLACE FUNCTION public.generate_prescription_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prescription_id := 'RX-' || LPAD(nextval('prescription_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS prescription_id_seq START 1;

CREATE TRIGGER set_prescription_id
  BEFORE INSERT ON public.prescriptions
  FOR EACH ROW
  WHEN (NEW.prescription_id IS NULL)
  EXECUTE FUNCTION public.generate_prescription_id();

-- Appointment ID
CREATE OR REPLACE FUNCTION public.generate_appointment_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.appointment_id := 'APT-' || LPAD(nextval('appointment_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS appointment_id_seq START 1;

CREATE TRIGGER set_appointment_id
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  WHEN (NEW.appointment_id IS NULL)
  EXECUTE FUNCTION public.generate_appointment_id();

-- Enable realtime for bookings (useful for live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.ambulance_bookings;