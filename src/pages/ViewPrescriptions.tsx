import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Eye, Trash2, Search, Plus, Loader2 } from "lucide-react";
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
import { getPrescriptions, deletePrescription, Prescription, Medication } from "@/lib/api/prescriptions";

type PrescriptionWithPatient = Prescription & { 
  patients: { first_name: string; last_name: string; patient_id: string } | null 
};

export default function ViewPrescriptions() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithPatient[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewPrescription, setViewPrescription] = useState<PrescriptionWithPatient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.prescription_id.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      p.patients?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patients?.last_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePrescription(id);
      setPrescriptions(prescriptions.filter((p) => p.id !== id));
      toast({
        title: "Prescription Deleted",
        description: "Prescription has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete prescription",
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
              <h1 className="text-lg font-bold">Prescriptions</h1>
              <p className="text-xs text-muted-foreground">{prescriptions.length} prescriptions</p>
            </div>
          </div>
          <Link to="/new-prescription">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {search ? "No prescriptions match your search" : "No prescriptions created yet"}
            </p>
            {!search && (
              <Link to="/new-prescription">
                <Button className="mt-4">Create First Prescription</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary">{prescription.prescription_id}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium mt-1">
                      {prescription.patients 
                        ? `${prescription.patients.first_name} ${prescription.patients.last_name}`
                        : "Unknown Patient"
                      }
                    </p>
                    {prescription.diagnosis && (
                      <p className="text-sm text-muted-foreground mt-1">{prescription.diagnosis}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {prescription.medications.length} medication(s)
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewPrescription(prescription)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(prescription.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
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
            <AlertDialogTitle>Delete Prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this prescription.
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

      {/* View Prescription Dialog */}
      <Dialog open={!!viewPrescription} onOpenChange={() => setViewPrescription(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {viewPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Prescription ID</p>
                  <p className="font-medium">{viewPrescription.prescription_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {viewPrescription.patients 
                      ? `${viewPrescription.patients.first_name} ${viewPrescription.patients.last_name}`
                      : "-"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(viewPrescription.created_at).toLocaleDateString()}</p>
                </div>
                {viewPrescription.follow_up_date && (
                  <div>
                    <p className="text-muted-foreground">Follow-up</p>
                    <p className="font-medium">{viewPrescription.follow_up_date}</p>
                  </div>
                )}
              </div>
              
              {viewPrescription.diagnosis && (
                <div>
                  <p className="text-muted-foreground text-sm">Diagnosis</p>
                  <p className="text-sm">{viewPrescription.diagnosis}</p>
                </div>
              )}

              {viewPrescription.symptoms && (
                <div>
                  <p className="text-muted-foreground text-sm">Symptoms</p>
                  <p className="text-sm">{viewPrescription.symptoms}</p>
                </div>
              )}

              {viewPrescription.medications.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Medications</p>
                  <div className="space-y-2">
                    {viewPrescription.medications.map((med, i) => (
                      <div key={i} className="p-2 bg-muted rounded text-sm">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-muted-foreground">
                          {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewPrescription.instructions && (
                <div>
                  <p className="text-muted-foreground text-sm">Instructions</p>
                  <p className="text-sm">{viewPrescription.instructions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
