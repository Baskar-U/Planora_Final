import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserType } from "@/contexts/UserTypeContext";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Booking {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  eventType?: string;
  eventDate?: string;
  numberOfGuests?: number;
  eventLocation?: string;
  eventDescription?: string;
  vendorId?: string;
  vendorName?: string;
  vendorBusiness?: string;
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
  budget?: number;
  status?: string;
  negotiationRequested?: boolean;
  createdAt?: any;
  updatedAt?: any;
}
import VendorCRM from "@/components/VendorCRM";
import { 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  MessageCircle,
  Settings,
  BarChart3,
  Calendar,
  Star,
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Download,
  Zap,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function VendorDashboard() {
  const [, setLocation] = useLocation();
  const { userType } = useUserType();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real booking data - MUST be called before any early returns
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['vendorBookings', user?.uid], // Match the same query key as UserBookings
    queryFn: async () => {
      if (!user?.uid) return [];
      const q = query(
        collection(db, 'bookings'),
        where('vendorId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      return results;
    },
    enabled: !!user?.uid,
    refetchInterval: 10000 // Match the same refetch interval as UserBookings
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading dashboard..." />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
            <p className="text-gray-600">Please sign in to access your vendor dashboard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (userType !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">This dashboard is only available for vendors.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate total from selected packages (same logic as UserBookings)
  const calculateTotal = (packages: any[], booking?: Booking) => {
    // Always prioritize the stored totalAmount from booking data
    if (booking?.totalAmount && booking.totalAmount > 0) {
      return booking.totalAmount;
    }
    
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return 0;
    }
    
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

  // Calculate booking total with fallbacks
  const getBookingTotal = (booking: Booking) => {
    return calculateTotal(booking.selectedPackages || [], booking);
  };

  // Calculate real statistics from actual data
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    acceptedBookings: bookings.filter(b => b.status === 'accepted').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'accepted' || b.status === 'completed')
      .reduce((sum, b) => sum + getBookingTotal(b), 0),
    averageRating: 0, // Will be calculated from reviews when available
    responseTime: "N/A", // Will be calculated from actual response times
    negotiationRate: bookings.length > 0 
      ? Math.round((bookings.filter(b => b.negotiationRequested).length / bookings.length) * 100)
      : 0
  };


  const recentBookings = bookings.slice(0, 5); // Show only recent 5 bookings

  if (bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negotiation_pending':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your bookings and business</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setLocation("/add-service")}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.averageRating > 0 ? `${stats.averageRating}/5` : 'N/A'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => {
                        const calculatedTotal = getBookingTotal(booking);
                        return (
                          <div key={booking.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                        <div className="flex-1">
                                {/* Customer Info */}
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{booking.customerName}</h4>
                                  <Badge className={getStatusColor(booking.status || 'pending')}>
                                    {(booking.status || 'pending').replace('_', ' ')}
                                  </Badge>
                                </div>
                                
                                {/* Event Details */}
                                <div className="space-y-1 mb-3">
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {booking.numberOfGuests || 'N/A'} guests
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {booking.eventLocation || 'N/A'}
                                    </span>
                                  </div>
                                  
                                  {booking.eventType && (
                                    <p className="text-sm text-gray-700 font-medium">
                                      Event: {booking.eventType}
                                    </p>
                                  )}
                                  
                                  {booking.eventDescription && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {booking.eventDescription}
                                    </p>
                                  )}
                                </div>
                                
                                {/* Package Details */}
                                {booking.selectedPackages && booking.selectedPackages.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Selected Packages:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {booking.selectedPackages.map((pkg: any, index: number) => (
                                        <span 
                                          key={index}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                        >
                                          {pkg.packageName || pkg.name || `Package ${index + 1}`}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Contact Info */}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {booking.customerPhone || 'N/A'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {booking.customerEmail || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Price and Actions */}
                              <div className="flex flex-col items-end gap-2 ml-4">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">₹{calculatedTotal.toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">
                                    {booking.selectedPackages?.length || 0} package{(booking.selectedPackages?.length || 0) !== 1 ? 's' : ''}
                                  </p>
                        </div>
                                
                                <div className="flex items-center gap-1">
                          {booking.negotiationRequested && (
                                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Negotiation
                            </Badge>
                          )}
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No bookings yet</p>
                        <p className="text-sm">Your bookings will appear here</p>
                      </div>
                    )}
                  </div>
                  {recentBookings.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setActiveTab("bookings")}
                    >
                    View All Bookings
                  </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-medium">{stats.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Negotiation Rate</span>
                    <span className="font-medium">{stats.negotiationRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Events</span>
                    <span className="font-medium">{stats.completedBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{stats.averageRating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Package className="h-6 w-6" />
                    <span>Manage Bookings</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => setLocation("/add-service")}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add New Service</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <VendorCRM vendorId={user.uid} />
          </TabsContent>


          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12" />
                    <span className="ml-2">Revenue chart will be displayed here</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12" />
                    <span className="ml-2">Status chart will be displayed here</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Business Name</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter your business name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      rows={3}
                      placeholder="Describe your services"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Enter your location"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>


      <Footer />
    </div>
  );
}
