import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useUserType } from "@/contexts/UserTypeContext";
import { Link } from "wouter";
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Share2, 
  Copy, 
  Check, 
  ShoppingCart,
  Heart,
  Calendar,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Package,
  ArrowRight,
  Plus,
  Settings,
  Bell,
  Award,
  TrendingUp,
  Users,
  FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { 
  useUserProfile, 
  useCustomerStats, 
  useUpdateUserProfile 
} from "@/hooks/useProfileData";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CustomerProfile() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { userType } = useUserType();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.uid || "");
  
  // Fetch customer statistics
  console.log('🔍 CustomerProfile: user?.uid:', user?.uid);
  console.log('🔍 CustomerProfile: user?.email:', user?.email);
  const { data: customerStats, isLoading: statsLoading } = useCustomerStats(user?.uid || "");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  // Update form when user profile loads
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
      });
    } else if (user) {
      form.reset({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, [userProfile, user, form]);

  const updateProfileMutation = useUpdateUserProfile();

  const onSubmit = (data: ProfileFormData) => {
    if (!user?.uid) return;
    
    updateProfileMutation.mutate({
      userId: user.uid,
      updates: data
    }, {
      onSuccess: () => {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        console.error("Profile update error:", error);
      }
    });
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${user?.uid}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user?.displayName || 'User'}'s Profile`,
          text: `Check out ${user?.displayName || 'this user'}'s profile on Planora!`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast({
          title: "Profile link copied!",
          description: "Share this link with others to show your profile",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing profile:', error);
      toast({
        title: "Error",
        description: "Failed to share profile",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
            <p className="text-gray-600">Please sign in to access your profile settings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading profile..." />
          </div>
        </div>
      </div>
    );
  }

  const displayName = userProfile?.name || user?.displayName || 'Customer';
  const displayEmail = userProfile?.email || user?.email || '';
  const memberSince = userProfile?.createdAt 
    ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() 
    : new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Profile</h1>
              <p className="text-gray-600">Manage your account and view your activity</p>
            </div>
            <Button onClick={handleShareProfile} className="flex items-center gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share Profile
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={userProfile?.image || user?.photoURL} />
                    <AvatarFallback className="text-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h2>
                  
                  <Badge className="mb-3 bg-blue-100 text-blue-800">
                    Customer
                  </Badge>
                  
                  <p className="text-gray-600 mb-1">{displayEmail}</p>
                  <p className="text-sm text-gray-500">Member since {memberSince}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {customerStats?.totalOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {customerStats?.completedOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {customerStats?.pendingOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ₹{(customerStats?.totalSpent || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/vendors">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Vendors
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
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
                                  <Input {...field} disabled={!isEditing} placeholder="Optional" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex items-end">
                            <div className="w-full">
                              <label className="text-sm font-medium text-gray-700">Member Since</label>
                              <p className="text-sm text-gray-600 mt-1">{memberSince}</p>
                            </div>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                form.reset();
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Activity Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{customerStats?.totalOrders || 0}</div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{customerStats?.completedOrders || 0}</div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{customerStats?.pendingOrders || 0}</div>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">₹{(customerStats?.totalSpent || 0).toLocaleString()}</div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{customerStats?.vendorCount || 0}</div>
                        <p className="text-sm text-gray-600">Vendors Used</p>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">{customerStats?.likedVendorsCount || 0}</div>
                        <p className="text-sm text-gray-600">Liked Vendors</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{customerStats?.favoriteCategories?.length || 0}</div>
                        <p className="text-sm text-gray-600">Categories</p>
                      </div>
                    </div>

                    {customerStats?.favoriteCategories && customerStats.favoriteCategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Favorite Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {customerStats.favoriteCategories.map((category: string) => (
                            <Badge key={category} variant="outline" className="bg-blue-50">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerStats?.recentOrders && customerStats.recentOrders.length > 0 ? (
                        customerStats.recentOrders.map((order: any) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                order.status === 'completed' ? 'bg-green-500' :
                                order.status === 'confirmed' ? 'bg-blue-500' :
                                order.status === 'pending' ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{order.vendorBusiness || order.serviceName || 'Service'}</p>
                                <p className="text-sm text-gray-600">Order #{order.bookingId || order.id}</p>
                                <p className="text-xs text-gray-500">{order.vendorName || 'Unknown Vendor'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {order.status}
                              </Badge>
                              <p className="text-sm font-medium text-gray-900 mt-1">₹{(order.totalAmount || 0).toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                Paid: ₹{(order.paidAmount || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No recent orders</p>
                          <Link href="/vendors">
                            <Button variant="outline" className="mt-4">
                              Browse Vendors
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      My Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customerStats?.recentOrders && customerStats.recentOrders.length > 0 ? (
                      <div className="space-y-4">
                        {customerStats.recentOrders.map((order: any) => (
                          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{order.vendorBusiness || order.serviceName || 'Service'}</h3>
                                <p className="text-sm text-gray-600">Order #{order.bookingId || order.id}</p>
                                <p className="text-xs text-gray-500">Vendor: {order.vendorName || 'Unknown'}</p>
                              </div>
                              <Badge className={
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Total Amount:</span>
                                <p className="font-medium">₹{(order.totalAmount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Paid Amount:</span>
                                <p className="font-medium text-green-600">₹{(order.paidAmount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Remaining:</span>
                                <p className="font-medium text-red-600">₹{(order.remainingAmount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Guests:</span>
                                <p className="font-medium">{order.numberOfGuests || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Event Date:</span>
                                <p className="font-medium">{order.eventDate || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Location:</span>
                                <p className="font-medium">{order.eventLocation || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Event Type:</span>
                                <p className="font-medium">{order.eventType || order.serviceName || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span>
                                <p className="font-medium">
                                  {order.createdAt?.toDate?.()?.toLocaleDateString() || 
                                   new Date(order.createdAt || 0).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {order.eventDescription && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-gray-600 text-sm">Description:</span>
                                <p className="text-sm text-gray-700 mt-1">{order.eventDescription}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-4">Start exploring vendors and place your first order!</p>
                        <Link href="/vendors">
                          <Button>
                            <Users className="h-4 w-4 mr-2" />
                            Browse Vendors
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      My Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customerStats?.recentBookings && customerStats.recentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {customerStats.recentBookings.map((booking: any) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">{booking.eventType || 'Event'}</h3>
                                <p className="text-sm text-gray-600">Booking #{booking.bookingId}</p>
                              </div>
                              <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Event Date:</span>
                                <p className="font-medium">{booking.eventDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Event Time:</span>
                                <p className="font-medium">{booking.eventTime}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Guests:</span>
                                <p className="font-medium">{booking.guestCount || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span>
                                <p className="font-medium">{booking.createdAt ? new Date(booking.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-600 mb-4">Book your first event with our vendors!</p>
                        <Link href="/vendors">
                          <Button>
                            <Users className="h-4 w-4 mr-2" />
                            Browse Vendors
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive email updates about your orders</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Privacy Settings</p>
                          <p className="text-sm text-gray-600">Manage your privacy preferences</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Security</p>
                          <p className="text-sm text-gray-600">Change password and security settings</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

