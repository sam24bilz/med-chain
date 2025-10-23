import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, FileText, Wallet, Stethoscope, Search, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BookingDialog } from "@/components/patient/BookingDialog";
import { SeedDoctorsButton } from "@/components/patient/SeedDoctorsButton";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string | null;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.specialization?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, specialization")
      .eq("role", "doctor")
      .order("full_name");

    if (error) {
      console.error("Error fetching doctors:", error);
      return;
    }

    setDoctors(data || []);
    setFilteredDoctors(data || []);
  };

  const handleBookNow = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingDialogOpen(true);
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Patient Dashboard</h1>
            <p className="text-muted-foreground">Manage your consultations and NFT passes</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Passes
              </CardTitle>
              <Wallet className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">NFT Consultation Passes</p>
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
              <div className="text-3xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">Scheduled Consultations</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                History
              </CardTitle>
              <FileText className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7</div>
              <p className="text-xs text-muted-foreground mt-1">Past Consultations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Doctor */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Book a Doctor</CardTitle>
                  <CardDescription>Find and book consultations with verified doctors</CardDescription>
                </div>
                <SeedDoctorsButton onSeeded={fetchDoctors} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">No doctors available yet</p>
                    <p className="text-sm text-muted-foreground">Click "Add Demo Doctors" above to populate sample doctors</p>
                  </div>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="glass-card p-6 rounded-xl flex items-center justify-between hover-lift"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
                          <Stethoscope className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doctor.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization || "General Practice"} • 150 HBAR
                          </p>
                        </div>
                      </div>
                      <Button variant="hero" onClick={() => handleBookNow(doctor)}>
                        Book Now
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* My NFT Passes */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>My NFT Passes</CardTitle>
              <CardDescription>Your consultation NFTs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="glass-card p-4 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Consultation Pass #1234</div>
                <div className="font-semibold">Dr. Sarah Johnson</div>
                <div className="text-sm text-muted-foreground mt-1">Oct 25, 2025</div>
              </div>
              
              <div className="glass-card p-4 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Consultation Pass #1235</div>
                <div className="font-semibold">Dr. Michael Chen</div>
                <div className="text-sm text-muted-foreground mt-1">Oct 28, 2025</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        doctor={selectedDoctor}
      />
    </div>
  );
};

export default PatientDashboard;
