import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Calendar, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar as CalendarComponent } from "./calendar";
import { format } from "date-fns";

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function DateTimePicker({ value, onChange, placeholder, label }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(
    value ? format(new Date(value), "HH:mm") : "09:00"
  );

  // Generate time options in 15-minute increments
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = format(new Date(`2000-01-01T${timeString}`), "h:mm a");
      timeOptions.push({ value: timeString, label: displayTime });
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':');
      // Create a new date object with the selected date
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      
      // Create the final date in local timezone
      const finalDate = new Date(year, month, day, parseInt(hours), parseInt(minutes));
      
      // Format as local datetime string
      const isoString = finalDate.getFullYear() + '-' +
        String(finalDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(finalDate.getDate()).padStart(2, '0') + 'T' +
        String(finalDate.getHours()).padStart(2, '0') + ':' +
        String(finalDate.getMinutes()).padStart(2, '0');
      
      onChange(isoString);
    }
    setIsOpen(false);
  };

  const displayValue = value 
    ? format(new Date(value), "MMM dd, yyyy 'at' h:mm a")
    : "";

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            type="button"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {displayValue || placeholder || "Select date and time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Date</Label>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Time</Label>
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!selectedDate}
                type="button"
              >
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}