import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Consultation {
  id: string;
  appointment_date: string;
  notes: string;
  status: string;
  price_hbar: number;
  patient?: {
    full_name: string;
    wallet_address: string | null;
  };
}

interface ConsultationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultation: Consultation | null;
  onStartSession?: () => void;
}

export const ConsultationDetailsDialog = ({
  open,
  onOpenChange,
  consultation,
  onStartSession,
}: ConsultationDetailsDialogProps) => {
  if (!consultation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Consultation Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Patient</h4>
            <p className="text-muted-foreground">{consultation.patient?.full_name || "Unknown"}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Date & Time</h4>
            <p className="text-muted-foreground">
              {format(new Date(consultation.appointment_date), "PPP 'at' p")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Reason for Consultation</h4>
            <p className="text-muted-foreground">{consultation.notes || "No notes provided"}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Status</h4>
            <p className="text-muted-foreground capitalize">{consultation.status}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Fee</h4>
            <p className="text-muted-foreground">{consultation.price_hbar} HBAR</p>
          </div>
          {consultation.patient?.wallet_address && (
            <div>
              <h4 className="font-semibold mb-1">Patient Wallet</h4>
              <p className="text-muted-foreground text-sm">{consultation.patient.wallet_address}</p>
            </div>
          )}
          {consultation.status === "pending" && onStartSession && (
            <Button onClick={onStartSession} className="w-full">
              Start Session
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
