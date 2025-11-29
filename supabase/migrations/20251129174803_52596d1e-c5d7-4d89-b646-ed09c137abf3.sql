-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.patient_id := 'PAT-' || LPAD(nextval('patient_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_booking_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_id := 'AMB-' || LPAD(nextval('booking_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_prescription_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.prescription_id := 'RX-' || LPAD(nextval('prescription_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_appointment_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.appointment_id := 'APT-' || LPAD(nextval('appointment_id_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;