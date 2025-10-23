import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DoctorAvailabilityCalendarProps {
  doctorId: string;
}

export const DoctorAvailabilityCalendar = ({ doctorId }: DoctorAvailabilityCalendarProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateExists = selectedDates.some(
      d => d.toDateString() === date.toDateString()
    );

    if (dateExists) {
      setSelectedDates(selectedDates.filter(
        d => d.toDateString() !== date.toDateString()
      ));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const saveAvailability = () => {
    // This would save to database in a real implementation
    toast({
      title: "Availability Updated",
      description: `${selectedDates.length} dates marked as available`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>Select dates when you'll be available for consultations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Calendar
          mode="single"
          selected={selectedDates[0]}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
        <div className="text-sm text-muted-foreground">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
        </div>
        <Button onClick={saveAvailability} className="w-full">
          Save Availability
        </Button>
      </CardContent>
    </Card>
  );
};
