import { supabase } from "@/integrations/supabase/client";

export interface AmbulanceBooking {
  id: string;
  booking_id: string;
  patient_name: string;
  patient_age: string | null;
  patient_gender: string | null;
  phone_number: string;
  problem_type: string | null;
  dispatch_type: string | null;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  pickup_address: string | null;
  destination_address: string | null;
  schedule_date: string | null;
  schedule_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  patient_name: string;
  patient_age?: string;
  patient_gender?: string;
  phone_number: string;
  problem_type?: string;
  dispatch_type?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_address?: string;
  destination_address?: string;
  schedule_date?: string;
  schedule_time?: string;
  notes?: string;
}

export async function getBookings() {
  const { data, error } = await supabase
    .from("ambulance_bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as AmbulanceBooking[];
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from("ambulance_bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as AmbulanceBooking | null;
}

export async function createBooking(bookingData: CreateBookingData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from("ambulance_bookings")
    .insert({
      ...bookingData,
      booking_id: `AMB-${Date.now()}`, // Temporary, will be replaced by trigger
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AmbulanceBooking;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("ambulance_bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AmbulanceBooking;
}

export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from("ambulance_bookings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Real-time subscription for booking updates
export function subscribeToBookings(callback: (booking: AmbulanceBooking) => void) {
  const channel = supabase
    .channel("ambulance_bookings_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ambulance_bookings",
      },
      (payload) => {
        callback(payload.new as AmbulanceBooking);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
