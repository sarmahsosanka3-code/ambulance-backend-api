import { supabase } from "@/integrations/supabase/client";

export interface Appointment {
  id: string;
  appointment_id: string;
  patient_id: string | null;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  department: string | null;
  reason: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentData {
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  department?: string;
  reason?: string;
  notes?: string;
}

export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patients (
        first_name,
        last_name,
        patient_id,
        phone
      )
    `)
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return data as (Appointment & { patients: { first_name: string; last_name: string; patient_id: string; phone: string | null } | null })[];
}

export async function getAppointmentById(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patients (
        first_name,
        last_name,
        patient_id,
        phone
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as (Appointment & { patients: { first_name: string; last_name: string; patient_id: string; phone: string | null } | null }) | null;
}

export async function createAppointment(appointmentData: CreateAppointmentData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...appointmentData,
      appointment_id: `APT-${Date.now()}`, // Temporary, will be replaced by trigger
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function updateAppointment(id: string, appointmentData: Partial<CreateAppointmentData>) {
  const { data, error } = await supabase
    .from("appointments")
    .update(appointmentData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Appointment;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getTodayAppointments() {
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patients (
        first_name,
        last_name,
        patient_id,
        phone
      )
    `)
    .eq("appointment_date", today)
    .order("appointment_time", { ascending: true });

  if (error) throw error;
  return data as (Appointment & { patients: { first_name: string; last_name: string; patient_id: string; phone: string | null } | null })[];
}
