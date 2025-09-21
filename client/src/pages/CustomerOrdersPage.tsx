import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  Star,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User,
  CreditCard,
  Home,
  Building,
  ShoppingCart,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useCustomerOrders, useCustomerAnalytics } from "@/hooks/useFirebaseData";
import { useToast } from "@/hooks/use-toast";
import CustomerOrderManagement from "@/components/CustomerOrderManagement";
import Navbar from "@/components/Navbar";
import { useLocation } from "wouter";

export default function CustomerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useCustomerOrders();
  const { data: analytics, isLoading: analyticsLoading } = useCustomerAnalytics();

  // Get meal selection summary for a package
  const getMealSummary = (order: any, packageId: string) => {
    const selection = order.selectedMeals?.[packageId];
    if (!selection) return 'All meals';
    
    const selectedMeals = [];
    if (selection.breakfast) selectedMeals.push('Breakfast');
    if (selection.lunch) selectedMeals.push('Lunch');
    if (selection.dinner) selectedMeals.push('Dinner');
    
    return selectedMeals.length > 0 ? selectedMeals.join(', ') : 'No meals selected';
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || order.serviceCategory === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all" && order.eventDate) {
      const orderDate = new Date(order.eventDate);
      const today = new Date();
      const diffTime = orderDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = diffDays === 0;
          break;
        case "week":
          matchesDate = diffDays >= 0 && diffDays <= 7;
          break;
        case "month":
          matchesDate = diffDays >= 0 && diffDays <= 30;
          break;
        case "past":
          matchesDate = diffDays < 0;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === "pending").length,
    confirmedOrders: orders.filter(o => o.status === "confirmed").length,
    completedOrders: orders.filter(o => o.status === "completed").length,
    totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length : 0,
    upcomingEvents: orders.filter(o => {
      if (!o.eventDate) return false;
      const eventDate = new Date(o.eventDate);
      const today = new Date();
      return eventDate > today && o.status !== "cancelled";
    }).length
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <ClockIcon className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "in_progress": return <Activity className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return "Not set";
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid date";
      return dateObj.toLocaleDateString('en-IN');
    } catch (error) {
      console.warn('Invalid date in formatDate:', date);
      return "Invalid date";
    }
  };

  // Handle booking service redirect
  const handleBookService = () => {
    setLocation("/services");
  };

  // Handle WhatsApp contact
  const handleWhatsAppContact = () => {
    const phoneNumber = "+919025415399"; // Support number
    const message = "Hi, I need help with my Planora account.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Get event status color for calendar
  const getEventStatusColor = (order: any) => {
    if (!order.eventDate) return "bg-gray-200";
    
    try {
      const eventDate = new Date(order.eventDate);
      // Check if the date is valid
      if (isNaN(eventDate.getTime())) return "bg-gray-200";
      
      const today = new Date();
      
      if (order.status === "completed") return "bg-green-500";
      if (eventDate > today) return "bg-blue-500";
      return "bg-gray-400";
    } catch (error) {
      console.warn('Invalid event date in getEventStatusColor:', order.eventDate);
      return "bg-gray-200";
    }
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate how many days from next month to show
    const daysFromNextMonth = 42 - (lastDay.getDate() + daysFromPrevMonth); // 42 = 6 rows × 7 days
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer CRM</h1>
              <p className="text-gray-600 mt-1">Manage and track all your service bookings</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">+12% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">+8% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-blue-600">Next: {orders.find(o => o.status === "confirmed")?.eventDate ? formatDate(orders.find(o => o.status === "confirmed")?.eventDate) : "None"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">+5% from last month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={order.vendorImage} />
                              <AvatarFallback>{order.vendorName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{order.serviceName}</p>
                              <p className="text-sm text-gray-600">{order.vendorName}</p>
                              <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-gray-600">Event Date</p>
                              <p className="font-medium">{formatDate(order.eventDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-gray-600">Location</p>
                              <p className="font-medium">{order.eventLocation}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-gray-600">Total Amount</p>
                              <p className="font-medium text-green-600">₹{(order.totalAmount || order.budget || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-gray-600">Guests</p>
                              <p className="font-medium">{order.numberOfGuests || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Selected Packages Preview */}
                        {order.selectedPackages && order.selectedPackages.length > 0 && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Selected Packages:</p>
                            <div className="space-y-1">
                              {order.selectedPackages.slice(0, 2).map((pkg: any, idx: number) => {
                                const packageId = pkg.id || pkg.packageName || idx.toString();
                                const mealSummary = getMealSummary(order, packageId);
                                return (
                                  <div key={idx} className="text-sm text-gray-600">
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
                              {order.selectedPackages.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{order.selectedPackages.length - 2} more packages
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Status */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                order.paymentStatus === 'paid' ? 'bg-green-500' : 
                                order.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></div>
                              <span className="text-gray-600">Payment:</span>
                              <span className={`font-medium ${
                                order.paymentStatus === 'paid' ? 'text-green-600' : 
                                order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {order.paymentStatus === 'paid' ? 'Paid' : 
                                 order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                              </span>
                            </div>
                            {(order.remainingAmount || 0) > 0 && (
                              <div className="text-orange-600">
                                <span className="text-gray-600">Remaining:</span>
                                <span className="font-medium ml-1">₹{order.remainingAmount?.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Created: {order.createdAt?.toDate?.()?.toLocaleDateString?.() || new Date(order.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

                             {/* Quick Actions */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Plus className="h-5 w-5" />
                     Quick Actions
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     <Button 
                       className="w-full justify-start" 
                       variant="outline"
                       onClick={handleBookService}
                     >
                       <Plus className="h-4 w-4 mr-2" />
                       Book New Service
                     </Button>
                     
                     <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                       <DialogTrigger asChild>
                         <Button className="w-full justify-start" variant="outline">
                           <MessageSquare className="h-4 w-4 mr-2" />
                           Contact Support
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                           <DialogTitle>Contact Support</DialogTitle>
                           <DialogDescription>
                             Get in touch with our support team for assistance.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="space-y-4">
                           <div className="flex items-center space-x-3 p-3 border rounded-lg">
                             <Phone className="h-5 w-5 text-blue-600" />
                             <div>
                               <p className="font-medium">Phone Support</p>
                               <p className="text-sm text-gray-600">+91 9025415399</p>
                             </div>
                           </div>
                           <div className="flex items-center space-x-3 p-3 border rounded-lg">
                             <Mail className="h-5 w-5 text-red-600" />
                             <div>
                               <p className="font-medium">Email Support</p>
                               <p className="text-sm text-gray-600">infoplanoraevents@gmail.com</p>
                             </div>
                           </div>
                           <Button 
                             className="w-full" 
                             onClick={handleWhatsAppContact}
                           >
                             <MessageCircle className="h-4 w-4 mr-2" />
                             Chat on WhatsApp
                           </Button>
                           <div className="text-center text-sm text-gray-500">
                             <p>📱 WhatsApp feature available soon!</p>
                           </div>
                         </div>
                       </DialogContent>
                     </Dialog>

                                           <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            View Calendar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Event Calendar</DialogTitle>
                            <DialogDescription>
                              View all your upcoming and past events.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                                                         {/* Month Navigation */}
                             <div className="flex items-center justify-between">
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
                            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
                              <div>Sun</div>
                              <div>Mon</div>
                              <div>Tue</div>
                              <div>Wed</div>
                              <div>Thu</div>
                              <div>Fri</div>
                              <div>Sat</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendarDays().map((day, i) => {
                                const dateString = day.date.toISOString().split('T')[0];
                                const dayEvents = orders.filter(order => {
                                  if (!order.eventDate) return false;
                                  
                                  try {
                                    const eventDate = new Date(order.eventDate);
                                    if (isNaN(eventDate.getTime())) return false;
                                    
                                    const eventDateString = eventDate.toISOString().split('T')[0];
                                    return eventDateString === dateString;
                                  } catch (error) {
                                    console.warn('Invalid event date:', order.eventDate);
                                    return false;
                                  }
                                });
                                
                                return (
                                  <div 
                                    key={i} 
                                    className={`h-12 border rounded-lg p-1 text-xs relative ${
                                      day.isToday 
                                        ? 'bg-blue-50 border-blue-300' 
                                        : day.isCurrentMonth 
                                          ? 'bg-white' 
                                          : 'bg-gray-50'
                                    }`}
                                  >
                                    <div className={`${
                                      day.isCurrentMonth 
                                        ? 'text-gray-700' 
                                        : 'text-gray-400'
                                    }`}>
                                      {day.date.getDate()}
                                    </div>
                                    {dayEvents.map((event, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full ${getEventStatusColor(event)} absolute bottom-1 right-1`}
                                        title={`${event.serviceName} - ${event.status}`}
                                      />
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex items-center justify-center space-x-4 text-xs">
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Completed</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Upcoming</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span>Past</span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                     <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                       <DialogTrigger asChild>
                         <Button className="w-full justify-start" variant="outline">
                           <Download className="h-4 w-4 mr-2" />
                           Download Invoice
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                           <DialogTitle>Download Invoice</DialogTitle>
                           <DialogDescription>
                             Download invoices for your completed orders.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="text-center py-8">
                           <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                           <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon!</h3>
                           <p className="text-gray-600 mb-4">
                             Invoice download feature will be available soon. You'll be able to download detailed invoices for all your completed orders.
                           </p>
                           <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                             Got it
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                   </div>
                 </CardContent>
               </Card>
            </div>

            {/* Order Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Order Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                    <Progress value={(stats.pendingOrders / stats.totalOrders) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.confirmedOrders}</div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                    <Progress value={(stats.confirmedOrders / stats.totalOrders) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {orders.filter(o => o.status === "in_progress").length}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                    <Progress value={(orders.filter(o => o.status === "in_progress").length / stats.totalOrders) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                    <Progress value={(stats.completedOrders / stats.totalOrders) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {orders.filter(o => o.status === "cancelled").length}
                    </div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                    <Progress value={(orders.filter(o => o.status === "cancelled").length / stats.totalOrders) * 100} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Catering">Catering</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Decoration">Decoration</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="past">Past Events</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <CustomerOrderManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Spending Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="font-semibold">{formatCurrency(stats.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Order Value</span>
                      <span className="font-semibold">{formatCurrency(stats.averageOrderValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Orders This Month</span>
                      <span className="font-semibold">{orders.filter(o => {
                        const orderDate = new Date(o.createdAt);
                        const now = new Date();
                        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                      }).length}</span>
                    </div>
                    <Separator />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+15%</div>
                      <div className="text-sm text-gray-600">vs last month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Category Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.categoryPreferences?.slice(0, 5).map((cat: any) => (
                      <div key={cat.category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{cat.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{cat.orderCount} orders</span>
                          <span className="text-xs text-gray-500">({formatCurrency(cat.totalSpent)})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages & Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-600 mb-4">Start a conversation with your vendors to discuss your upcoming events.</p>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
                  <p className="text-gray-600 mb-4">Manage your personal information, preferences, and settings.</p>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
