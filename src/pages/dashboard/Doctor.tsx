import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, CheckCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { DoctorAvailabilityCalendar } from "@/components/doctor/DoctorAvailabilityCalendar";
import { DoctorWalletConnection } from "@/components/doctor/DoctorWalletConnection";
import { ConsultationDetailsDialog } from "@/components/doctor/ConsultationDetailsDialog";
import { format } from "date-fns";

interface Consultation {
  id: string;
  appointment_date: string;
  notes: string;
  status: string;
  price_hbar: number;
  patient: {
    full_name: string;
    wallet_address: string | null;
  };
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    upcomingToday: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchConsultations();
    }
  }, [profile]);

  const fetchConsultations = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:profiles!consultations_patient_id_fkey(full_name, wallet_address)
        `)
        .eq("doctor_id", profile.id)
        .order("appointment_date", { ascending: true });

      if (error) throw error;

      setConsultations(data || []);
      
      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const upcomingToday = data?.filter(c => {
        const appointmentDate = new Date(c.appointment_date);
        return appointmentDate >= today && appointmentDate < tomorrow && c.status === "pending";
      }).length || 0;

      const completed = data?.filter(c => c.status === "completed").length || 0;
      const uniquePatients = new Set(data?.map(c => c.patient_id)).size;
      const totalEarnings = data
        ?.filter(c => c.status === "completed")
        .reduce((sum, c) => sum + Number(c.price_hbar), 0) || 0;

      setStats({
        totalPatients: uniquePatients,
        upcomingToday,
        completed,
        earnings: totalEarnings,
      });
    } catch (error) {
      console.error("Error fetching consultations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch consultations",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "confirmed" })
        .eq("id", consultationId);

      if (error) throw error;

      toast({
        title: "Session Started",
        description: "Consultation session has begun",
      });

      fetchConsultations();
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDetailsDialogOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  const todaysConsultations = consultations.filter(c => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const appointmentDate = new Date(c.appointment_date);
    return appointmentDate >= today && appointmentDate < tomorrow;
  });

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Manage your consultations and earnings</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Patients
              </CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground mt-1">Active patients</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
              <Calendar className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.upcomingToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled today</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Total consultations</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Earnings
              </CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.earnings.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">HBAR total</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysConsultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments scheduled for today
                </div>
              ) : (
                todaysConsultations.map((consultation) => (
                  <div key={consultation.id} className="glass-card p-6 rounded-xl flex items-center justify-between hover-lift">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{consultation.patient.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(consultation.appointment_date), "p")} • {consultation.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {consultation.status === "pending" && (
                        <Button 
                          variant="hero" 
                          size="sm"
                          onClick={() => handleStartSession(consultation.id)}
                        >
                          Start Session
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(consultation)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Availability & Wallet */}
          <div className="space-y-6">
            <DoctorAvailabilityCalendar doctorId={profile?.id || ""} />
            <DoctorWalletConnection 
              doctorProfileId={profile?.id || ""} 
              currentWallet={profile?.wallet_address}
            />
          </div>
        </div>

        <ConsultationDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          consultation={selectedConsultation}
          onStartSession={() => selectedConsultation && handleStartSession(selectedConsultation.id)}
        />
      </div>
    </div>
  );
};

export default DoctorDashboard;
