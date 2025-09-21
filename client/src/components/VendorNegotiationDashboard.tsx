import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Handshake, 
  DollarSign, 
  Percent, 
  Clock, 
  CheckCircle, 
  X, 
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  MapPin,
  Star,
  AlertCircle,
  Eye,
  Send,
  RefreshCw,
  Filter,
  Search,
  Package,
  CreditCard,
  Timer,
  Award,
  Zap
} from "lucide-react";

interface BookingRequest {
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
  status: string;
  paymentStatus: string;
  eventDescription: string;
  specificRequirements?: string;
  negotiationRequested: boolean;
  preferredDiscount: number;
  negotiation?: {
    enabled: boolean;
    originalPrice: number;
    offeredPrice: number;
    discountPercent: number;
    status: string;
    vendorCounterOffer?: {
      price: number;
      discountPercent: number;
      message: string;
      timestamp: string;
    };
    finalPrice?: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    actor: string;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface VendorNegotiationDashboardProps {
  vendorId: string;
}

export default function VendorNegotiationDashboard({ vendorId }: VendorNegotiationDashboardProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [negotiationData, setNegotiationData] = useState({
    counterOfferPrice: 0,
    counterOfferMessage: "",
    response: "",
    status: "accepted" // accepted, rejected, counter_offered
  });

  // Fetch bookings for this vendor
  const fetchBookings = async () => {
    try {
      const q = query(
        collection(db, "vendorBookings"),
        where("vendorId", "==", vendorId)
      );
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingRequest[];
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [vendorId]);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter]);

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, updates }: { bookingId: string; updates: any }) => {
      const bookingRef = doc(db, "vendorBookings", bookingId);
      await updateDoc(bookingRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      fetchBookings();
      setShowNegotiationModal(false);
      setShowResponseModal(false);
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const handleNegotiationResponse = (booking: BookingRequest, action: 'accept' | 'reject' | 'counter') => {
    setSelectedBooking(booking);
    
    if (action === 'counter') {
      setNegotiationData({
        counterOfferPrice: booking.budget,
        counterOfferMessage: "",
        response: "",
        status: "counter_offered"
      });
      setShowNegotiationModal(true);
    } else {
      setNegotiationData({
        counterOfferPrice: 0,
        counterOfferMessage: "",
        response: action === 'accept' ? 'I accept your offer' : 'I cannot accept this offer',
        status: action
      });
      setShowResponseModal(true);
    }
  };

  const submitNegotiationResponse = () => {
    if (!selectedBooking) return;

    const updates = {
      status: negotiationData.status === 'accepted' ? 'vendor_accepted' : 
              negotiationData.status === 'rejected' ? 'cancelled' : 'vendor_counter_offered',
      vendorResponse: negotiationData.response,
      'negotiation.status': negotiationData.status,
      'negotiation.vendorCounterOffer': negotiationData.status === 'counter_offered' ? {
        price: negotiationData.counterOfferPrice,
        discountPercent: Math.round(((selectedBooking.negotiation?.originalPrice || 0) - negotiationData.counterOfferPrice) / (selectedBooking.negotiation?.originalPrice || 1) * 100),
        message: negotiationData.counterOfferMessage,
        timestamp: new Date().toISOString()
      } : null,
      timeline: [
        ...selectedBooking.timeline,
        {
          status: negotiationData.status === 'accepted' ? 'vendor_accepted' :
                  negotiationData.status === 'rejected' ? 'vendor_rejected' : 'vendor_counter_offered',
          timestamp: new Date().toISOString(),
          description: negotiationData.status === 'accepted' ? 'Vendor accepted the booking' :
                      negotiationData.status === 'rejected' ? 'Vendor rejected the booking' :
                      'Vendor made a counter offer',
          actor: 'vendor',
          metadata: negotiationData.status === 'counter_offered' ? {
            counterOfferPrice: negotiationData.counterOfferPrice,
            message: negotiationData.counterOfferMessage
          } : null
        }
      ]
    };

    updateBookingMutation.mutate({
      bookingId: selectedBooking.id,
      updates
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vendor_reviewing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'negotiation_pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vendor_accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vendor_counter_offered':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'price_agreed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'payment_pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'vendor_reviewing':
        return <Eye className="h-4 w-4" />;
      case 'negotiation_pending':
        return <Handshake className="h-4 w-4" />;
      case 'vendor_accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'vendor_counter_offered':
        return <TrendingUp className="h-4 w-4" />;
      case 'price_agreed':
        return <Handshake className="h-4 w-4" />;
      case 'payment_pending':
        return <CreditCard className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateStats = () => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending' || b.status === 'vendor_reviewing').length;
    const negotiation = bookings.filter(b => b.status === 'negotiation_pending' || b.status === 'vendor_counter_offered').length;
    const accepted = bookings.filter(b => b.status === 'vendor_accepted' || b.status === 'price_agreed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.negotiation?.finalPrice || b.budget), 0);

    return { total, pending, negotiation, accepted, completed, totalRevenue };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Manage customer bookings and negotiations</p>
        </div>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Negotiations</p>
                <p className="text-2xl font-bold text-purple-600">{stats.negotiation}</p>
              </div>
              <Handshake className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="vendor_reviewing">Under Review</SelectItem>
                  <SelectItem value="negotiation_pending">Negotiation Pending</SelectItem>
                  <SelectItem value="vendor_accepted">Accepted</SelectItem>
                  <SelectItem value="vendor_counter_offered">Counter Offered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">No bookings match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.customerName}</h3>
                        <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{booking.eventLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{booking.guestCount} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>₹{booking.budget.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{booking.eventDescription}</p>
                    
                    {/* Negotiation Info */}
                    {booking.negotiationRequested && booking.negotiation && (
                      <div className="bg-purple-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Handshake className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Price Negotiation</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Original: </span>
                            <span className="font-medium">₹{booking.negotiation.originalPrice.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Offered: </span>
                            <span className="font-medium">₹{booking.negotiation.offeredPrice.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Discount: </span>
                            <span className="font-medium text-green-600">
                              {booking.negotiation.discountPercent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {(booking.status === 'pending' || booking.status === 'vendor_reviewing') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleNegotiationResponse(booking, 'accept')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNegotiationResponse(booking, 'reject')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        {booking.negotiationRequested && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNegotiationResponse(booking, 'counter')}
                            className="border-purple-200 text-purple-700 hover:bg-purple-50"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Counter Offer
                          </Button>
                        )}
                      </>
                    )}
                    
                    {booking.status === 'negotiation_pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNegotiationResponse(booking, 'counter')}
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Handshake className="h-4 w-4 mr-1" />
                        Respond
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Negotiation Modal */}
      <Dialog open={showNegotiationModal} onOpenChange={setShowNegotiationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5" />
              Make Counter Offer
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Customer's Offer</h4>
              <p className="text-2xl font-bold text-gray-900">
                ₹{selectedBooking?.budget.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                {selectedBooking?.negotiation?.discountPercent}% discount requested
              </p>
            </div>
            
            <div>
              <Label htmlFor="counterPrice">Your Counter Offer Price</Label>
              <Input
                id="counterPrice"
                type="number"
                value={negotiationData.counterOfferPrice}
                onChange={(e) => setNegotiationData(prev => ({
                  ...prev,
                  counterOfferPrice: parseInt(e.target.value) || 0
                }))}
                placeholder="Enter your counter offer"
              />
            </div>
            
            <div>
              <Label htmlFor="counterMessage">Message to Customer</Label>
              <Textarea
                id="counterMessage"
                value={negotiationData.counterOfferMessage}
                onChange={(e) => setNegotiationData(prev => ({
                  ...prev,
                  counterOfferMessage: e.target.value
                }))}
                placeholder="Explain your counter offer..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowNegotiationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitNegotiationResponse}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={updateBookingMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Counter Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {negotiationData.status === 'accepted' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              {negotiationData.status === 'accepted' ? 'Accept Booking' : 'Reject Booking'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
              <p className="text-sm text-gray-600">
                <strong>Customer:</strong> {selectedBooking?.customerName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Event:</strong> {selectedBooking?.eventType}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {selectedBooking?.eventDate && new Date(selectedBooking.eventDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Budget:</strong> ₹{selectedBooking?.budget.toLocaleString()}
              </p>
            </div>
            
            <div>
              <Label htmlFor="response">Response Message</Label>
              <Textarea
                id="response"
                value={negotiationData.response}
                onChange={(e) => setNegotiationData(prev => ({
                  ...prev,
                  response: e.target.value
                }))}
                placeholder="Add a message for the customer..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowResponseModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={submitNegotiationResponse}
                className={`flex-1 ${
                  negotiationData.status === 'accepted' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={updateBookingMutation.isPending}
              >
                {negotiationData.status === 'accepted' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Booking
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






