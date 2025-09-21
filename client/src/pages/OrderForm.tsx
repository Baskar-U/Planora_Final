import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { firebaseService } from "@/lib/firebaseService";
import { addDoc, collection } from "firebase/firestore";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  guestCount: z.coerce.number().min(1, "Guest count is required"),
  budget: z.coerce.number().min(1000, "Budget must be at least ₹1,000"),
  eventDescription: z.string().min(20, "Description must be at least 20 characters"),
  additionalRequirements: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const eventTypes = {
  wedding: {
    name: "Wedding",
    icon: "💒",
    description: "Make your special day unforgettable",
    color: "bg-rose-100 text-rose-800"
  },
  birthday: {
    name: "Birthday",
    icon: "🎂",
    description: "Celebrate in style",
    color: "bg-purple-100 text-purple-800"
  },
  concert: {
    name: "Concert",
    icon: "🎵",
    description: "Amplify your event",
    color: "bg-blue-100 text-blue-800"
  },
  corporate: {
    name: "Corporate Event",
    icon: "🏢",
    description: "Professional and polished",
    color: "bg-slate-100 text-slate-800"
  },
  anniversary: {
    name: "Anniversary",
    icon: "💕",
    description: "Celebrate your journey together",
    color: "bg-pink-100 text-pink-800"
  },
  graduation: {
    name: "Graduation",
    icon: "🎓",
    description: "Mark this achievement",
    color: "bg-green-100 text-green-800"
  },
  babyshower: {
    name: "Baby Shower",
    icon: "👶",
    description: "Welcome the little one",
    color: "bg-yellow-100 text-yellow-800"
  },
  conference: {
    name: "Conference",
    icon: "🎤",
    description: "Knowledge sharing events",
    color: "bg-indigo-100 text-indigo-800"
  },
  seminar: {
    name: "Seminar",
    icon: "📚",
    description: "Educational gatherings",
    color: "bg-cyan-100 text-cyan-800"
  },
  engagement: {
    name: "Engagement",
    icon: "💍",
    description: "Begin your journey together",
    color: "bg-orange-100 text-orange-800"
  },
  reception: {
    name: "Reception",
    icon: "🍾",
    description: "Celebrate with loved ones",
    color: "bg-red-100 text-red-800"
  },
  party: {
    name: "Party",
    icon: "🎉",
    description: "Any celebration",
    color: "bg-emerald-100 text-emerald-800"
  }
};

export default function OrderForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get event type from URL
  const pathParts = window.location.pathname.split('/');
  const eventType = pathParts[pathParts.length - 1] as keyof typeof eventTypes;
  const eventInfo = eventTypes[eventType] || eventTypes.party;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      eventDate: "",
      eventLocation: "",
      guestCount: 0,
      budget: 0,
      eventDescription: "",
      additionalRequirements: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: OrderFormData) => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      // Create individual event request instead of regular order
      const individualEventRequest = {
        requestId: `IEV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customerId: auth.currentUser.uid,
        customerName: orderData.customerName,
        customerEmail: orderData.email,
        customerPhone: orderData.phone,
        eventType: eventType,
        eventDate: orderData.eventDate,
        eventLocation: orderData.eventLocation,
        guestCount: orderData.guestCount,
        budget: orderData.budget,
        eventDescription: orderData.eventDescription,
        additionalRequirements: orderData.additionalRequirements || "",
        status: "pending",
        assignedCoordinator: null,
        coordinatorNotes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to individualEventsRequests collection
      const docRef = await addDoc(collection(db, "individualEventsRequests"), individualEventRequest);
      
      return {
        ...individualEventRequest,
        id: docRef.id
      };
    },
    onSuccess: (data) => {
      setOrderId(data.requestId);
      setShowSuccess(true);
      toast({
        title: "Request Submitted Successfully!",
        description: "Our event coordinators will connect with you shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    createOrderMutation.mutate(data);
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (showSuccess && orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Congratulations!
              </CardTitle>
              <p className="text-gray-600">
                Your request has been submitted successfully. Our event coordinators will connect with you shortly.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Request ID:</strong> {orderId}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Use this ID to track your request status
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={() => setLocation("/orders")} className="w-full">
                  View My Orders
                </Button>
                <Button variant="outline" onClick={handleBack} className="w-full">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">{eventInfo.icon}</span>
              <Badge className={`text-lg px-4 py-2 ${eventInfo.color}`}>
                {eventInfo.name}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request Quote for {eventInfo.name}
            </h1>
            <p className="text-lg text-gray-600">
              {eventInfo.description}
            </p>
          </div>
        </div>

        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Customer Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Event Details
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eventLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="guestCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Guests</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter number of guests" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Budget and Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Budget & Requirements
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (₹)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your budget" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your event requirements, theme, and any specific needs..."
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional requirements or special requests..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOrderMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {createOrderMutation.isPending ? "Submitting..." : "Submit Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
