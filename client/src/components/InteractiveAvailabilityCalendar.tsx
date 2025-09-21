import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface InteractiveAvailabilityCalendarProps {
  vendorId: string;
  vendorName: string;
  isVendor?: boolean;
  onSlotSelect?: (date: string, time: string, eventType: string) => void;
}

interface AvailabilitySlot {
  time: string;
  isBooked: boolean;
  eventType: string;
  bookedBy?: string;
}

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  reason?: string;
  slots: AvailabilitySlot[];
  maxEvents: number;
  bookedEvents: number;
}

interface VendorAvailability {
  vendorId: string;
  vendorName: string;
  year: number;
  month: number;
  availability: DayAvailability[];
  workingHours: {
    start: string;
    end: string;
    daysOfWeek: string[];
  };
  advanceBookingDays: number;
  minNoticeHours: number;
}

export default function InteractiveAvailabilityCalendar({
  vendorId,
  vendorName,
  isVendor = false,
  onSlotSelect
}: InteractiveAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showSlotDialog, setShowSlotDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendor availability data
  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ["vendorAvailability", vendorId, currentMonth.getFullYear(), currentMonth.getMonth() + 1],
    queryFn: async () => {
      const availabilityRef = collection(db, "vendorAvailability");
      const q = query(
        availabilityRef,
        where("vendorId", "==", vendorId),
        where("year", "==", currentMonth.getFullYear()),
        where("month", "==", currentMonth.getMonth() + 1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as VendorAvailability;
      }
      return null;
    },
    enabled: !!vendorId,
  });

  // Update availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      if (availabilityData) {
        // Update existing document
        const availabilityRef = collection(db, "vendorAvailability");
        const q = query(
          availabilityRef,
          where("vendorId", "==", vendorId),
          where("year", "==", currentMonth.getFullYear()),
          where("month", "==", currentMonth.getMonth() + 1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docRef = doc(db, "vendorAvailability", snapshot.docs[0].id);
          await updateDoc(docRef, data);
        }
      } else {
        // Create new document
        await addDoc(collection(db, "vendorAvailability"), {
          vendorId,
          vendorName,
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorAvailability", vendorId, currentMonth.getFullYear(), currentMonth.getMonth() + 1] });
      toast({
        title: "Availability updated successfully",
        description: "Your availability has been updated.",
      });
      setShowSlotDialog(false);
      setSelectedSlots([]);
      setAllSlots(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating availability",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get availability for a specific date
  const getDayAvailability = (date: Date): DayAvailability | null => {
    if (!availabilityData?.availability || !date || isNaN(date.getTime())) return null;
    
    const dateString = date.toISOString().split('T')[0];
    return availabilityData.availability.find(day => day.date === dateString) || null;
  };

  // Check if date is in the past
  const isPastDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is within advance booking limit
  const isWithinBookingLimit = (date: Date) => {
    if (!date || isNaN(date.getTime()) || !availabilityData?.advanceBookingDays) return true;
    
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + availabilityData.advanceBookingDays);
    
    return date <= maxDate;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isPastDate(date) || !date || isNaN(date.getTime())) return;
    
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    
    if (isVendor) {
      setShowSlotDialog(true);
    } else {
      setShowAvailabilityDialog(true);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 20; // 8 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Handle slot selection
  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  // Handle all slots toggle
  const handleAllSlotsToggle = (checked: boolean) => {
    setAllSlots(checked);
    if (checked) {
      setSelectedSlots(timeSlots);
    } else {
      setSelectedSlots([]);
    }
  };

  // Save availability
  const handleSaveAvailability = () => {
    const slotsToSave = allSlots ? timeSlots : selectedSlots;
    
    const newSlots: AvailabilitySlot[] = slotsToSave.map(time => ({
      time,
      isBooked: false,
      eventType: 'general'
    }));

    const existingAvailability = availabilityData?.availability || [];
    const updatedAvailability = existingAvailability.filter(day => day.date !== selectedDate);
    
    updatedAvailability.push({
      date: selectedDate,
      isAvailable: true,
      slots: newSlots,
      maxEvents: slotsToSave.length,
      bookedEvents: 0
    });

    updateAvailabilityMutation.mutate({
      availability: updatedAvailability,
      updatedAt: new Date()
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isVendor ? 'Set Availability' : 'Check Availability'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {isVendor 
            ? 'Click on dates to set your availability slots' 
            : 'Select a date to view available time slots'
          }
        </p>
      </CardHeader>
      <CardContent>
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date, index) => {
            const dayAvailability = getDayAvailability(date);
            const isPast = isPastDate(date);
            const isWithinLimit = isWithinBookingLimit(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isAvailable = dayAvailability?.isAvailable;
            
            return (
              <div
                key={index}
                className={`
                  p-2 min-h-[80px] border rounded-lg transition-colors cursor-pointer
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                  ${!isWithinLimit ? 'bg-yellow-50 text-yellow-600' : ''}
                  ${isAvailable && !isPast && isWithinLimit ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                  ${!isAvailable && !isPast && isWithinLimit ? 'bg-red-50 border-red-200' : ''}
                  ${selectedDate === date.toISOString().split('T')[0] ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-sm font-medium mb-1">
                  {date.getDate()}
                </div>
                
                {dayAvailability && (
                  <div className="space-y-1">
                    {dayAvailability.isAvailable ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">
                          {dayAvailability.bookedEvents}/{dayAvailability.maxEvents}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">
                          {dayAvailability.reason || 'Unavailable'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {!isWithinLimit && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs text-yellow-600">Advance limit</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Set Availability Dialog */}
        <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Availability for {selectedDate}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allSlots"
                  checked={allSlots}
                  onCheckedChange={handleAllSlotsToggle}
                />
                <Label htmlFor="allSlots">Select all time slots</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <div key={slot} className="flex items-center space-x-2">
                    <Checkbox
                      id={slot}
                      checked={selectedSlots.includes(slot)}
                      onCheckedChange={() => handleSlotToggle(slot)}
                      disabled={allSlots}
                    />
                    <Label htmlFor={slot} className="text-sm">
                      {formatTime(slot)}
                    </Label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={handleSaveAvailability}
                  disabled={updateAvailabilityMutation.isPending || selectedSlots.length === 0}
                >
                  {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
                </Button>
                <Button variant="outline" onClick={() => setShowSlotDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Availability Dialog */}
        <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Available Slots for {selectedDate}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {(() => {
                const dayAvailability = selectedDate ? getDayAvailability(new Date(selectedDate)) : null;
                
                if (!dayAvailability?.isAvailable) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                      <p>Not available on this date</p>
                      {dayAvailability?.reason && (
                        <p className="text-sm">{dayAvailability.reason}</p>
                      )}
                    </div>
                  );
                }

                if (!dayAvailability.slots || dayAvailability.slots.length === 0) {
                  return (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No time slots available</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {dayAvailability.slots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.isBooked ? "secondary" : "outline"}
                        disabled={slot.isBooked}
                        className="h-auto p-2 flex flex-col items-center gap-1"
                        onClick={() => {
                          if (!slot.isBooked && onSlotSelect) {
                            onSlotSelect(selectedDate, slot.time, slot.eventType);
                            setShowAvailabilityDialog(false);
                          }
                        }}
                      >
                        <Clock className="h-4 w-4" />
                        <span className="font-medium text-xs">{formatTime(slot.time)}</span>
                        {slot.isBooked && (
                          <span className="text-xs text-gray-500">Booked</span>
                        )}
                      </Button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

