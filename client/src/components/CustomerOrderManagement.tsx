import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { firebaseService } from "@/lib/firebaseService";
import PaymentFormInline from "./PaymentFormInline";
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  CreditCard
} from "lucide-react";

const orderUpdateSchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  review: z.string().optional(),
});

type OrderUpdateData = z.infer<typeof orderUpdateSchema>;

interface Order {
  id: string;
  orderId: string;
  serviceName: string;
  vendorName: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  eventDate: string;
  eventLocation: string;
  eventDescription?: string;
  selectedTimeSlot?: string;
  numberOfGuests?: number;
  budget?: number;
  status: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: string;
  lastPayment?: {
    amount: number;
    transactionId: string;
    screenshotUrl: string;
    at: any;
  };
  paymentVerified?: boolean;
  notes?: string;
  rating?: number;
  review?: string;
  selectedPackages?: any[];
  selectedMeals?: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } };
  originalPrice?: number;
  negotiatedPrice?: number;
  userBudget?: number;
  convenienceFee?: number;
  isNegotiated?: boolean;
  finalSource?: 'actual' | 'negotiated' | 'budget';
  createdAt: any;
  updatedAt?: any;
}

export default function CustomerOrderManagement() {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  // Debug payment form state changes
  useEffect(() => {
    console.log('🔄 CustomerOrderManagement: Payment form state changed:', { 
      showPaymentForm, 
      selectedOrderId: selectedOrderForPayment?.id 
    });
  }, [showPaymentForm, selectedOrderForPayment]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const user = auth.currentUser;

  // Get meal selection summary for a package
  const getMealSummary = (order: Order, packageId: string) => {
    const selection = order.selectedMeals?.[packageId];
    if (!selection) return 'All meals';
    
    const selectedMeals = [];
    if (selection.breakfast) selectedMeals.push('Breakfast');
    if (selection.lunch) selectedMeals.push('Lunch');
    if (selection.dinner) selectedMeals.push('Dinner');
    
    return selectedMeals.length > 0 ? selectedMeals.join(', ') : 'No meals selected';
  };


  // Fetch customer orders (supports auth user or localStorage email)
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["customerOrders"],
    queryFn: () => firebaseService.getCustomerOrders(),
    refetchInterval: 10000,
  });

  // Debug orders data
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log('📊 CustomerOrderManagement: Orders data:', orders.map((order: any) => {
        const isFullyPaid = (order.remainingAmount || 0) <= 0 && (order.paidAmount || 0) > 0;
        return {
          id: order.id,
          orderId: order.orderId,
          serviceName: order.serviceName,
          totalAmount: order.totalAmount,
          paidAmount: order.paidAmount,
          remainingAmount: order.remainingAmount,
          paymentStatus: order.paymentStatus,
          selectedPackages: order.selectedPackages,
          selectedMeals: order.selectedMeals,
          originalPrice: order.originalPrice,
          negotiatedPrice: order.negotiatedPrice,
          userBudget: order.userBudget,
          convenienceFee: order.convenienceFee,
          isFullyPaid
        };
      }));
    }
  }, [orders]);

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: OrderUpdateData }) => {
      return firebaseService.updateCustomerOrder(orderId, data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Order updated successfully",
      });
      setIsUpdateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return firebaseService.updateCustomerOrder(orderId, { status: "cancelled" });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Order cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["customerOrders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const form = useForm<OrderUpdateData>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: "",
      notes: "",
      rating: 5,
      review: "",
    }
  });

  const handleUpdateOrder = (data: OrderUpdateData) => {
    if (updatingOrderId) {
      updateOrderMutation.mutate({ orderId: updatingOrderId, data });
    }
  };

  const handleReviewOrder = (data: OrderUpdateData) => {
    if (reviewingOrderId) {
      updateOrderMutation.mutate({ orderId: reviewingOrderId, data });
    }
  };

  const handleCancelOrder = (order: Order) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrderMutation.mutate(order.id);
    }
  };

  const PayDialog = ({ order }: { order: Order }) => {
    const hasRemainingAmount = (order.remainingAmount || 0) > 0;
    const hasPaidAmount = (order.paidAmount || 0) > 0;
    const isFullyPaid = (order.remainingAmount || 0) <= 0 && (order.paidAmount || 0) > 0;
    
    console.log('💳 PayDialog: Order payment status:', {
      orderId: order.id,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      remainingAmount: order.remainingAmount,
      hasRemainingAmount,
      hasPaidAmount,
      isFullyPaid
    });
    
    return (
      <>
        {isFullyPaid ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Payment Fully Completed</span>
          </div>
        ) : hasRemainingAmount ? (
          <Button 
            onClick={() => {
              console.log('💳 CustomerOrderManagement: Pay Remaining Amount button clicked for order:', order.id);
              setShowPaymentForm(true);
              setSelectedOrderForPayment(order);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Remaining Amount (₹{order.remainingAmount?.toLocaleString()})
          </Button>
        ) : (
          <Button 
            onClick={() => {
              console.log('💳 CustomerOrderManagement: Pay Amount button clicked for order:', order.id);
              setShowPaymentForm(true);
              setSelectedOrderForPayment(order);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Amount
          </Button>
        )}
      </>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "completed": return <Star className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = error.message || 'Unknown error occurred';
    const isIndexError = errorMessage.includes('index');
    
    return (
      <div className="text-center p-8">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading orders</h3>
          <p className="text-red-600 mb-4">{errorMessage}</p>
          
          {isIndexError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 mb-2">
                This error is due to a missing Firebase index. To fix this:
              </p>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                <li>Open the browser console (F12)</li>
                <li>Run the provided script to create the index</li>
                <li>Wait a few minutes for the index to build</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Manage and track all your service bookings</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = "/"}>
              Browse Services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order: Order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{order.serviceName}</h3>
                        <p className="text-gray-600">Order ID: {order.orderId}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{order.eventLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{order.selectedTimeSlot || "--"}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Total: ₹{(order.totalAmount || order.budget || 0).toLocaleString()}</span>
                        </div>
                        {(order.paidAmount || 0) > 0 && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle className="h-3 w-3" />
                            <span>Paid: ₹{order.paidAmount?.toLocaleString()}</span>
                          </div>
                        )}
                        {(order.remainingAmount || 0) > 0 && (order.remainingAmount || 0) < (order.totalAmount || 0) && (
                          <div className="flex items-center gap-2 text-orange-600 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>Remaining: ₹{order.remainingAmount?.toLocaleString()}</span>
                          </div>
                        )}
                          </div>
                    </div>

                    {/* Additional Order Details */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Package Details */}
                        <div>
                          <span className="font-medium text-gray-700">Selected Packages:</span>
                          <div className="mt-2 space-y-1">
                            {(order.selectedPackages || []).map((pkg: any, index: number) => {
                              const packageId = pkg.id || pkg.packageName || index.toString();
                              const mealSummary = getMealSummary(order, packageId);
                              return (
                                <div key={index} className="text-gray-600">
                                  • {pkg.name || pkg.packageName}
                                  {pkg.meals && (
                                    <span className="text-gray-500"> ({mealSummary})</span>
                                  )}
                                  {pkg.capacity && (
                                    <span className="text-gray-500"> - {pkg.capacity} people</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pricing Details */}
                        <div>
                          <span className="font-medium text-gray-700">Pricing Breakdown:</span>
                          <div className="mt-2 space-y-1">
                            {order.originalPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Original:</span>
                                <span>₹{order.originalPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {order.negotiatedPrice && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Negotiated:</span>
                                <span className="text-green-600">₹{order.negotiatedPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {order.userBudget && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Your Budget:</span>
                                <span className="text-purple-600">₹{order.userBudget.toLocaleString()}</span>
                              </div>
                            )}
                            {order.convenienceFee && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Convenience Fee:</span>
                                <span>₹{order.convenienceFee.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span className="text-gray-700">Final Total:</span>
                              <span className="text-blue-600">₹{(order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Event Description */}
                      {order.eventDescription && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-700 text-xs">Event Details:</span>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {order.eventDescription}
                          </p>
                        </div>
                      )}

                      {/* Negotiation Status */}
                      {order.isNegotiated && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700 font-medium">
                              Negotiated ({order.finalSource || 'negotiated'})
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Vendor Information */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-gray-700">Vendor:</span>
                            <span className="text-gray-600 ml-1">{order.vendorName}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Guests:</span>
                            <span className="text-gray-600 ml-1">{order.numberOfGuests || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Created: {order.createdAt?.toDate?.()?.toLocaleString?.() || new Date(order.createdAt || Date.now()).toLocaleString()}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    {order.rating && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < order.rating! ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {order.review && (
                          <p className="text-sm text-gray-600">"{order.review}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - #{order.orderId}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Service & Vendor Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Service Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Service Name</label>
                                  <p className="text-gray-900">{order.serviceName}</p>
                            </div>
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Vendor</label>
                                  <p className="text-gray-900">{order.vendorName}</p>
                            </div>
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                                  <p className="text-gray-900 font-mono text-sm">{order.orderId}</p>
                            </div>
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Status</label>
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </Badge>
                            </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Event Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Event Date</label>
                                  <p className="text-gray-900">{new Date(order.eventDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Time Slot</label>
                                  <p className="text-gray-900">{order.selectedTimeSlot || "Not specified"}</p>
                            </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Location</label>
                                  <p className="text-gray-900">{order.eventLocation}</p>
                          </div>
                            <div>
                                  <label className="text-sm font-medium text-gray-600">Number of Guests</label>
                                  <p className="text-gray-900">{order.numberOfGuests || "Not specified"}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Customer Information */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Name</label>
                                  <p className="text-gray-900">{order.customerName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-600">Email</label>
                                  <p className="text-gray-900">{order.customerEmail}</p>
                                </div>
                                {order.customerAddress && (
                                  <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600">Address</label>
                                    <p className="text-gray-900">{order.customerAddress}</p>
                            </div>
                          )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Event Description */}
                          {order.eventDescription && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Event Description</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-700">{order.eventDescription}</p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Selected Packages & Meal Details */}
                          {order.selectedPackages && order.selectedPackages.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Selected Packages</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {order.selectedPackages.map((pkg: any, idx: number) => {
                                    const packageId = pkg.id || pkg.packageName || idx.toString();
                                    const mealSummary = getMealSummary(order, packageId);
                                    
                                    // Debug package data
                                    console.log(`📦 Package data for ${pkg.name || pkg.packageName}:`, {
                                      pkg,
                                      meals: pkg.meals,
                                      selectedMeals: order.selectedMeals?.[packageId]
                                    });
                                    
                                  return (
                                      <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-semibold text-gray-900">
                                        {pkg.name || pkg.packageName}
                                          </h4>
                                          {pkg.capacity && (
                                            <span className="text-sm text-gray-600">
                                              Capacity: {pkg.capacity} people
                                            </span>
                                        )}
                                      </div>
                                        
                                        {/* Meal Selection Details */}
                                        {pkg.meals && (
                                          <div className="mt-3">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Meals:</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                              {['breakfast', 'lunch', 'dinner'].map((meal) => {
                                                const mealData = pkg.meals[meal];
                                                const isSelected = order.selectedMeals?.[packageId]?.[meal as 'breakfast' | 'lunch' | 'dinner'];
                                                if (!mealData) return null;
                                                
                                                // Debug logging
                                                console.log(`🍽️ Meal data for ${meal}:`, {
                                                  mealData,
                                                  original: mealData.original,
                                                  price: mealData.price,
                                                  discounted: mealData.discounted
                                                });
                                                
                                                return (
                                                  <div key={meal} className={`p-3 rounded-lg border ${
                                                    isSelected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                                  }`}>
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-sm font-medium capitalize">{meal}</span>
                                                      {isSelected && (
                                                        <span className="text-green-600 text-xs">✓ Selected</span>
                                                      )}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                      ₹{(
                                                        mealData.original || 
                                                        mealData.price || 
                                                        mealData.discounted || 
                                                        0
                                                      ).toLocaleString()}
                                                    </div>
                                    </div>
                                  );
                                })}
                              </div>
                                            <div className="mt-2 text-sm text-gray-600">
                                              <strong>Selection Summary:</strong> {mealSummary}
                              </div>
                            </div>
                          )}
                          </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Pricing Breakdown */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Pricing Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {order.originalPrice && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Original Price:</span>
                                    <span>₹{order.originalPrice.toLocaleString()}</span>
                                  </div>
                                )}
                                {order.negotiatedPrice && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Negotiated Price:</span>
                                    <span className="text-green-600">₹{order.negotiatedPrice.toLocaleString()}</span>
                                  </div>
                                )}
                                {order.userBudget && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Your Budget:</span>
                                    <span className="text-purple-600">₹{order.userBudget.toLocaleString()}</span>
                                  </div>
                                )}
                                {order.convenienceFee && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Convenience Fee (1%):</span>
                                    <span>₹{order.convenienceFee.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="border-t pt-3">
                                  <div className="flex justify-between font-semibold text-lg">
                                    <span>Final Total:</span>
                                    <span className="text-blue-600">₹{(order.totalAmount || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                                
                                {/* Payment Status */}
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Payment Status:</span>
                                    <Badge className={
                                      order.paymentStatus === 'paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : order.paymentStatus === 'failed'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }>
                                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between mt-2 text-sm">
                                    <span>Paid Amount:</span>
                                    <span className="text-green-600">₹{(order.paidAmount || 0).toLocaleString()}</span>
                                  </div>
                                  {order.remainingAmount && order.remainingAmount > 0 && (
                                    <div className="flex justify-between mt-2 text-sm">
                                      <span>Remaining Amount:</span>
                                      <span className="text-orange-600">₹{order.remainingAmount.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Negotiation Status */}
                                {order.isNegotiated && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm text-blue-700 font-medium">
                                        This order was negotiated ({order.finalSource || 'negotiated'})
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Notes */}
                          {order.notes && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-700">{order.notes}</p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Order Timeline */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Order Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Order Created:</span>
                                  <span>{order.createdAt?.toDate?.()?.toLocaleString?.() || new Date(order.createdAt || Date.now()).toLocaleString()}</span>
                                </div>
                                {order.updatedAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span>{order.updatedAt?.toDate?.()?.toLocaleString?.() || new Date(order.updatedAt).toLocaleString()}</span>
                            </div>
                          )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Only show Pay button for confirmed orders */}
                    {order.status === "confirmed" && (
                    <PayDialog order={order} />
                    )}

                    {order.status === "pending" && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCancelOrder(order)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}

                    {order.status === "completed" && !order.rating && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setReviewingOrderId(order.id);
                          form.reset({ rating: 5, review: "" });
                          setIsReviewDialogOpen(true);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate & Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateOrder)} className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={updateOrderMutation.isPending}>
                  {updateOrderMutation.isPending ? "Updating..." : "Update Order"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleReviewOrder)} className="space-y-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} Star{rating > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Share your experience..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={updateOrderMutation.isPending}>
                  {updateOrderMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Payment Form - Always rendered when showPaymentForm is true */}
      {showPaymentForm && selectedOrderForPayment && (
        <PaymentFormInline 
          order={selectedOrderForPayment} 
          onClose={() => {
            console.log('❌ CustomerOrderManagement: Payment form closed for order:', selectedOrderForPayment.id);
            setShowPaymentForm(false);
            setSelectedOrderForPayment(null);
          }}
        />
      )}

    </div>
  );
}
