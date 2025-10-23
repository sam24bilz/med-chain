import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: {
    id: string;
    full_name: string;
    specialization: string | null;
  } | null;
}

export function BookingDialog({ open, onOpenChange, doctor }: BookingDialogProps) {
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();

  const connectHederaWallet = async () => {
    setIsConnectingWallet(true);
    try {
      if (!window.hashpack) {
        toast({
          title: "HashPack Not Found",
          description: "Please install HashPack wallet extension from hashpack.app",
          variant: "destructive",
        });
        setIsConnectingWallet(false);
        return;
      }

      const appMetadata = {
        name: "MediChain",
        description: "Healthcare consultation platform",
        icon: window.location.origin + "/favicon.ico"
      };

      await window.hashpack.connectToExtension();
      const pairingData = await window.hashpack.pairingRequest(appMetadata);
      
      if (pairingData && pairingData.accountIds && pairingData.accountIds.length > 0) {
        const accountId = pairingData.accountIds[0];
        setWalletAddress(accountId);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accountId}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "No accounts found in HashPack wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to HashPack wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleBooking = async () => {
    if (!appointmentDate || !reason || !walletAddress || !doctor || !profile) {
      toast({
        title: "Missing Information",
        description: "Please fill all fields and connect wallet",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("consultations")
        .insert({
          patient_id: profile.id,
          doctor_id: doctor.id,
          appointment_date: appointmentDate.toISOString(),
          notes: reason,
          price_hbar: 150,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Update wallet address in profile if not set
      if (!profile.wallet_address) {
        await supabase
          .from("profiles")
          .update({ wallet_address: walletAddress })
          .eq("id", profile.id);
      }

      toast({
        title: "Booking Submitted",
        description: "Your consultation request has been sent to the doctor",
      });

      onOpenChange(false);
      setAppointmentDate(undefined);
      setReason("");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Consultation</DialogTitle>
          <DialogDescription>
            Book a consultation with {doctor?.full_name} - {doctor?.specialization}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Appointment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !appointmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Consultation</Label>
            <Textarea
              id="reason"
              placeholder="Describe your symptoms or reason for visit..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>HBAR Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                placeholder="0.0.xxxxx or enter manually"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={connectHederaWallet}
                disabled={isConnectingWallet}
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnectingWallet ? "Connecting..." : "Connect"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Connect HashPack extension or enter wallet address manually
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Consultation Fee:</span>
              <span className="text-lg font-bold">150 HBAR</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

