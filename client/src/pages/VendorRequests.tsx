import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth, db } from "@/lib/firebase";
import { useIndividualEventRequests, useAcceptOrder, useUpdateOrderStatus } from "@/hooks/useFirebaseData";
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Building2,
  MessageSquare,
  Eye,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Phone,
  Mail,
  CheckSquare,
  FileText,
  PieChart,
  ArrowUpDown
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VendorRequests() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedOrderForMessage, setSelectedOrderForMessage] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">("list");
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "bookings">("bookings");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const { data: individualEventRequests, isLoading, error } = useIndividualEventRequests();
  const acceptOrderMutation = useAcceptOrder();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Fetch vendor bookings
  const fetchVendorBookings = async () => {
    if (!user?.uid) return;

    setLoadingBookings(true);
    try {
      const bookingsRef = collection(db, "vendorBookings");
      const q = query(
        bookingsRef,
        where("vendorId", "==", user.uid)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setVendorBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching vendor bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendor bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch bookings when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchVendorBookings();
    }
  }, [user?.uid]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to accept orders",
        variant: "destructive",
      });
      return;
    }

    try {
      await acceptOrderMutation.mutateAsync({ orderId, vendorId: user.uid });
      toast({
        title: "Success",
        description: "Order accepted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVendorBookingResponse = async (bookingId: string, status: string, response: string) => {
    try {
      const bookingRef = doc(db, "vendorBookings", bookingId);
      await updateDoc(bookingRef, {
        status: status,
        vendorResponse: response,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: `Booking ${status} successfully!`,
      });

      fetchVendorBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string = "Not available") => {
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId,
        status: "rejected",
        timelineEntry: {
          status: "rejected",
          timestamp: new Date().toISOString(),
          description: `Order rejected by vendor. Reason: ${reason}`
        }
      });
      toast({
        title: "Success",
        description: "Order rejected successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAccept = async () => {
    if (!user?.uid || selectedOrders.length === 0) return;

    try {
      for (const orderId of selectedOrders) {
        await acceptOrderMutation.mutateAsync({ orderId, vendorId: user.uid });
      }
      setSelectedOrders([]);
      setIsBulkActionModalOpen(false);
      toast({
        title: "Success",
        description: `${selectedOrders.length} orders accepted successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept some orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedOrderForMessage || !messageText.trim()) return;

    try {
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      setIsMessageModalOpen(false);
      setMessageText("");
      setSelectedOrderForMessage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.requestId));
    }
  };

  const handleSelectOrder = (requestId: string) => {
    setSelectedOrders(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleContactCustomer = (order: any, method: 'phone' | 'email') => {
    if (method === 'phone') {
      window.open(`tel:${order.customerPhone}`);
    } else {
      window.open(`mailto:${order.customerEmail}`);
    }
  };

  const handleQuickReject = (orderId: string) => {
    handleRejectOrder(orderId, "Not available for this date");
  };

  // Filter and sort orders
  const filteredOrders = individualEventRequests?.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesEventType = eventTypeFilter === "all" || order.eventType === eventTypeFilter;
    const matchesBudget = budgetFilter === "all" || 
      (budgetFilter === "low" && (order.budget || 0) < 10000) ||
      (budgetFilter === "medium" && (order.budget || 0) >= 10000 && (order.budget || 0) <= 50000) ||
      (budgetFilter === "high" && (order.budget || 0) > 50000);
    
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "today" && new Date(order.eventDate).toDateString() === new Date().toDateString()) ||
      (dateFilter === "week" && new Date(order.eventDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && new Date(order.eventDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesStatus && matchesEventType && matchesBudget && matchesDate;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "date":
        comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
        break;
      case "budget":
        comparison = (a.budget || 0) - (b.budget || 0);
        break;
      case "guests":
        comparison = a.guestCount - b.guestCount;
        break;
      case "name":
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  }) || [];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "vendor_accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "confirmed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderPriority = (order: any) => {
    const daysUntilEvent = Math.ceil((new Date(order.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent <= 3) return { text: "URGENT", color: "bg-red-100 text-red-800" };
    if (daysUntilEvent <= 7) return { text: "HIGH", color: "bg-orange-100 text-orange-800" };
    if (daysUntilEvent <= 14) return { text: "MEDIUM", color: "bg-yellow-100 text-yellow-800" };
    return { text: "LOW", color: "bg-green-100 text-green-800" };
  };

  const getBudgetCategory = (budget: number) => {
    if (budget < 10000) return { category: "Budget", color: "bg-green-100 text-green-800" };
    if (budget < 50000) return { category: "Mid-Range", color: "bg-blue-100 text-blue-800" };
    return { category: "Premium", color: "bg-purple-100 text-purple-800" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3 h-3" />;
      case "vendor_accepted": return <CheckCircle className="w-3 h-3" />;
      case "rejected": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
              <p className="text-gray-600">Failed to load vendor requests. Please try again.</p>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Requests</h1>
              <p className="text-lg text-gray-600">Manage and respond to customer requests and bookings</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <FileText className="w-3 h-3 mr-1" />
                  Individual Events Requests
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Calendar className="w-3 h-3 mr-1" />
                  Direct Vendor Bookings
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/orders")} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Back to Manage Orders
            </Button>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Vendor Requests</span>
          </div>
          
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Vendor Requests Dashboard</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This page shows two types of customer requests:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Individual Events Requests:</strong> General event planning requests from customers</li>
                    <li><strong>Direct Vendor Bookings:</strong> Direct bookings made to your vendor profile</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                     <p className="text-2xl font-bold text-gray-900">{individualEventRequests?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                                     <p className="text-2xl font-bold text-gray-900">
                     {individualEventRequests?.filter(order => order.status === "vendor_accepted").length || 0}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                                     <p className="text-2xl font-bold text-gray-900">
                     {individualEventRequests?.filter(order => order.status === "pending").length || 0}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Direct Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorBookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Type Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "orders" | "bookings")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Direct Vendor Bookings
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Individual Events Requests
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab Content */}
            <TabsContent value="bookings" className="mt-0">
              {/* Vendor Bookings List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Direct Vendor Bookings ({vendorBookings.length})
                  </h2>
                </div>

                {loadingBookings ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <LoadingSpinner />
                      <p className="text-gray-600 mt-4">Loading bookings...</p>
                    </CardContent>
                  </Card>
                ) : vendorBookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No direct bookings</h3>
                      <p className="text-gray-600">You haven't received any direct bookings from customers yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {vendorBookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {booking.customerName}
                                  </h3>
                                  <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {new Date(booking.eventDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {booking.eventLocation}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="h-4 w-4 mr-2" />
                                  {booking.guestCount} guests
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  ₹{booking.budget.toLocaleString()}
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3">{booking.eventDescription}</p>

                              {booking.specificRequirements && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-gray-600">
                                    <strong>Specific Requirements:</strong> {booking.specificRequirements}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                {booking.customerEmail}
                                <Phone className="h-4 w-4 ml-3" />
                                {booking.customerPhone}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {booking.status === "pending" && (
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVendorBookingResponse(booking.id, "confirmed", "Booking confirmed. Looking forward to working with you!")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVendorBookingResponse(booking.id, "rejected", "Sorry, I'm not available for this date/time.")}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {booking.status === "confirmed" && (
                                <Badge className="bg-green-100 text-green-800">
                                  Confirmed
                                </Badge>
                              )}

                              {booking.status === "rejected" && (
                                <Badge className="bg-red-100 text-red-800">
                                  Rejected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Orders Tab Content */}
            <TabsContent value="orders" className="mt-0">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between mb-6">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <TabsList>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      List View
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Grid View
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedOrders.length} selected
                    </span>
                    <Button
                      onClick={() => setIsBulkActionModalOpen(true)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Accept Selected
                    </Button>
                  </div>
                )}
              </div>

              {/* Enhanced Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="vendor_accepted">Accepted</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Event Types</SelectItem>
                        <SelectItem value="wedding">Wedding</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="graduation">Graduation</SelectItem>
                        <SelectItem value="babyshower">Baby Shower</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="concert">Concert</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Budget Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Budgets</SelectItem>
                        <SelectItem value="low">Under ₹10,000</SelectItem>
                        <SelectItem value="medium">₹10,000 - ₹50,000</SelectItem>
                        <SelectItem value="high">Over ₹50,000</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Event Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Event Date</SelectItem>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="guests">Guest Count</SelectItem>
                          <SelectItem value="name">Customer Name</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content based on view mode */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsContent value="list" className="mt-0">
                  {/* Orders List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Available Requests ({filteredOrders.length})
                      </h2>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-gray-600">Select All</span>
                      </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests available</h3>
                          <p className="text-gray-600">There are currently no pending orders to review.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <Checkbox
                                    checked={selectedOrders.includes(order.requestId)}
                                    onCheckedChange={() => handleSelectOrder(order.requestId)}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="p-2 bg-purple-100 rounded-lg">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                      </div>
                                      <div className="flex-1">
                                                                                 <h3 className="text-lg font-semibold text-gray-900">
                                           {order.requestId}
                                         </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                          <span>{order.eventType}</span>
                                          <span>•</span>
                                          <MapPin className="w-4 h-4" />
                                          <span>{order.eventLocation}</span>
                                          <span>•</span>
                                          <Calendar className="w-4 h-4" />
                                          <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                                          <span>•</span>
                                          <Users className="w-4 h-4" />
                                          <span>{order.guestCount} guests</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                      <div>
                                        <p className="text-sm font-medium text-gray-600">Customer</p>
                                        <p className="text-gray-900">{order.customerName}</p>
                                      </div>
                                                                             <div>
                                         <p className="text-sm font-medium text-gray-600">Contact</p>
                                         <p className="text-gray-900">{order.customerEmail} • {order.customerPhone}</p>
                                       </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600">Budget</p>
                                        <p className="text-gray-900">₹{order.budget?.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-600">Description</p>
                                        <p className="text-gray-900 line-clamp-2">{order.eventDescription}</p>
                                      </div>
                                    </div>

                                    {order.additionalRequirements && (
                                      <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-600">Additional Requirements</p>
                                        <p className="text-gray-900">{order.additionalRequirements}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-4 ml-6">
                                  <div className="flex flex-col gap-2">
                                    <Badge className={getStatusColor(order.status)}>
                                      <div className="flex items-center gap-1">
                                        {getStatusIcon(order.status)}
                                        {order.status.replace('_', ' ').toUpperCase()}
                                      </div>
                                    </Badge>
                                    <Badge className={getOrderPriority(order).color}>
                                      {getOrderPriority(order).text}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptOrder(order.requestId)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setLocation(`/order-tracking?id=${order.requestId}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedOrderForMessage(order);
                                        setIsMessageModalOpen(true);
                                      }}
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="grid" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getOrderPriority(order).color}>
                                {getOrderPriority(order).text}
                              </Badge>
                            </div>
                            <Checkbox
                              checked={selectedOrders.includes(order.requestId)}
                              onCheckedChange={() => handleSelectOrder(order.requestId)}
                            />
                          </div>
                          <CardTitle className="text-lg">{order.requestId}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getBudgetCategory(order.budget || 0).color}>
                              {getBudgetCategory(order.budget || 0).category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{new Date(order.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.eventLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.guestCount} guests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">₹{order.budget?.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.eventType}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptOrder(order.requestId)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/order-tracking?id=${order.requestId}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-1 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleContactCustomer(order, 'phone')}
                              className="flex-1 text-xs"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleContactCustomer(order, 'email')}
                              className="flex-1 text-xs"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleQuickReject(order.requestId)}
                              className="flex-1 text-xs"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Order Status Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Pending</span>
                                                         <span className="text-sm font-medium">
                               {individualEventRequests?.filter(order => order.status === "pending").length || 0}
                             </span>
                          </div>
                                                     <Progress 
                             value={(individualEventRequests?.filter(order => order.status === "pending").length || 0) / (individualEventRequests?.length || 1) * 100} 
                             className="h-2"
                           />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Accepted</span>
                                                         <span className="text-sm font-medium">
                               {individualEventRequests?.filter(order => order.status === "vendor_accepted").length || 0}
                             </span>
                          </div>
                                                     <Progress 
                             value={(individualEventRequests?.filter(order => order.status === "vendor_accepted").length || 0) / (individualEventRequests?.length || 1) * 100} 
                             className="h-2 bg-green-100"
                           />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Event Type Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                                                     {Array.from(new Set(individualEventRequests?.map(order => order.eventType) || [])).map(eventType => (
                             <div key={eventType} className="flex items-center justify-between">
                               <span className="text-sm capitalize">{eventType}</span>
                               <span className="text-sm font-medium">
                                 {individualEventRequests?.filter(order => order.eventType === eventType).length || 0}
                               </span>
                             </div>
                           ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Revenue Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Potential Revenue</p>
                                                         <p className="text-2xl font-bold">
                               ₹{individualEventRequests?.reduce((sum, order) => sum + (order.budget || 0), 0).toLocaleString() || 0}
                             </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Average Order Value</p>
                                                         <p className="text-lg font-semibold">
                               ₹{Math.round((individualEventRequests?.reduce((sum, order) => sum + (order.budget || 0), 0) || 0) / (individualEventRequests?.length || 1)).toLocaleString()}
                             </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bulk Action Modal */}
      <Dialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Multiple Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to accept {selectedOrders.length} orders?</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBulkActionModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAccept} className="bg-green-600 hover:bg-green-700">
                Accept All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendMessage}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
