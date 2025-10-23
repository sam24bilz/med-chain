import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

export function SeedDoctorsButton({ onSeeded }: { onSeeded: () => void }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-doctors');

      if (error) throw error;

      toast({
        title: "Doctors Added",
        description: data.message || "Demo doctors have been created successfully",
      });

      onSeeded();
    } catch (error: any) {
      console.error("Seeding error:", error);
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to create demo doctors",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={isSeeding}
      variant="outline"
      size="sm"
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isSeeding ? "Adding Doctors..." : "Add Demo Doctors"}
    </Button>
  );
}
