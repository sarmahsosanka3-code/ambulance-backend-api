import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ambulance, Phone, MapPin, ArrowLeft, Calendar, Clock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createBooking } from "@/lib/api/ambulance";

export default function AmbulanceBooking() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const [formData, setFormData] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "Male",
    phone_number: "",
    problem_type: "With oxygen",
    dispatch_type: "Emergency",
    schedule_date: "",
    schedule_time: "",
    pickup_address: "",
    destination_address: "",
    notes: "",
  });

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      setLocationStatus("processing");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus("success");
        },
        () => {
          setLocationStatus("error");
        }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const booking = await createBooking({
        ...formData,
        pickup_latitude: userLocation?.lat,
        pickup_longitude: userLocation?.lng,
        schedule_date: formData.dispatch_type === "Scheduled" ? formData.schedule_date : undefined,
        schedule_time: formData.dispatch_type === "Scheduled" ? formData.schedule_time : undefined,
      });

      toast({
        title: "Ambulance Booked Successfully",
        description: `Booking ID: ${booking.booking_id}`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book ambulance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500">
              <Ambulance className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Book Ambulance</h1>
              <p className="text-xs text-muted-foreground">Request emergency or scheduled service</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Patient Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name *</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_age">Age</Label>
                <Input
                  id="patient_age"
                  value={formData.patient_age}
                  onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.patient_gender}
                  onValueChange={(value) => setFormData({ ...formData, patient_gender: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Service Type</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ambulance Type</Label>
                <Select
                  value={formData.problem_type}
                  onValueChange={(value) => setFormData({ ...formData, problem_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="With oxygen">With Oxygen</SelectItem>
                    <SelectItem value="Without oxygen">Without Oxygen</SelectItem>
                    <SelectItem value="ICU ambulance">ICU Ambulance</SelectItem>
                    <SelectItem value="Dead body">Dead Body Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dispatch Type</Label>
                <RadioGroup
                  value={formData.dispatch_type}
                  onValueChange={(value) => setFormData({ ...formData, dispatch_type: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Emergency" id="emergency" />
                    <Label htmlFor="emergency" className="text-red-600 font-medium">Emergency</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Scheduled" id="scheduled" />
                    <Label htmlFor="scheduled">Scheduled</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {formData.dispatch_type === "Scheduled" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule_date">Date</Label>
                  <Input
                    id="schedule_date"
                    type="date"
                    value={formData.schedule_date}
                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule_time">Time</Label>
                  <Input
                    id="schedule_time"
                    type="time"
                    value={formData.schedule_time}
                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </h2>
            
            <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
              {locationStatus === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
              {locationStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
              <span className="text-sm">
                {locationStatus === "processing" && "Getting your location..."}
                {locationStatus === "success" && "Location detected"}
                {locationStatus === "error" && "Could not get location. Please enter address manually."}
                {locationStatus === "idle" && "Location detection unavailable"}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup_address">Pickup Address</Label>
              <Textarea
                id="pickup_address"
                value={formData.pickup_address}
                onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                placeholder="Enter full pickup address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_address">Destination (Hospital/Address)</Label>
              <Textarea
                id="destination_address"
                value={formData.destination_address}
                onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                placeholder="Enter destination address"
                rows={2}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about the patient or situation"
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className={`w-full ${formData.dispatch_type === "Emergency" ? "bg-red-600 hover:bg-red-700" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Ambulance className="h-4 w-4 mr-2" />
                {formData.dispatch_type === "Emergency" ? "Request Emergency Ambulance" : "Schedule Ambulance"}
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
