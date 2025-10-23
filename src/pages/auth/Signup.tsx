import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserCircle, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    specialization: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (role === "doctor" && !formData.specialization) {
      toast.error("Please enter your specialization");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
            specialization: role === "doctor" ? formData.specialization : null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created successfully!");
        navigate(role === "patient" ? "/dashboard/patient" : "/dashboard/doctor");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Join MedChain</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a:</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "patient" | "doctor")}>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="patient"
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${
                      role === "patient" 
                        ? "border-primary bg-primary-light shadow-soft" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="patient" id="patient" className="sr-only" />
                    <UserCircle className={`w-8 h-8 ${role === "patient" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold">Patient</span>
                  </label>

                  <label
                    htmlFor="doctor"
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-smooth ${
                      role === "doctor" 
                        ? "border-primary bg-primary-light shadow-soft" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="doctor" id="doctor" className="sr-only" />
                    <Stethoscope className={`w-8 h-8 ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold">Doctor</span>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input 
                  id="fullname" 
                  placeholder="Dr. Jane Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              {role === "doctor" && (
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input 
                    id="specialization" 
                    placeholder="e.g., Cardiology"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required={role === "doctor"}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
