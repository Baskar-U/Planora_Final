import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Package,
  DollarSign,
  Clock,
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  eventDate: string;
  numberOfGuests: number;
  eventLocation: string;
  eventDescription: string;
  // Travel-specific fields
  travelStartDate?: string;
  travelEndDate?: string;
  memberCount?: number;
  aadharNumber?: string;
  queries?: string;
  vendorId: string;
  vendorName: string;
  vendorBusiness: string;
  selectedPackages: any[];
  selectedMeals?: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } };
  selectedPhotography?: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  selectedDJ?: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  selectedDecoration?: { [packageId: string]: { quantity: number } };
  selectedCakes?: { [packageId: string]: { quantity: number } };
  selectedTravel?: { [packageId: string]: { pricingType: 'person' | 'group'; groupSize?: number } };
  packagesWithSelectedMeals?: any[];
  selectedMealsSummary?: Array<{ packageId: string; packageName: string; meals: string[] }>;
  originalPrice?: number;
  negotiatedPrice?: number;
  userBudget?: number;
  convenienceFee?: number;
  totalAmount?: number;
  isNegotiated?: boolean;
  finalSource?: 'actual' | 'negotiated' | 'budget';
  status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'completed';
  createdAt: any;
  updatedAt: any;
}

export default function UserBookings() {
  const [user, setUser] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch bookings for current vendor
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['vendorBookings', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('vendorId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    },
    enabled: !!user?.uid,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Accept booking
  const acceptBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status: 'accepted',
        updatedAt: new Date()
      });

      // Create notification for customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await addDoc(collection(db, 'customerNotifications'), {
          customerEmail: booking.customerEmail,
          type: 'order_accepted',
          title: 'Order Accepted! 🎉',
          message: `Great news! Your order with ${booking.vendorBusiness} has been accepted. Event: ${booking.eventDate}, Total: ₹${(booking.totalAmount || calculateTotal(booking.selectedPackages || [], booking)).toLocaleString()}. Please confirm by paying the convenience fee.`,
          data: { 
            bookingId, 
            vendorId: user?.uid,
            vendorBusiness: booking.vendorBusiness,
            eventDate: booking.eventDate,
            totalAmount: booking.totalAmount || calculateTotal(booking.selectedPackages || [], booking)
          },
          isRead: false,
          createdAt: new Date()
        });
      }
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['vendorBookings', user?.uid] });
      // Also refresh customer's bell by invalidating their query key if possible
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.customerEmail) {
        queryClient.invalidateQueries({ queryKey: ['customerNotifications', booking.customerEmail] });
      }
    }
  });

  // Reject booking
  const rejectBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status: 'rejected',
        updatedAt: new Date()
      });

      // Create notification for customer
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await addDoc(collection(db, 'customerNotifications'), {
          customerEmail: booking.customerEmail,
          type: 'order_rejected',
          title: 'Order Rejected',
          message: `Your order with ${booking.vendorBusiness} has been rejected. Please try another vendor.`,
          data: { bookingId, vendorId: user?.uid },
          isRead: false,
          createdAt: new Date()
        });
      }
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['vendorBookings', user?.uid] });
      const booking = bookings.find(b => b.id === bookingId);
      if (booking?.customerEmail) {
        queryClient.invalidateQueries({ queryKey: ['customerNotifications', booking.customerEmail] });
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate total from packages (use stored totalAmount if available)
  const calculateTotal = (packages: any[], booking?: Booking) => {
    // Always prioritize the stored totalAmount from booking data
    if (booking?.totalAmount && booking.totalAmount > 0) {
      return booking.totalAmount;
    }
    
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return 0;
    }
    
    // For catering packages with meals, calculate based on selected meals
    return packages.reduce((sum, pkg) => {
      // For catering packages with meals
      if (pkg.meals && booking?.selectedMeals && booking.selectedMeals[pkg.id]) {
        const selection = booking.selectedMeals[pkg.id];
        let packageTotal = 0;
        
        if (selection.breakfast && pkg.meals.breakfast) {
          packageTotal += pkg.meals.breakfast.original || pkg.meals.breakfast.price || 0;
        }
        if (selection.lunch && pkg.meals.lunch) {
          packageTotal += pkg.meals.lunch.original || pkg.meals.lunch.price || 0;
        }
        if (selection.dinner && pkg.meals.dinner) {
          packageTotal += pkg.meals.dinner.original || pkg.meals.dinner.price || 0;
        }
        
        return sum + packageTotal;
      }
      
      // For non-catering packages or fallback
      const originalPrice = pkg.originalPrice || pkg.price || 0;
      const discount = pkg.discount || 0;
      const finalPrice = originalPrice - (originalPrice * discount / 100);
      return sum + finalPrice;
    }, 0);
  };

  // Get meal selection summary for a package
  const getMealSummary = (booking: Booking, packageId: string) => {
    const selection = booking.selectedMeals?.[packageId];
    if (!selection) return 'All meals';
    
    const selectedMeals = [];
    if (selection.breakfast) selectedMeals.push('Breakfast');
    if (selection.lunch) selectedMeals.push('Lunch');
    if (selection.dinner) selectedMeals.push('Dinner');
    
    return selectedMeals.length > 0 ? selectedMeals.join(', ') : 'No meals selected';
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleAccept = (bookingId: string) => {
    if (confirm('Are you sure you want to accept this booking?')) {
      acceptBookingMutation.mutate(bookingId);
    }
  };

  const handleReject = (bookingId: string) => {
    if (confirm('Are you sure you want to reject this booking?')) {
      rejectBookingMutation.mutate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-8 w-8 mx-auto text-gray-400 mb-4 animate-spin" />
            <p className="text-gray-500">Loading bookings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            User Bookings ({bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No bookings yet</p>
              <p className="text-sm text-gray-400">Customer bookings will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card 
                  key={booking.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleBookingClick(booking)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.customerName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.vendorBusiness}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.travelStartDate 
                            ? new Date(booking.travelStartDate).toLocaleDateString()
                            : booking.eventDate 
                            ? new Date(booking.eventDate).toLocaleDateString()
                            : 'Invalid Date'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {(() => {
                            // Check if this is a Travel booking
                            const hasTravelPackage = booking.selectedPackages?.some((pkg: any) => pkg.travel);
                            if (hasTravelPackage) {
                              // For Travel bookings, show member count or group size
                              const travelPackage = booking.selectedPackages?.find((pkg: any) => pkg.travel);
                              if (travelPackage?.travel) {
                                const selection = booking.selectedTravel?.[travelPackage.id || travelPackage.packageName || ''];
                                if (selection?.pricingType === 'person') {
                                  return `${booking.memberCount || 1} member${(booking.memberCount || 1) > 1 ? 's' : ''}`;
                                } else if (selection?.pricingType === 'group') {
                                  return `Group of ${travelPackage.travel.groupPricing?.groupSize || 2}`;
                                }
                              }
                              return `${booking.memberCount || 1} member${(booking.memberCount || 1) > 1 ? 's' : ''}`;
                            }
                            // For non-Travel bookings, show guests
                            return `${booking.numberOfGuests || 0} guests`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">
                          {(() => {
                            // Check if this is a Travel booking
                            const hasTravelPackage = booking.selectedPackages?.some((pkg: any) => pkg.travel);
                            if (hasTravelPackage) {
                              const travelPackage = booking.selectedPackages?.find((pkg: any) => pkg.travel);
                              if (travelPackage?.travel) {
                                return `${travelPackage.travel.source} → ${travelPackage.travel.destination}`;
                              }
                            }
                            return booking.eventLocation || 'N/A';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{calculateTotal(booking.selectedPackages, booking).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Additional Order Details */}
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* Package Details */}
                        <div>
                          <span className="font-medium text-gray-700">Packages:</span>
                          <div className="mt-1 space-y-1">
                            {(booking.selectedPackages || []).map((pkg: any, index: number) => {
                              const packageId = pkg.id || pkg.packageName || index.toString();
                              const mealSummary = getMealSummary(booking, packageId);
                              
                              // Check if this is a Travel package
                              if (pkg.travel) {
                                const selection = booking.selectedTravel?.[packageId];
                                return (
                                  <div key={index} className="text-gray-600">
                                    • {pkg.name || pkg.packageName}
                                    <div className="text-gray-500 text-xs ml-2">
                                      {pkg.travel.source} → {pkg.travel.destination}
                                      <br />
                                      {pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}
                                      {pkg.travel.pickupLocation && (
                                        <><br />Pickup: {pkg.travel.pickupLocation}</>
                                      )}
                                      {selection?.pricingType === 'person' && (
                                        <><br />Per Person: ₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()}</>
                                      )}
                                      {selection?.pricingType === 'group' && (
                                        <><br />Group of {pkg.travel.groupPricing?.groupSize || 2}: ₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}</>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <div key={index} className="text-gray-600">
                                  • {pkg.name || pkg.packageName}
                                  {pkg.meals && (
                                    <span className="text-gray-500"> ({mealSummary})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Pricing Details */}
                        <div>
                          <span className="font-medium text-gray-700">Pricing:</span>
                          <div className="mt-1 space-y-1">
                            {booking.originalPrice && booking.originalPrice > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Original:</span>
                                <span>₹{booking.originalPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.negotiatedPrice && booking.negotiatedPrice > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Negotiated:</span>
                                <span className="text-green-600">₹{booking.negotiatedPrice.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.userBudget && booking.userBudget > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Budget:</span>
                                <span className="text-purple-600">₹{booking.userBudget.toLocaleString()}</span>
                              </div>
                            )}
                            {booking.convenienceFee && booking.convenienceFee > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Fee:</span>
                                <span>₹{booking.convenienceFee.toLocaleString()}</span>
                              </div>
                            )}
                            {/* Show total amount if no breakdown is available */}
                            {(!booking.originalPrice || booking.originalPrice === 0) && 
                             (!booking.negotiatedPrice || booking.negotiatedPrice === 0) && 
                             (!booking.userBudget || booking.userBudget === 0) && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-semibold">₹{booking.totalAmount?.toLocaleString() || '0'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Event Description Preview */}
                      {booking.eventDescription && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="font-medium text-gray-700 text-xs">Event Details:</span>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {booking.eventDescription}
                          </p>
                        </div>
                      )}

                      {/* Negotiation Status */}
                      {booking.isNegotiated && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700 font-medium">
                              Negotiated ({booking.finalSource || 'negotiated'})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {booking.selectedPackages?.length || 0} package{(booking.selectedPackages?.length || 0) !== 1 ? 's' : ''} • ₹{calculateTotal(booking.selectedPackages || [], booking).toLocaleString()}
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(booking.id);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={acceptBookingMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(booking.id);
                            }}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            disabled={rejectBookingMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {selectedBooking.customerPhone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedBooking.customerEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{selectedBooking.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Event/Travel Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {selectedBooking.selectedPackages?.some((pkg: any) => pkg.travel) ? 'Travel Information' : 'Event Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const hasTravelPackage = selectedBooking.selectedPackages?.some((pkg: any) => pkg.travel);
                    if (hasTravelPackage) {
                      return (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Travel Start Date</label>
                            <p className="text-gray-900">
                              {selectedBooking.travelStartDate 
                                ? new Date(selectedBooking.travelStartDate).toLocaleDateString()
                                : 'Not specified'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Travel End Date</label>
                            <p className="text-gray-900">
                              {selectedBooking.travelEndDate 
                                ? new Date(selectedBooking.travelEndDate).toLocaleDateString()
                                : 'Not specified'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Number of Members</label>
                            <p className="text-gray-900">{selectedBooking.memberCount || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Aadhar Number</label>
                            <p className="text-gray-900">{selectedBooking.aadharNumber || 'Not provided'}</p>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Event Date</label>
                            <p className="text-gray-900">{new Date(selectedBooking.eventDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Number of Guests</label>
                            <p className="text-gray-900">{selectedBooking.numberOfGuests}</p>
                          </div>
                        </>
                      );
                    }
                  })()}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      {selectedBooking.selectedPackages?.some((pkg: any) => pkg.travel) ? 'Travel Route' : 'Event Location'}
                    </label>
                    <p className="text-gray-900 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {(() => {
                        const hasTravelPackage = selectedBooking.selectedPackages?.some((pkg: any) => pkg.travel);
                        if (hasTravelPackage) {
                          const travelPackage = selectedBooking.selectedPackages?.find((pkg: any) => pkg.travel);
                          if (travelPackage?.travel) {
                            return `${travelPackage.travel.source} → ${travelPackage.travel.destination}`;
                          }
                        }
                        return selectedBooking.eventLocation || 'Not specified';
                      })()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Event Description</label>
                    <p className="text-gray-900">{selectedBooking.eventDescription}</p>
                  </div>
                </div>
              </div>

              {/* Selected Packages */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Selected Packages
                </h3>
                <div className="space-y-3">
                  {(selectedBooking.selectedPackages || []).length > 0 ? (
                    (selectedBooking.selectedPackages || []).map((pkg: any, index: number) => {
                      const packageId = pkg.id || pkg.packageName || index.toString();
                      return (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{pkg.name || pkg.packageName}</h4>
                              {pkg.discount > 0 && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  {pkg.discount}% OFF
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                            
                            {/* Travel Package Details */}
                            {pkg.travel && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Travel Details:</h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Route:</span>
                                    <span className="font-medium">{pkg.travel.source} → {pkg.travel.destination}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium">{pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}</span>
                                  </div>
                                  {pkg.travel.pickupLocation && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Pickup:</span>
                                      <span className="font-medium">{pkg.travel.pickupLocation}</span>
                                    </div>
                                  )}
                                  {pkg.travel.areas && pkg.travel.areas.length > 0 && (
                                    <div>
                                      <span className="text-gray-600">Via Areas:</span>
                                      <div className="mt-1 space-y-1">
                                        {pkg.travel.areas.map((area: any, areaIndex: number) => (
                                          <div key={areaIndex} className="text-xs bg-white p-2 rounded border">
                                            <div className="font-medium">{area.name}</div>
                                            <div className="text-gray-500">{area.specialty}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-white p-2 rounded border">
                                      <div className="text-xs text-gray-600">1 Person</div>
                                      <div className="font-semibold">₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="bg-white p-2 rounded border">
                                      <div className="text-xs text-gray-600">Group of {pkg.travel.groupPricing?.groupSize || 2}</div>
                                      <div className="font-semibold">₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                                    </div>
                                  </div>
                                  {(() => {
                                    const selection = selectedBooking.selectedTravel?.[packageId];
                                    if (selection?.pricingType === 'person') {
                                      return (
                                        <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                                          <div className="font-medium text-green-800">Selected: Per Person Pricing</div>
                                          <div className="text-green-700">
                                            {selectedBooking.memberCount || 1} member{(selectedBooking.memberCount || 1) > 1 ? 's' : ''} × ₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()} = ₹{((pkg.travel.personPricing?.originalPrice || 0) * (selectedBooking.memberCount || 1)).toLocaleString()}
                                          </div>
                                        </div>
                                      );
                                    } else if (selection?.pricingType === 'group') {
                                      return (
                                        <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                                          <div className="font-medium text-blue-800">Selected: Group Package</div>
                                          <div className="text-blue-700">
                                            Group of {pkg.travel.groupPricing?.groupSize || 2} = ₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            )}
                            
                            {/* Meal Selection Details */}
                            {pkg.meals && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Meals:</h5>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
                                    const mealData = pkg.meals?.[meal];
                                    const isSelected = selectedBooking.selectedMeals?.[packageId]?.[meal];
                                    if (!mealData) return null;
                                    
                                    return (
                                      <div key={meal} className={`p-2 rounded ${isSelected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                        <div className="font-medium capitalize">{meal}</div>
                                        <div>₹{mealData.originalPrice?.toLocaleString() || 0}</div>
                                        {isSelected && <div className="text-green-600">✓ Selected</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                  Selected: {getMealSummary(selectedBooking, packageId)}
                                </div>
                              </div>
                            )}
                            
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p>No packages selected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              {(selectedBooking.originalPrice || selectedBooking.negotiatedPrice || selectedBooking.userBudget) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Breakdown
                  </h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {selectedBooking.originalPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Original Price:</span>
                            <span>₹{selectedBooking.originalPrice.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {selectedBooking.negotiatedPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Negotiated Price:</span>
                            <span className="text-green-600">₹{selectedBooking.negotiatedPrice.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {selectedBooking.userBudget && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">User Budget:</span>
                            <span className="text-purple-600">₹{selectedBooking.userBudget.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {selectedBooking.convenienceFee && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Convenience Fee (1%):</span>
                            <span>₹{selectedBooking.convenienceFee.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-blue-600">₹{selectedBooking.totalAmount?.toLocaleString() || calculateTotal(selectedBooking.selectedPackages, selectedBooking).toLocaleString()}</span>
                        </div>
                        
                        {selectedBooking.finalSource && (
                          <div className="text-xs text-gray-500 mt-2">
                            Final amount based on: {selectedBooking.finalSource}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              {selectedBooking.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedBooking.id);
                      setShowDetails(false);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={rejectBookingMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleAccept(selectedBooking.id);
                      setShowDetails(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={acceptBookingMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
