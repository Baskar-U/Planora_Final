import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Package, DollarSign, Search, Filter, Download, Eye, Edit, Trash2, Plus, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Store, MapPin, User, Handshake, CreditCard, Wallet, Banknote } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useUserType } from "@/contexts/UserTypeContext";
import { useOrdersByUser, useVendorOrders, useUpdateOrderStatus } from "@/hooks/useFirebaseData";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Orders() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { userType } = useUserType();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const { data: customerOrders = [], isLoading: customerLoading } = useOrdersByUser(user?.uid || "");
  const { data: vendorOrders = [], isLoading: vendorLoading } = useVendorOrders(user?.uid || "");
  const updateOrderStatusMutation = useUpdateOrderStatus();
  
  // Use appropriate orders based on user type
  const orders = userType === "vendor" ? vendorOrders : customerOrders;
  const isLoading = userType === "vendor" ? vendorLoading : customerLoading;

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && new Date(order.createdAt).toDateString() === new Date().toDateString()) ||
                       (dateFilter === "week" && new Date(order.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                       (dateFilter === "month" && new Date(order.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
  const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
  const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.budget || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vendor_accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'payment_pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'vendor_accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'payment_pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handlePaymentClick = (order: any) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedOrder) return;
    
    setIsProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to payment_pending and payment status to paid
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder.orderId,
        status: 'payment_pending',
        paymentStatus: 'paid',
        timelineEntry: {
          status: 'payment_pending',
          timestamp: new Date().toISOString(),
          description: `Payment completed via ${paymentMethod}. Order is now being processed.`
        }
      });
      
      // Close modal and reset state
      setIsPaymentModalOpen(false);
      setSelectedOrder(null);
      setPaymentMethod("card");
      
      // Show success message (you can add a toast notification here)
      alert("Payment successful! Your order is now being processed.");
      
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your orders</h2>
            <p className="text-gray-600">Please sign in to access your order history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userType === 'customer' ? 'My Orders' : 'Manage Orders'}
              </h1>
              <p className="text-gray-600 mt-2">
                {userType === 'customer' 
                  ? 'Track your order history and current bookings'
                  : 'Manage incoming orders and customer requests'
                }
              </p>
            </div>
            {userType === 'vendor' && (
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post New Service
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {userType === 'customer' ? 'Total Spent' : 'Total Revenue'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">₹{totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="vendor_accepted">Vendor Accepted</SelectItem>
                    <SelectItem value="payment_pending">Payment Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Requests Button */}
        {userType === 'vendor' && (
          <div className="mb-6">
            <Button 
              onClick={() => setLocation("/vendor-requests")}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Handshake className="h-4 w-4" />
              View Requests
            </Button>
          </div>
        )}

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {userType === 'customer' ? (
                <>
                  <Users className="h-5 w-5" />
                  My Orders ({filteredOrders.length})
                </>
              ) : (
                <>
                  <Store className="h-5 w-5" />
                  My Orders ({filteredOrders.length})
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {userType === 'customer' ? 'No orders found' : 'No orders to manage'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {userType === 'customer' 
                    ? 'You haven\'t placed any orders yet.'
                    : 'No orders have been placed yet.'
                  }
                </p>
                {userType === 'customer' && (
                  <Button onClick={() => setLocation("/")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.orderId}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="capitalize">{order.eventType}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {order.eventLocation}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{order.guestCount} guests</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                        </Badge>
                        {order.paymentStatus && (
                          <Badge className={`text-xs ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            <DollarSign className="h-3 w-3 mr-1" />
                            {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                          </Badge>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{order.budget?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-gray-500">Budget</p>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setLocation(`/order-tracking?id=${order.orderId}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {userType === 'customer' && order.status === 'vendor_accepted' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handlePaymentClick(order)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pay Amount
                          </Button>
                        )}
                        {userType === 'vendor' && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment for Order {selectedOrder?.orderId}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Type:</span>
                  <span className="font-medium">{selectedOrder?.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Date:</span>
                  <span className="font-medium">{selectedOrder?.eventDate && new Date(selectedOrder.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{selectedOrder?.eventLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Count:</span>
                  <span className="font-medium">{selectedOrder?.guestCount}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-semibold">Total Amount:</span>
                    <span className="font-bold text-lg text-green-600">₹{selectedOrder?.budget?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                    <Wallet className="h-4 w-4" />
                    UPI Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Label htmlFor="netbanking" className="flex items-center gap-2 cursor-pointer">
                    <Banknote className="h-4 w-4" />
                    Net Banking
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Button */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1"
                disabled={isProcessingPayment}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay ₹{selectedOrder?.budget?.toLocaleString() || '0'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
