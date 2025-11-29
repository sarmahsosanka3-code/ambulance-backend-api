import { supabase } from "@/integrations/supabase/client";

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  blood_group: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientData {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  photo_url?: string;
}

export async function getPatients() {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Patient[];
}

export async function getPatientById(id: string) {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Patient | null;
}

export async function createPatient(patientData: CreatePatientData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...patientData,
      patient_id: `PAT-${Date.now()}`, // Temporary, will be replaced by trigger
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, patientData: Partial<CreatePatientData>) {
  const { data, error } = await supabase
    .from("patients")
    .update(patientData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Patient;
}

export async function deletePatient(id: string) {
  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
