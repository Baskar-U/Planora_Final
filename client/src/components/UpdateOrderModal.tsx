import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  Package,
  CheckCircle,
  XCircle
} from 'lucide-react';

const updateOrderSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  numberOfGuests: z.coerce.number().min(1, "Number of guests is required"),
  selectedTimeSlot: z.string().optional(),
  selectedPackages: z.array(z.any()).min(1, "At least one package must be selected"),
  selectedMeals: z.record(z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean()
  })).optional(),
  budget: z.coerce.number().min(0).optional(),
  notes: z.string().optional()
});

type UpdateOrderData = z.infer<typeof updateOrderSchema>;

interface UpdateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  vendor: any;
}

export default function UpdateOrderModal({ isOpen, onClose, order, vendor }: UpdateOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<{ [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } }>({});
  const [invoice, setInvoice] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateOrderData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      fullName: order?.customerName || '',
      email: order?.customerEmail || '',
      phone: order?.customerPhone || '',
      address: order?.customerAddress || '',
      eventDate: order?.eventDate || '',
      eventLocation: order?.eventLocation || '',
      eventDescription: order?.eventDescription || '',
      numberOfGuests: order?.numberOfGuests || 0,
      selectedTimeSlot: order?.selectedTimeSlot || '',
      budget: order?.budget || 0,
      notes: order?.notes || ''
    }
  });

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      form.reset({
        fullName: order.customerName || '',
        email: order.customerEmail || '',
        phone: order.customerPhone || '',
        address: order.customerAddress || '',
        eventDate: order.eventDate || '',
        eventLocation: order.eventLocation || '',
        eventDescription: order.eventDescription || '',
        numberOfGuests: order.numberOfGuests || 0,
        selectedTimeSlot: order.selectedTimeSlot || '',
        budget: order.budget || 0,
        notes: order.notes || ''
      });

      // Set selected packages and meals
      if (order.selectedPackages) {
        setSelectedPackages(order.selectedPackages);
        form.setValue('selectedPackages', order.selectedPackages);
      }
      
      if (order.selectedMeals) {
        setSelectedMeals(order.selectedMeals);
        form.setValue('selectedMeals', order.selectedMeals);
      }

      // Calculate initial invoice
      calculateInvoice();
    }
  }, [order, form]);

  // Calculate invoice based on selected packages and meals
  const calculateInvoice = () => {
    if (!selectedPackages.length) {
      setInvoice(null);
      return;
    }

    let subtotal = 0;
    const packageDetails: any[] = [];

    selectedPackages.forEach((pkg) => {
      let packageTotal = 0;
      
      // For catering packages with meals
      if (pkg.meals && selectedMeals[pkg.id]) {
        const selection = selectedMeals[pkg.id];
        
        if (selection.breakfast && pkg.meals.breakfast) {
          packageTotal += pkg.meals.breakfast.original || pkg.meals.breakfast.price || 0;
        }
        if (selection.lunch && pkg.meals.lunch) {
          packageTotal += pkg.meals.lunch.original || pkg.meals.lunch.price || 0;
        }
        if (selection.dinner && pkg.meals.dinner) {
          packageTotal += pkg.meals.dinner.original || pkg.meals.dinner.price || 0;
        }
      } else {
        // For non-catering packages
        const originalPrice = pkg.originalPrice || pkg.price || 0;
        const discount = pkg.discount || 0;
        packageTotal = originalPrice - (originalPrice * discount / 100);
      }

      subtotal += packageTotal;
      packageDetails.push({
        ...pkg,
        total: packageTotal
      });
    });

    const convenienceFee = Math.round(subtotal * 0.01);
    const total = subtotal + convenienceFee;

    setInvoice({
      subtotal,
      convenienceFee,
      total,
      packageDetails
    });
  };

  // Handle meal selection change
  const handleMealToggle = (packageId: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    const newSelectedMeals = {
      ...selectedMeals,
      [packageId]: {
        ...selectedMeals[packageId],
        [meal]: !selectedMeals[packageId]?.[meal]
      }
    };
    setSelectedMeals(newSelectedMeals);
    form.setValue('selectedMeals', newSelectedMeals);
    calculateInvoice();
  };

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (data: UpdateOrderData) => {
      const orderRef = doc(db, 'bookings', order.id);
      
      const updateData = {
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerAddress: data.address,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation,
        eventDescription: data.eventDescription,
        numberOfGuests: data.numberOfGuests,
        selectedTimeSlot: data.selectedTimeSlot,
        selectedPackages: data.selectedPackages,
        selectedMeals: data.selectedMeals,
        budget: data.budget,
        notes: data.notes,
        totalAmount: invoice?.total || 0,
        originalPrice: invoice?.subtotal || 0,
        convenienceFee: invoice?.convenienceFee || 0,
        updatedAt: serverTimestamp()
      };

      await updateDoc(orderRef, updateData);

      // Create notification for vendor about the update
      await addDoc(collection(db, 'notifications'), {
        userId: vendor.id,
        type: 'order_updated',
        title: 'Order Updated',
        message: `${data.fullName} has updated their order details. Please review the changes.`,
        data: {
          orderId: order.id,
          customerName: data.fullName,
          changes: Object.keys(updateData).filter(key => 
            updateData[key] !== order[key] && key !== 'updatedAt'
          )
        },
        isRead: false,
        createdAt: serverTimestamp()
      });

      return updateData;
    },
    onSuccess: () => {
      toast({
        title: "Order Updated Successfully",
        description: "The order has been updated and the vendor has been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorBookings'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update the order. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  const onSubmit = async (data: UpdateOrderData) => {
    setIsSubmitting(true);
    try {
      await updateOrderMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Order Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="Enter full name"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="Enter email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="Enter phone number"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  placeholder="Enter address"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  {...form.register('eventDate')}
                />
                {form.formState.errors.eventDate && (
                  <p className="text-sm text-red-600">{form.formState.errors.eventDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="selectedTimeSlot">Time Slot</Label>
                <Select onValueChange={(value) => form.setValue('selectedTimeSlot', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5 PM - 9 PM)</SelectItem>
                    <SelectItem value="full-day">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventLocation">Event Location *</Label>
                <Input
                  id="eventLocation"
                  {...form.register('eventLocation')}
                  placeholder="Enter event location"
                />
                {form.formState.errors.eventLocation && (
                  <p className="text-sm text-red-600">{form.formState.errors.eventLocation.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  {...form.register('numberOfGuests')}
                  placeholder="Enter number of guests"
                />
                {form.formState.errors.numberOfGuests && (
                  <p className="text-sm text-red-600">{form.formState.errors.numberOfGuests.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="eventDescription">Event Description *</Label>
                <Textarea
                  id="eventDescription"
                  {...form.register('eventDescription')}
                  placeholder="Describe your event"
                  rows={3}
                />
                {form.formState.errors.eventDescription && (
                  <p className="text-sm text-red-600">{form.formState.errors.eventDescription.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Packages */}
          {selectedPackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPackages.map((pkg, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{pkg.name || pkg.packageName}</h4>
                        {pkg.capacity && (
                          <Badge variant="outline">Capacity: {pkg.capacity} people</Badge>
                        )}
                      </div>
                      
                      {/* Meal Selection for Catering Packages */}
                      {pkg.meals && (
                        <div className="mt-3">
                          <Label className="text-sm font-medium">Select Meals:</Label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                            {['breakfast', 'lunch', 'dinner'].map((meal) => {
                              const mealData = pkg.meals[meal];
                              const isSelected = selectedMeals[pkg.id]?.[meal];
                              if (!mealData) return null;
                              
                              return (
                                <div key={meal} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${pkg.id}-${meal}`}
                                    checked={isSelected || false}
                                    onCheckedChange={() => handleMealToggle(pkg.id, meal)}
                                  />
                                  <Label htmlFor={`${pkg.id}-${meal}`} className="text-sm">
                                    {meal.charAt(0).toUpperCase() + meal.slice(1)} 
                                    (₹{mealData.original || mealData.price || 0})
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice */}
          {invoice && (
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee (1%):</span>
                    <span>₹{invoice.convenienceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...form.register('notes')}
                placeholder="Any additional notes or special requirements"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}




