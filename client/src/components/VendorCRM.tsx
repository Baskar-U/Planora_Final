import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Calendar,
  MapPin,
  User,
  CreditCard,
  AlertCircle,
  Eye,
  Handshake,
  DollarSign,
  Percent,
  Star,
  Phone,
  Mail,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Edit
} from 'lucide-react';
import UserBookings from './UserBookings';
import UpdateOrderModal from './UpdateOrderModal';
import VendorPendingPayments from './VendorPendingPayments';

interface Booking {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budget: number;
  maxBudget?: number;
  selectedTimeSlot: string;
  selectedServices: string[];
  selectedPackages?: any[];
  selectedMeals?: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } };
  selectedPhotography?: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  selectedDJ?: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  selectedDecoration?: { [packageId: string]: { quantity: number } };
  selectedCakes?: { [packageId: string]: { quantity: number } };
  selectedTravel?: { [packageId: string]: { pricingType: 'person' | 'group'; groupSize?: number } };
  totalAmount?: number;
  originalPrice?: number;
  negotiatedPrice?: number;
  userBudget?: number;
  convenienceFee?: number;
  isNegotiated?: boolean;
  eventDescription: string;
  specificRequirements?: string;
  negotiationRequested: boolean;
  preferredDiscount: number;
  selectedPackage?: any;
  finalPrice?: number;
  status: string;
  paymentStatus: string;
  vendorResponse?: string;
  vendorNotes?: string;
  customerNotes?: string;
  negotiation?: {
    enabled: boolean;
    originalPrice: number;
    offeredPrice: number;
    discountPercent: number;
    status: string;
    vendorCounterOffer?: number;
    finalPrice?: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    actor: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface VendorCRMProps {
  vendorId: string;
}

export default function VendorCRM({ vendorId }: VendorCRMProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  const [isUpdateOrderModalOpen, setIsUpdateOrderModalOpen] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [counterOffer, setCounterOffer] = useState(0);
  const [vendorNotes, setVendorNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments' | 'pending-payments'>('bookings');

  // Fetch vendor bookings
  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['vendorBookings', vendorId],
    queryFn: async () => {
      const q = query(
        collection(db, 'vendorBookings'),
        where('vendorId', '==', vendorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    },
    enabled: !!vendorId,
  });

  // Payments list (from bookings collection)
  const { data: payments = [], isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['vendorPayments', vendorId],
    queryFn: async () => {
      console.log('🔍 VendorCRM: Fetching payments for vendorId:', vendorId);
      const q = query(collection(db, 'bookings'), where('vendorId', '==', vendorId));
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      
      console.log('📊 VendorCRM: All bookings for vendor:', rows.length);
      console.log('📊 VendorCRM: Bookings with payments:', rows.filter(r => (r.paidAmount || 0) > 0).length);
      
      // Debug: Show all booking payment details
      console.log('🔍 VendorCRM: All booking payment details:', rows.map(r => ({
        id: r.id,
        customerName: r.customerName,
        totalAmount: r.totalAmount,
        paidAmount: r.paidAmount,
        remainingAmount: r.remainingAmount,
        paymentStatus: r.paymentStatus,
        lastPayment: r.lastPayment
      })));
      
      const filteredPayments = rows
        .filter(r => (r.paidAmount || 0) > 0)
        .sort((a: any, b: any) => {
          const at = a.updatedAt?.toDate?.()?.getTime?.() || new Date(a.updatedAt || a.createdAt || 0).getTime();
          const bt = b.updatedAt?.toDate?.()?.getTime?.() || new Date(b.updatedAt || b.createdAt || 0).getTime();
          return bt - at;
        });
      
      console.log('📊 VendorCRM: Filtered payments:', filteredPayments.map(p => ({
        id: p.id,
        customerName: p.customerName,
        totalAmount: p.totalAmount,
        paidAmount: p.paidAmount,
        remainingAmount: p.remainingAmount
      })));
      
      return filteredPayments;
    },
    enabled: !!vendorId,
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async ({ bookingId, customerEmail }: { bookingId: string; customerEmail?: string }) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      // Fetch current to compute status
      const all = await getDocs(query(collection(db, 'bookings'), where('__name__', '==', bookingId)));
      const current: any = all.docs[0]?.data() || {};
      const remaining = Math.max(0, (current.totalAmount || 0) - (current.paidAmount || 0));
      await updateDoc(bookingRef, {
        paymentVerified: true,
        paymentStatus: remaining === 0 ? 'paid' : 'partial_verified',
        updatedAt: new Date()
      });
      // Notify customer
      try {
        if (customerEmail) {
          await addDoc(collection(db, 'customerNotifications'), {
            customerEmail,
            type: 'payment_verified',
            title: 'Payment Verified',
            message: 'Congratulations! Your payment is verified. Have a great event with us.',
            data: { bookingId },
            isRead: false,
            createdAt: new Date()
          });
        }
      } catch {}
    },
    onSuccess: () => {
      toast({ title: 'Payment confirmed' });
      queryClient.invalidateQueries({ queryKey: ['vendorPayments', vendorId] });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' })
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ 
      bookingId, 
      customerEmail, 
      customerName, 
      remainingAmount 
    }: { 
      bookingId: string, 
      customerEmail: string, 
      customerName: string, 
      remainingAmount: number 
    }) => {
      // Create customer notification for payment reminder
      await addDoc(collection(db, 'customerNotifications'), {
        customerEmail,
        title: 'Payment Reminder',
        message: `Hi ${customerName}, you have a remaining payment of ₹${remainingAmount.toLocaleString()} for your booking. Please complete the payment to confirm your order.`,
        type: 'payment_reminder',
        data: {
          bookingId,
          remainingAmount,
          customerName
        },
        isRead: false,
        createdAt: new Date()
      });
    },
    onSuccess: () => {
      toast({ 
        title: 'Reminder Sent', 
        description: 'Payment reminder notification sent to customer' 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: 'Failed to send reminder. Please try again.', 
        variant: 'destructive' 
      });
    }
  });

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: Partial<Booking> }) => {
      const bookingRef = doc(db, 'vendorBookings', bookingId);
      await updateDoc(bookingRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Booking updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['vendorBookings', vendorId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add timeline event mutation
  const addTimelineEventMutation = useMutation({
    mutationFn: async ({ bookingId, event }: { bookingId: string; event: any }) => {
      const bookingRef = doc(db, 'vendorBookings', bookingId);
      const bookingDoc = await getDocs(query(collection(db, 'vendorBookings'), where('__name__', '==', bookingId)));
      const currentBooking = bookingDoc.docs[0]?.data() as Booking;
      
      const updatedTimeline = [
        ...currentBooking.timeline,
        {
          id: Date.now().toString(),
          ...event,
          timestamp: new Date().toISOString()
        }
      ];

      await updateDoc(bookingRef, {
        timeline: updatedTimeline
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorBookings', vendorId] });
    }
  });

  const handleAcceptBooking = async (booking: Booking) => {
    await updateBookingMutation.mutateAsync({
      bookingId: booking.id,
      updates: {
        status: 'accepted',
        vendorResponse: 'accepted',
        vendorNotes: vendorNotes || 'Booking accepted by vendor'
      }
    });

    await addTimelineEventMutation.mutateAsync({
      bookingId: booking.id,
      event: {
        status: 'accepted',
        description: 'Vendor accepted the booking request',
        actor: 'vendor'
      }
    });

    setIsDetailModalOpen(false);
    setVendorNotes('');
  };

  const handleRejectBooking = async (booking: Booking) => {
    await updateBookingMutation.mutateAsync({
      bookingId: booking.id,
      updates: {
        status: 'rejected',
        vendorResponse: 'rejected',
        vendorNotes: vendorNotes || 'Booking rejected by vendor'
      }
    });

    await addTimelineEventMutation.mutateAsync({
      bookingId: booking.id,
      event: {
        status: 'rejected',
        description: 'Vendor rejected the booking request',
        actor: 'vendor'
      }
    });

    setIsDetailModalOpen(false);
    setVendorNotes('');
  };

  const handleCounterOffer = async (booking: Booking) => {
    if (counterOffer <= 0) {
      toast({
        title: "Invalid Offer",
        description: "Please enter a valid counter offer amount",
        variant: "destructive",
      });
      return;
    }

    await updateBookingMutation.mutateAsync({
      bookingId: booking.id,
      updates: {
        status: 'counter_offered',
        vendorResponse: 'counter_offered',
        vendorNotes: negotiationNotes || `Counter offer: ₹${counterOffer.toLocaleString()}`,
        negotiation: {
          enabled: booking.negotiation?.enabled || false,
          originalPrice: booking.negotiation?.originalPrice || 0,
          offeredPrice: booking.negotiation?.offeredPrice || 0,
          discountPercent: booking.negotiation?.discountPercent || 0,
          status: 'counter_offered',
          vendorCounterOffer: counterOffer,
          finalPrice: booking.negotiation?.finalPrice
        }
      }
    });

    await addTimelineEventMutation.mutateAsync({
      bookingId: booking.id,
      event: {
        status: 'counter_offered',
        description: `Vendor made a counter offer of ₹${counterOffer.toLocaleString()}`,
        actor: 'vendor',
        metadata: {
          counterOffer: counterOffer,
          notes: negotiationNotes
        }
      }
    });

    setIsNegotiationModalOpen(false);
    setCounterOffer(0);
    setNegotiationNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'counter_offered':
        return 'bg-blue-100 text-blue-800';
      case 'negotiating':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'counter_offered':
        return <Handshake className="h-4 w-4" />;
      case 'negotiating':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSavings = (originalPrice: number, finalPrice: number) => {
    return originalPrice - finalPrice;
  };

  // Handle opening update order modal
  const handleUpdateOrder = (booking: Booking) => {
    setSelectedOrderForUpdate(booking);
    setIsUpdateOrderModalOpen(true);
  };

  // Calculate total amount from selected packages
  const calculateOrderTotal = (booking: Booking) => {
    // Always prioritize the stored totalAmount from booking data
    if (booking.totalAmount && booking.totalAmount > 0) {
      return booking.totalAmount;
    }
    
    if (booking.selectedPackages && Array.isArray(booking.selectedPackages)) {
      const subtotal = booking.selectedPackages.reduce((sum, pkg) => {
        // For catering packages with meals
        if (pkg.meals && booking.selectedMeals && booking.selectedMeals[pkg.id]) {
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
      
      // Add 1% convenience fee
      const convenienceFee = subtotal * 0.01;
      return subtotal + convenienceFee;
    }
    return booking.budget || 0; // Fallback to budget if no packages
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
        <p className="text-gray-600 mb-4">Failed to load your bookings. Please try again.</p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Bookings</h2>
          <p className="text-gray-600">Manage incoming booking requests and negotiations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={activeTab === 'bookings' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('bookings')}>Bookings</Button>
        <Button variant={activeTab === 'payments' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('payments')}>Payments</Button>
        <Button variant={activeTab === 'pending-payments' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('pending-payments')}>Pending Reviews</Button>
      </div>

      {activeTab === 'bookings' && (
        <UserBookings />
      )}

      {activeTab === 'pending-payments' && (
        <VendorPendingPayments />
      )}

      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payments Review
                </CardTitle>
                <div className="text-sm text-gray-600">
                  Showing {payments.length} payment(s) for your bookings
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchPayments()}
                disabled={paymentsLoading}
              >
                {paymentsLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="text-center text-gray-600 py-6">Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className="text-center text-gray-600 py-6">
                <p>No payments yet</p>
                <p className="text-sm text-gray-500 mt-2">Payments will appear here when customers make payments for your services.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Debug info */}
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p><strong>Debug Info:</strong> Found {payments.length} payment(s) for vendor {vendorId}</p>
                  <p>Each payment represents a booking where the customer has made at least one payment.</p>
                </div>
                
                {payments.map((p: any) => {
                  const remainingAmount = p.remainingAmount || Math.max(0, (p.totalAmount||0)-(p.paidAmount||0));
                  const hasRemainingAmount = remainingAmount > 0;
                  
                  return (
                    <div key={p.id} className="border rounded-lg p-6 bg-white shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer & Service Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold text-lg">{p.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{p.vendorBusiness}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{p.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{p.eventLocation}</span>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Payment Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Total Amount:</span>
                                <span className="font-medium">₹{(p.totalAmount || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Paid Amount:</span>
                                <span className="font-medium">₹{(p.paidAmount || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-orange-600">
                                <span>Remaining:</span>
                                <span className="font-medium">₹{remainingAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment Status:</span>
                                <Badge variant={hasRemainingAmount ? "destructive" : "default"}>
                                  {hasRemainingAmount ? "Partial" : "Complete"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {p.lastPayment && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Last Payment</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Amount:</span>
                                  <span>₹{p.lastPayment.amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Transaction ID:</span>
                                  <span className="font-mono text-xs">{p.lastPayment.transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Date:</span>
                                  <span>{p.lastPayment.at?.toDate?.()?.toLocaleString?.() || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <div className="flex flex-col gap-2">
                            {p.lastPayment?.screenshotUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => window.open(p.lastPayment.screenshotUrl, '_blank')}
                                className="w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Screenshot
                              </Button>
                            )}
                            
                            {!p.paymentVerified && (
                              <Button 
                                size="sm" 
                                onClick={() => confirmPaymentMutation.mutate({ bookingId: p.id, customerEmail: p.customerEmail })}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Payment
                              </Button>
                            )}
                            
                            {hasRemainingAmount && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => sendReminderMutation.mutate({ 
                                  bookingId: p.id, 
                                  customerEmail: p.customerEmail,
                                  customerName: p.customerName,
                                  remainingAmount: remainingAmount
                                })}
                                className="w-full"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Send Reminder
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="counter_offered">Counter Offered</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Negotiations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {bookings.filter(b => b.negotiationRequested).length}
                </p>
              </div>
              <Handshake className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bookings match your current filters.' 
                  : 'You haven\'t received any booking requests yet.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status.toUpperCase()}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">#{booking.bookingId}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatDate(booking.createdAt)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold">{booking.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Event Date</p>
                          <p className="font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold">{booking.eventLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Order Total</p>
                          <p className="font-semibold">₹{calculateOrderTotal(booking).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {booking.selectedPackage && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-blue-900">{booking.selectedPackage.name}</p>
                            <p className="text-sm text-blue-700">{booking.selectedPackage.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-900">₹{(booking.selectedPackage.price || 0).toLocaleString()}</p>
                            {booking.finalPrice && booking.finalPrice !== booking.selectedPackage.price && (
                              <p className="text-sm text-green-600">
                                Final: ₹{(booking.finalPrice || 0).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.negotiationRequested && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Handshake className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-900">Price Negotiation Requested</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-purple-700">Original Price: ₹{(booking.negotiation?.originalPrice || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-purple-700">Offered Price: ₹{(booking.negotiation?.offeredPrice || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-purple-700">Discount Requested: {booking.preferredDiscount}%</p>
                          </div>
                        </div>
                        {booking.negotiation?.vendorCounterOffer && (
                          <div className="mt-2 p-2 bg-white rounded border">
                            <p className="text-sm font-semibold text-purple-900">
                              Your Counter Offer: ₹{(booking.negotiation.vendorCounterOffer || 0).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <p className="text-gray-700 text-sm mb-4">{booking.eventDescription}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrder(booking)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {booking.negotiationRequested && booking.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsNegotiationModalOpen(true);
                          }}
                        >
                          <Handshake className="h-4 w-4 mr-2" />
                          Negotiate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details - #{selectedBooking?.bookingId}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold">{selectedBooking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{selectedBooking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold">{selectedBooking.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Event Type</p>
                      <p className="font-semibold">{selectedBooking.serviceType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-semibold">{new Date(selectedBooking.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time Slot</p>
                      <p className="font-semibold">{selectedBooking.selectedTimeSlot}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{selectedBooking.eventLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Guest Count</p>
                      <p className="font-semibold">{selectedBooking.guestCount}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Event Description</p>
                    <p className="font-semibold">{selectedBooking.eventDescription}</p>
                  </div>
                  {selectedBooking.specificRequirements && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Specific Requirements</p>
                      <p className="font-semibold">{selectedBooking.specificRequirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Total</p>
                      <p className="font-semibold text-lg">₹{calculateOrderTotal(selectedBooking).toLocaleString()}</p>
                    </div>
                    {selectedBooking.maxBudget && (
                      <div>
                        <p className="text-sm text-gray-600">Maximum Budget</p>
                        <p className="font-semibold text-lg">₹{(selectedBooking.maxBudget || 0).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedBooking.finalPrice && (
                      <div>
                        <p className="text-sm text-gray-600">Final Price</p>
                        <p className="font-semibold text-lg text-green-600">₹{(selectedBooking.finalPrice || 0).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedBooking.negotiationRequested && (
                      <div>
                        <p className="text-sm text-gray-600">Discount Requested</p>
                        <p className="font-semibold text-lg">{selectedBooking.preferredDiscount}%</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Vendor Notes */}
              <div>
                <Label htmlFor="vendorNotes">Vendor Notes</Label>
                <Textarea
                  id="vendorNotes"
                  value={vendorNotes}
                  onChange={(e) => setVendorNotes(e.target.value)}
                  placeholder="Add notes about this booking..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleAcceptBooking(selectedBooking)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectBooking(selectedBooking)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Negotiation Modal */}
      <Dialog open={isNegotiationModalOpen} onOpenChange={setIsNegotiationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Counter Offer</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Original Price</span>
                  <span className="font-semibold">₹{(selectedBooking.negotiation?.originalPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Customer Offer</span>
                  <span className="font-semibold">₹{(selectedBooking.negotiation?.offeredPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Requested Discount</span>
                  <span className="font-semibold">{selectedBooking.preferredDiscount}%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="counterOffer">Your Counter Offer (₹)</Label>
                <Input
                  id="counterOffer"
                  type="number"
                  value={counterOffer}
                  onChange={(e) => setCounterOffer(parseInt(e.target.value) || 0)}
                  placeholder="Enter your counter offer"
                />
              </div>

              <div>
                <Label htmlFor="negotiationNotes">Notes</Label>
                <Textarea
                  id="negotiationNotes"
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  placeholder="Add notes about your counter offer..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsNegotiationModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCounterOffer(selectedBooking)}
                  className="flex-1"
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Send Counter Offer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Order Modal */}
      <UpdateOrderModal
        isOpen={isUpdateOrderModalOpen}
        onClose={() => {
          setIsUpdateOrderModalOpen(false);
          setSelectedOrderForUpdate(null);
        }}
        order={selectedOrderForUpdate}
        vendor={{
          id: vendorId,
          businessname: selectedOrderForUpdate?.vendorName || 'Vendor'
        }}
      />
    </div>
  );
}
