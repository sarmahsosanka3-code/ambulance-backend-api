import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Phone, Trash2, Eye, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPatients, deletePatient, Patient } from "@/lib/api/patients";

export default function ViewPatients() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.first_name.toLowerCase().includes(search.toLowerCase()) ||
      p.last_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id);
      setPatients(patients.filter((p) => p.id !== id));
      toast({
        title: "Patient Deleted",
        description: "Patient record has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Patients</h1>
              <p className="text-xs text-muted-foreground">{patients.length} registered patients</p>
            </div>
          </div>
          <Link to="/register-patient">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? "No patients match your search" : "No patients registered yet"}
            </p>
            {!search && (
              <Link to="/register-patient">
                <Button className="mt-4">Register First Patient</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-xs text-muted-foreground">{patient.patient_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewPatient(patient)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(patient.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  {patient.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patient.phone}
                    </span>
                  )}
                  {patient.blood_group && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                      {patient.blood_group}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patient Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Patient Dialog */}
      <Dialog open={!!viewPatient} onOpenChange={() => setViewPatient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {viewPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{viewPatient.patient_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{viewPatient.first_name} {viewPatient.last_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{viewPatient.gender || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{viewPatient.date_of_birth || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewPatient.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewPatient.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{viewPatient.blood_group || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">{viewPatient.emergency_contact_name || "-"}</p>
                  <p className="text-xs">{viewPatient.emergency_contact_phone || ""}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Address</p>
                <p className="font-medium text-sm">
                  {[viewPatient.address, viewPatient.city, viewPatient.state, viewPatient.pincode]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
              {viewPatient.medical_history && (
                <div>
                  <p className="text-muted-foreground text-sm">Medical History</p>
                  <p className="text-sm">{viewPatient.medical_history}</p>
                </div>
              )}
              {viewPatient.allergies && (
                <div>
                  <p className="text-muted-foreground text-sm">Allergies</p>
                  <p className="text-sm">{viewPatient.allergies}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
