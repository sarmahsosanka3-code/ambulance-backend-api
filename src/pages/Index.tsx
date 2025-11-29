import { Link } from "react-router-dom";
import { Ambulance, ArrowRight, Shield, Users, ClipboardList, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Users, title: "Patient Management", description: "Complete patient registration and medical records." },
  { icon: Ambulance, title: "Ambulance Booking", description: "Emergency and scheduled ambulance services." },
  { icon: ClipboardList, title: "Prescriptions", description: "Digital prescription management system." },
  { icon: Activity, title: "Appointments", description: "Schedule and manage patient appointments." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Ambulance className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Emergency Ambulance</span>
          </div>
          <div className="flex gap-2">
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Hospital Management & Emergency Ambulance System
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Streamline your healthcare operations with our comprehensive management system. 
              From patient registration to emergency ambulance dispatch.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Access Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="bg-card p-6 rounded-lg border border-border">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
