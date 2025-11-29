import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  prescription_id: string;
  patient_id: string | null;
  doctor_id: string | null;
  diagnosis: string | null;
  symptoms: string | null;
  medications: Medication[];
  instructions: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePrescriptionData {
  patient_id: string;
  diagnosis?: string;
  symptoms?: string;
  medications?: Medication[];
  instructions?: string;
  follow_up_date?: string;
}

export async function getPrescriptions() {
  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patients (
        first_name,
        last_name,
        patient_id
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(p => ({
    ...p,
    medications: (p.medications as unknown as Medication[]) || []
  })) as (Prescription & { patients: { first_name: string; last_name: string; patient_id: string } | null })[];
}

export async function getPrescriptionById(id: string) {
  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patients (
        first_name,
        last_name,
        patient_id
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  
  return {
    ...data,
    medications: (data.medications as unknown as Medication[]) || []
  } as Prescription & { patients: { first_name: string; last_name: string; patient_id: string } | null };
}

export async function createPrescription(prescriptionData: CreatePrescriptionData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("prescriptions")
    .insert({
      ...prescriptionData,
      prescription_id: `RX-${Date.now()}`, // Temporary, will be replaced by trigger
      doctor_id: user?.id,
      medications: prescriptionData.medications as unknown as Json,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    medications: (data.medications as unknown as Medication[]) || []
  } as Prescription;
}

export async function updatePrescription(id: string, prescriptionData: Partial<CreatePrescriptionData>) {
  const { data, error } = await supabase
    .from("prescriptions")
    .update({
      ...prescriptionData,
      medications: prescriptionData.medications as unknown as Json,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    medications: (data.medications as unknown as Medication[]) || []
  } as Prescription;
}

export async function deletePrescription(id: string) {
  const { error } = await supabase
    .from("prescriptions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
