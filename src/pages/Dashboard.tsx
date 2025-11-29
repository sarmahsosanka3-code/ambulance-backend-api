import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Ambulance,
  Users,
  ClipboardList,
  Calendar,
  Activity,
  Plus,
  LogOut,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatients } from "@/lib/api/patients";
import { getBookings, subscribeToBookings } from "@/lib/api/ambulance";
import { getTodayAppointments } from "@/lib/api/appointments";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeBookings: 0,
    todayAppointments: 0,
    pendingEmergencies: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [patients, bookings, appointments] = await Promise.all([
          getPatients(),
          getBookings(),
          getTodayAppointments(),
        ]);

        setStats({
          totalPatients: patients.length,
          activeBookings: bookings.filter((b) => b.status !== "completed" && b.status !== "cancelled").length,
          todayAppointments: appointments.length,
          pendingEmergencies: bookings.filter((b) => b.status === "pending" && b.dispatch_type === "Emergency").length,
        });

        setRecentBookings(bookings.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Subscribe to real-time booking updates
    const unsubscribe = subscribeToBookings(() => {
      loadData();
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const quickActions = [
    { icon: Users, label: "Register Patient", href: "/register-patient", color: "bg-blue-500" },
    { icon: Ambulance, label: "Book Ambulance", href: "/ambulance", color: "bg-red-500" },
    { icon: ClipboardList, label: "New Prescription", href: "/new-prescription", color: "bg-green-500" },
    { icon: Calendar, label: "Schedule Appointment", href: "/schedule-appointment", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Ambulance className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Emergency Ambulance</h1>
              <p className="text-xs text-muted-foreground">Hospital Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Registered patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
              <Ambulance className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBookings}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3 text-blue-500" />
                Ambulance requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayAppointments}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-purple-500" />
                Scheduled today
              </p>
            </CardContent>
          </Card>

          <Card className={stats.pendingEmergencies > 0 ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Emergencies</CardTitle>
              <AlertCircle className={`h-4 w-4 ${stats.pendingEmergencies > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.pendingEmergencies > 0 ? "text-red-600" : ""}`}>
                {stats.pendingEmergencies}
              </div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">Click to open</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Ambulance Bookings */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Ambulance Bookings</CardTitle>
              <Link to="/ambulance">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Booking
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.booking_id} • {booking.phone_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                        booking.status === "dispatched" ? "bg-purple-100 text-purple-800" :
                        booking.status === "completed" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/view-patients" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View All Patients
                  </Button>
                </Link>
                <Link to="/view-prescriptions" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View All Prescriptions
                  </Button>
                </Link>
                <Link to="/view-appointments" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Appointments
                  </Button>
                </Link>
                <Link to="/settings" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Activity className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
