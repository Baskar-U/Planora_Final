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
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useUserType } from "@/contexts/UserTypeContext";
import { Link } from "wouter";
import { 
  User, 
  Edit, 
  Share2, 
  Check, 
  ShoppingCart,
  Calendar,
  Star,
  Package,
  Plus,
  Settings,
  Store,
  TrendingUp,
  Clock,
  DollarSign
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import InteractiveAvailabilityCalendar from "@/components/InteractiveAvailabilityCalendar";
import VendorAddServiceForm from "@/components/VendorAddServiceForm";
import { 
  useUserProfile, 
  useVendorProfile, 
  useVendorStats, 
  useUpdateUserProfile,
  useUpdateVendorProfile 
} from "@/hooks/useProfileData";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where, arrayUnion } from "firebase/firestore";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function VendorProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { userType } = useUserType();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [showAddPackage, setShowAddPackage] = useState<null | { id: string }>(null);
  const [newPackage, setNewPackage] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    capacity: 0,
    priceUnit: "per_person",
    features: [] as string[],
    isActive: true
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  
  // Fetch user profile data
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(user?.uid || "");
  
  // Fetch vendor profile data
  const { data: vendorProfile, isLoading: vendorProfileLoading } = useVendorProfile(user?.uid || "");
  
  // Fetch vendor statistics
  const { data: vendorStats, isLoading: statsLoading } = useVendorStats(user?.uid || "");

  // Fetch postorder services by email, vendorId, and vendorid for "My services"
  const { data: myServices = [], isLoading: myServicesLoading } = useQuery({
    queryKey: ["myPostorderServices", user?.email, user?.uid],
    queryFn: async () => {
      if (!user?.email && !user?.uid) return [] as any[];
      
      
      // Try multiple queries to find services
      const ref = collection(db, "postorder");
      const queries = [];
      
      if (user?.email) {
        queries.push(query(ref, where("email", "==", user.email)));
      }
      if (user?.uid) {
        queries.push(query(ref, where("vendorId", "==", user.uid)));
        queries.push(query(ref, where("vendorid", "==", user.uid)));
      }
      
      const snapshots = await Promise.all(queries.map(q => getDocs(q)));
      const allDocs = snapshots.flatMap(snap => snap.docs);
      
      // Remove duplicates based on document ID
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      );
      
      
      // If no services found, try to get all services for debugging
      if (uniqueDocs.length === 0) {
        const allServicesQuery = query(ref);
        const allServicesSnapshot = await getDocs(allServicesQuery);
      }
      
      return uniqueDocs.map(d => ({ id: d.id, ...d.data() }));
    },
    enabled: !!(user?.email || user?.uid),
    staleTime: 5 * 60 * 1000,
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await deleteDoc(doc(db, "postorder", serviceId));
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Service removed" });
      queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
  });

  const saveEditMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await updateDoc(doc(db, "postorder", id), { ...updates, updatedAt: new Date() });
    },
    onSuccess: () => {
      setEditingService(null);
      toast({ title: "Saved", description: "Service updated" });
      queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] });
    },
    onError: () => toast({ title: "Error", description: "Update failed", variant: "destructive" })
  });

  const addPackageMutation = useMutation({
    mutationFn: async ({ id, pkg }: { id: string; pkg: any }) => {
      await updateDoc(doc(db, "postorder", id), { packages: arrayUnion({ ...pkg, id: Date.now().toString() }) });
    },
    onSuccess: () => {
      setShowAddPackage(null);
      setNewPackage({ id: "", name: "", description: "", price: 0, originalPrice: 0, discount: 0, capacity: 0, priceUnit: "per_person", features: [], isActive: true });
      toast({ title: "Package added" });
      queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] });
    },
    onError: () => toast({ title: "Error", description: "Could not add package", variant: "destructive" })
  });

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
      const up: any = userProfile as any;
      form.reset({
        name: up.name || "",
        email: up.email || "",
        phone: up.phone || "",
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
  const updateVendorProfileMutation = useUpdateVendorProfile();

  const onSubmit = (data: ProfileFormData) => {
    if (!user?.uid) return;
    
    // Update user profile
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
      }
    });

    // Also update vendor profile if it exists
    if (vendorProfile?.id) {
      updateVendorProfileMutation.mutate({
        vendorId: vendorProfile.id,
        updates: {
          name: data.name,
          email: data.email,
          phone: data.phone
        }
      }, {
        onSuccess: () => {
        },
        onError: (error) => {
        }
      });
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/vendor/${vendorProfile?.id || user?.uid}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${(vendorProfile as any)?.businessname || user?.displayName || 'Vendor'}'s Profile`,
          text: `Check out ${(vendorProfile as any)?.businessname || 'this vendor'}'s services on Planora!`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast({
          title: "Profile link copied!",
          description: "Share this link with potential customers",
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
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
            <p className="text-gray-600">Please sign in to access your vendor profile settings.</p>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading || vendorProfileLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading vendor profile..." />
          </div>
        </div>
      </div>
    );
  }

  const displayName = (vendorProfile as any)?.businessname || (userProfile as any)?.name || user?.displayName || 'Vendor';
  const displayEmail = (userProfile as any)?.email || user?.email || '';
  const memberSince = (userProfile as any)?.createdAt 
    ? new Date((userProfile as any).createdAt.toDate()).toLocaleDateString() 
    : new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
              <p className="text-gray-600">Manage your business profile and services</p>
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
                    <AvatarImage src={(vendorProfile as any)?.image || (userProfile as any)?.image || user?.photoURL} />
                    <AvatarFallback className="text-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{displayName}</h2>
                  
                  <Badge className="mb-3 bg-green-100 text-green-800">
                    Vendor
                  </Badge>
                  
                  <p className="text-gray-600 mb-1">{displayEmail}</p>
                  <p className="text-sm text-gray-500">Member since {memberSince}</p>
                  
                  {(vendorProfile as any)?.isVerified && (
                    <div className="flex items-center justify-center mt-3 text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Verified Vendor</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {vendorStats?.totalServices || 0}
                    </div>
                    <p className="text-sm text-gray-600">Services</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {vendorStats?.totalOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">
                      {vendorStats?.completedOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {vendorStats?.pendingOrders || 0}
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ₹{(vendorStats?.totalRevenue || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Earned</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      ₹{(vendorStats?.remainingAmount || 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{vendorStats?.averageRating?.toFixed(1) || 0}/5</span>
                  <span className="text-gray-600">({vendorStats?.reviewCount || 0})</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/manage-orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                </Link>
                <Link href="/post-service">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Service
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="myservices">My services</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
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

                {/* Business Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Business Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{vendorStats?.totalServices || 0}</div>
                        <p className="text-sm text-gray-600">Total Services</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{vendorStats?.totalOrders || 0}</div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">₹{(vendorStats?.totalRevenue || 0).toLocaleString()}</div>
                        <p className="text-sm text-gray-600">Total Earned</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{vendorStats?.averageRating?.toFixed(1) || 0}</div>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{vendorStats?.completedOrders || 0}</div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{vendorStats?.pendingOrders || 0}</div>
                        <p className="text-sm text-gray-600">Pending</p>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{vendorStats?.customerCount || 0}</div>
                        <p className="text-sm text-gray-600">Customers</p>
                      </div>
                      <div className="text-center p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">₹{(vendorStats?.remainingAmount || 0).toLocaleString()}</div>
                        <p className="text-sm text-gray-600">Pending Payment</p>
                      </div>
                    </div>

                    {vendorStats?.serviceCategories && vendorStats.serviceCategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Service Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {vendorStats.serviceCategories.map((category: string) => (
                            <Badge key={category} variant="outline" className="bg-green-50">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {vendorStats?.recentBookings && vendorStats.recentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {vendorStats.recentBookings.map((booking: any, index: number) => (
                          <div key={booking.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {booking.customerName || 'Unknown Customer'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {booking.customerEmail || 'No email provided'}
                                </p>
                              </div>
                              <Badge 
                                variant={booking.status === 'confirmed' ? 'default' : 
                                        booking.status === 'completed' ? 'secondary' : 
                                        booking.status === 'cancelled' ? 'destructive' : 'outline'}
                              >
                                {booking.status || 'pending'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Event Date</p>
                                <p className="font-medium">
                                  {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Guests</p>
                                <p className="font-medium">{booking.numberOfGuests || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Amount</p>
                                <p className="font-medium">₹{(booking.totalAmount || 0).toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Paid Amount</p>
                                <p className="font-medium">₹{(booking.paidAmount || 0).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {booking.eventLocation && (
                              <div className="mt-2">
                                <p className="text-gray-500 text-sm">Location</p>
                                <p className="text-sm">{booking.eventLocation}</p>
                              </div>
                            )}
                            
                            {booking.eventDescription && (
                              <div className="mt-2">
                                <p className="text-gray-500 text-sm">Description</p>
                                <p className="text-sm">{booking.eventDescription}</p>
                              </div>
                            )}
                            
                            {booking.selectedPackages && booking.selectedPackages.length > 0 && (
                              <div className="mt-2">
                                <p className="text-gray-500 text-sm">Packages</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {booking.selectedPackages.map((pkg: any, pkgIndex: number) => (
                                    <Badge key={pkgIndex} variant="outline" className="text-xs">
                                      {pkg.packageName || pkg.name || 'Package'}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-500">
                              Created: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'Unknown'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600">Your orders will appear here once customers start booking your services.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* My services Tab */}
              <TabsContent value="myservices" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        My services
                      </CardTitle>
                      <Button onClick={() => setShowAddService(true)} size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {myServicesLoading ? (
                      <div className="flex items-center justify-center py-12"><LoadingSpinner text="Loading services..." /></div>
                    ) : myServices.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-gray-600">No services yet. Add your first service.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myServices.map((svc: any) => {
                          return (
                          <div key={svc.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{svc.category}</Badge>
                                  <span className="font-semibold">{svc.businessname}</span>
                                  <span className="text-gray-600">- {svc.serviceName || svc.eventname}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{svc.description}</p>
                                <div className="text-xs text-gray-500 mt-1">{svc.location}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setEditingService(svc)}>Edit</Button>
                                <Button variant="outline" size="sm" onClick={() => setShowAddPackage({ id: svc.id })}>Add Package</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteServiceMutation.mutate(svc.id)}>Delete</Button>
                              </div>
                            </div>
                            {Array.isArray(svc.packages) && svc.packages.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium mb-1">Packages</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {svc.packages.map((p: any) => (
                                    <div key={p.id || p.name} className="bg-gray-50 rounded p-3 text-sm">
                                      <div className="font-semibold">{p.name || p.packageName}</div>
                                      <div className="text-gray-600">
                                        {svc.category === 'Photography' && (p.photography || p.photographyDetails) ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">Photography Pricing:</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              {(() => {
                                                const photoData = p.photographyDetails || p.photography;
                                                return (
                                                  <>
                                                    {photoData.perEvent?.originalPrice && (
                                                      <div className="bg-white p-2 rounded border text-center">
                                                        <div className="font-medium text-gray-800">Per Event</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(photoData.perEvent.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(photoData.perEvent.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {photoData.perHour?.originalPrice && (
                                                      <div className="bg-white p-2 rounded border text-center">
                                                        <div className="font-medium text-gray-800">Per Hour</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(photoData.perHour.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(photoData.perHour.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </>
                                                );
                                              })()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Photography Package
                                            </div>
                                          </div>
                                        ) : svc.category === 'DJ' && (p.dj || p.djDetails) ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">DJ Pricing:</div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                              {(() => {
                                                const djData = p.djDetails || p.dj;
                                                return (
                                                  <>
                                                    {djData.perEvent?.originalPrice && (
                                                      <div className="bg-white p-2 rounded border text-center">
                                                        <div className="font-medium text-gray-800">Per Event</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(djData.perEvent.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(djData.perEvent.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {djData.perHour?.originalPrice && (
                                                      <div className="bg-white p-2 rounded border text-center">
                                                        <div className="font-medium text-gray-800">Per Hour</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(djData.perHour.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(djData.perHour.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </>
                                                );
                                              })()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              DJ Package
                                            </div>
                                          </div>
                                        ) : svc.category === 'Decoration' && (p.decoration || p.decorationDetails) ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">Decoration Pricing:</div>
                                            <div className="bg-white p-2 rounded border text-center">
                                              <div className="font-medium text-gray-800">Decoration Package</div>
                                              <div className="text-gray-600">
                                                {(() => {
                                                  const decorationData = p.decorationDetails || p.decoration;
                                                  return (
                                                    <>
                                                      <div>Original: ₹{(decorationData.originalPrice || p.originalPrice || 0).toLocaleString()}</div>
                                                      <div className="text-green-600">Discounted: ₹{(decorationData.price || p.discountedPrice || 0).toLocaleString()}</div>
                                                    </>
                                                  );
                                                })()}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Decoration Package
                                            </div>
                                          </div>
                                        ) : svc.category === 'Catering' && (p.meals || p.mealDetails) ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">Meal Pricing:</div>
                                            <div className="grid grid-cols-3 gap-1 text-xs">
                                              {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
                                                // Use mealDetails if available, fallback to meals
                                                const mealData = p.mealDetails || p.meals;
                                                const mealInfo = mealData[meal];
                                                if (!mealInfo) return null;
                                                const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                                                return (
                                                  <div key={meal} className="bg-white p-1 rounded border text-center">
                                                    <div className="font-medium text-gray-800">{label}</div>
                                                    <div className="text-gray-600">
                                                      <div>₹{(mealInfo.originalPrice || 0).toLocaleString()}</div>
                                                      <div className="text-green-600">₹{(mealInfo.price || 0).toLocaleString()}</div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {p.capacity || 0} people • {(p.priceUnit || "per_person").replace('_',' ')}
                                            </div>
                                          </div>
                                        ) : svc.category === 'Cakes' && p.cakes ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">Cakes Pricing:</div>
                                            <div className="bg-white p-2 rounded border text-center">
                                              <div className="font-medium text-gray-800">Cakes Package</div>
                                              <div className="text-gray-600">
                                                <div>Original: ₹{(p.cakes.originalPrice || 0).toLocaleString()}</div>
                                                <div className="text-green-600">Discounted: ₹{(p.cakes.price || 0).toLocaleString()}</div>
                                              </div>
                                              {p.cakes.cakeDetails && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                  {p.cakes.cakeDetails.size} • {p.cakes.cakeDetails.design}
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Cakes Package
                                            </div>
                                          </div>
                                        ) : svc.category === 'Travel' && (p.travel || p.travelDetails) ? (
                                          <div className="space-y-1">
                                            <div className="text-xs font-medium text-gray-700">Travel Package:</div>
                                            <div className="bg-white p-2 rounded border">
                                              {(() => {
                                                const travelData = p.travelDetails || p.travel;
                                                return (
                                                  <>
                                                    <div className="font-medium text-blue-600 text-xs mb-1">
                                                      {travelData.source} → {travelData.destination}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-2">
                                                      {travelData.days} day{(travelData.days > 1 ? 's' : '')}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div className="bg-gray-50 p-1 rounded text-center">
                                                        <div className="font-medium text-gray-800">1 Person</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(travelData.personPricing?.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(travelData.personPricing?.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                      <div className="bg-gray-50 p-1 rounded text-center">
                                                        <div className="font-medium text-gray-800">Group of {travelData.groupPricing?.groupSize || 2}</div>
                                                        <div className="text-gray-600">
                                                          <div>Original: ₹{(travelData.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                                                          <div className="text-green-600">Discounted: ₹{(travelData.groupPricing?.price || 0).toLocaleString()}</div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {travelData.areas && travelData.areas.length > 0 && (
                                                      <div className="text-xs text-gray-500 mt-1">
                                                        Via: {travelData.areas.map((area: any) => area.name).join(' → ')}
                                                      </div>
                                                    )}
                                                  </>
                                                );
                                              })()}
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            ₹{(p.price || p.discountPrice || 0).toLocaleString()} • {p.capacity || 0} people • {(p.priceUnit || "per_person").replace('_',' ')}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {showAddService && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Add Service</h3>
                        <Button variant="outline" size="sm" onClick={() => setShowAddService(false)}>Close</Button>
                      </div>
                      <VendorAddServiceForm onSuccess={() => { setShowAddService(false); queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] }); }} />
                    </div>
                  </div>
                )}

                {editingService && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Edit Service</h3>
                        <Button variant="outline" size="sm" onClick={() => setEditingService(null)}>Close</Button>
                      </div>
                      <VendorAddServiceForm 
                        serviceId={editingService.id}
                        initialData={editingService}
                        onSuccess={() => { setEditingService(null); queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] }); }} 
                      />
                    </div>
                  </div>
                )}

                {showAddPackage && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Add Package</h3>
                        <Button variant="outline" size="sm" onClick={() => setShowAddPackage(null)}>Close</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input type="number" value={newPackage.price} onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label>Original Price</Label>
                          <Input type="number" value={newPackage.originalPrice} onChange={(e) => setNewPackage({ ...newPackage, originalPrice: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <Label>Capacity</Label>
                          <Input type="number" value={newPackage.capacity} onChange={(e) => setNewPackage({ ...newPackage, capacity: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Input value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowAddPackage(null)}>Cancel</Button>
                        <Button disabled={!newPackage.name || newPackage.price <= 0} onClick={() => showAddPackage && addPackageMutation.mutate({ id: showAddPackage.id, pkg: newPackage })}>Save Package</Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Event Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InteractiveAvailabilityCalendar
                      vendorId={user?.uid || ''}
                      vendorName={displayName}
                      isVendor={true}
                    />
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
                          <p className="text-sm text-gray-600">Receive email updates about orders and bookings</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Privacy Settings</p>
                          <p className="text-sm text-gray-600">Manage your business privacy preferences</p>
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
