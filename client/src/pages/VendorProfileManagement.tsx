import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Users,
  DollarSign,
  Settings
} from "lucide-react";
import VendorAddServiceForm from "@/components/VendorAddServiceForm";
import ServicePackagesModal from "@/components/ServicePackagesModal";
import EditVendorDetailsModal from "@/components/EditVendorDetailsModal";

interface VendorData {
  id: string;
  businessName: string;
  name: string;
  email: string;
  mobileNumber: string;
  description: string;
  category: string;
  subcategory: string;
  experience: string;
  features: string[];
  from: string[];
  hours: string;
  location: string;
  image: string;
  collections: string[];
  isVerified: boolean;
  createdAt: any;
}

interface ServiceData {
  id: string;
  name: string;
  serviceName?: string; // Added for new schema
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  location: string;
  isActive: boolean;
  createdAt: any;
  packages?: PackageData[];
}

interface PackageData {
  id: string;
  name: string;
  packageName?: string; // Added for new schema
  description: string;
  price: number;
  originalPrice?: number; // Added for new schema
  capacity: number;
  features: string[];
  packageFeatures?: string[]; // Added for new schema
  isActive: boolean;
  serviceId?: string;
  priceUnit?: string;
  // Category-specific pricing
  meals?: any; // Catering
  photography?: any; // Photography
  dj?: any; // DJ
  decoration?: any; // Decoration
}

export default function VendorProfileManagement() {
  const [showAddService, setShowAddService] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [showPackages, setShowPackages] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vendor data
  const { data: vendorData, isLoading: vendorLoading } = useQuery({
    queryKey: ["vendorProfile", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      const vendorQuery = query(
        collection(db, "vendors"),
        where("vendorId", "==", auth.currentUser.uid)
      );
      const vendorSnapshot = await getDocs(vendorQuery);
      
      if (vendorSnapshot.empty) {
        throw new Error("Vendor profile not found");
      }
      
      const vendorDoc = vendorSnapshot.docs[0];
      return { id: vendorDoc.id, ...vendorDoc.data() } as VendorData;
    },
    enabled: !!auth.currentUser
  });

  // Fetch vendor services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["vendorServices", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      console.log("🔍 Fetching services for vendorId:", auth.currentUser.uid);
      
      // Try multiple field combinations to find services
      const servicesQuery1 = query(
        collection(db, "postorder"),
        where("vendorId", "==", auth.currentUser.uid)
      );
      const servicesQuery2 = query(
        collection(db, "postorder"),
        where("vendorid", "==", auth.currentUser.uid)
      );
      const servicesQuery3 = query(
        collection(db, "postorder"),
        where("email", "==", auth.currentUser.email)
      );
      
      const [snapshot1, snapshot2, snapshot3] = await Promise.all([
        getDocs(servicesQuery1),
        getDocs(servicesQuery2),
        getDocs(servicesQuery3)
      ]);
      
      // Combine results and remove duplicates
      const allDocs = [...snapshot1.docs, ...snapshot2.docs, ...snapshot3.docs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      );
      
      console.log("📊 Services found with vendorId:", snapshot1.docs.length);
      console.log("📊 Services found with vendorid:", snapshot2.docs.length);
      console.log("📊 Services found with email:", snapshot3.docs.length);
      console.log("📊 Total unique services:", uniqueDocs.length);
      console.log("📊 Current user UID:", auth.currentUser.uid);
      console.log("📊 Current user email:", auth.currentUser.email);
      
      const servicesSnapshot = { docs: uniqueDocs };
      
      console.log("📊 Services found:", servicesSnapshot.docs.length);
      console.log("📋 Services data:", servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Check specifically for Decoration services
      const decorationServices = servicesSnapshot.docs.filter(doc => doc.data().category === 'Decoration');
      console.log("🎨 Decoration services found:", decorationServices.length);
      if (decorationServices.length > 0) {
        console.log("🎨 Decoration service details:", decorationServices[0].data());
      }
      
      return servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceData[];
    },
    enabled: !!auth.currentUser
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await deleteDoc(doc(db, "vendorServices", serviceId));
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["vendorServices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const toggleServiceStatusMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) => {
      await updateDoc(doc(db, "vendorServices", serviceId), { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["vendorServices"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleToggleServiceStatus = (serviceId: string, isActive: boolean) => {
    toggleServiceStatusMutation.mutate({ serviceId, isActive: !isActive });
  };

  const handlePackagesClick = (service: ServiceData) => {
    setSelectedService(service);
    setShowPackages(true);
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Profile Not Found</h2>
          <p className="text-gray-600 mb-4">Please register as a vendor first.</p>
          <Button onClick={() => window.location.href = "/vendor-registration"}>
            Register as Vendor
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vendorData.businessName}</h1>
              <p className="text-lg text-gray-600 mt-2">{vendorData.description}</p>
            </div>
            <Button onClick={() => setShowEditDetails(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </div>

        {/* Vendor Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Business</p>
                  <p className="text-lg font-semibold">{vendorData.businessName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-lg font-semibold">{vendorData.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Experience</p>
                  <p className="text-lg font-semibold">{vendorData.experience} years</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Services</p>
                  <p className="text-lg font-semibold">{services.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
            <Button onClick={() => setShowAddService(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first service to get bookings.</p>
                <Button onClick={() => setShowAddService(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Test message to verify changes are applied */}
              <div className="col-span-full bg-green-100 p-4 rounded-lg mb-4">
                <div className="text-green-800 font-bold text-lg">✅ CHANGES APPLIED - This message should be visible!</div>
                <div className="text-green-700">If you see this, the code changes are working.</div>
                <div className="text-green-700">Current time: {new Date().toLocaleTimeString()}</div>
              </div>
              
              {services.map((service) => {
                console.log("🎨 Rendering service:", service.serviceName || service.name, "Category:", service.category);
                console.log("🎨 Service packages:", service.packages);
                if (service.category === 'Catering' && service.packages) {
                  console.log("🎨 Catering packages details:", service.packages.map(pkg => ({
                    name: pkg.name,
                    meals: pkg.meals,
                    capacity: pkg.capacity,
                    priceUnit: pkg.priceUnit,
                    fullPackage: pkg
                  })));
                }
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{service.serviceName || service.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {service.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    {/* Debug: Always show service info */}
                    <div className="bg-red-100 p-2 rounded mb-2">
                      <div className="text-red-800 font-bold">🔍 DEBUG INFO:</div>
                      <div className="text-red-700">Service category: "{service.category}" (type: {typeof service.category})</div>
                      <div className="text-red-700">Packages count: {service.packages?.length || 0}</div>
                      <div className="text-red-700">Is Catering? {service.category === 'Catering' ? 'YES' : 'NO'}</div>
                      <div className="text-red-700">Category length: {service.category?.length}</div>
                    </div>
                    
                    {/* Detailed Package Information for Catering - Try multiple conditions */}
                    {(service.category === 'Catering' || service.category === 'catering' || service.category?.toLowerCase() === 'catering') ? (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Packages
                        </h4>
                        <div className="text-xs text-green-600 mb-2">
                          ✅ CATERING SERVICE DETECTED - {service.packages?.length || 0} packages found
                        </div>
                        <div className="space-y-3">
                          {service.packages && service.packages.length > 0 ? service.packages.map((pkg: any, index: number) => (
                            <div key={pkg.id || index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{pkg.name || `Package ${index + 1}`}</h5>
                                <Badge variant={pkg.isActive ? "default" : "secondary"} className="text-xs">
                                  {pkg.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                              
                              {/* Debug: Show package meal data */}
                              <div className="text-xs text-orange-600 mb-2">
                                DEBUG: Package "{pkg.name}" - Meals data: {pkg.meals ? 'EXISTS' : 'NOT FOUND'} | Keys: {pkg.meals ? Object.keys(pkg.meals).join(', ') : 'N/A'}
                              </div>
                              
                              {/* Meal-wise Pricing for Catering - Try multiple data structures */}
                              {(pkg.meals || pkg.breakfast || pkg.lunch || pkg.dinner) ? (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-gray-700 mb-1">Meal Pricing:</div>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
                                      // Try different data structures
                                      let mealData = pkg.meals?.[meal];
                                      if (!mealData) {
                                        mealData = pkg[meal]; // Direct property access
                                      }
                                      if (!mealData) return null;
                                      
                                      const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                                      const originalPrice = mealData.originalPrice || mealData.original || 0;
                                      const discountedPrice = mealData.price || mealData.discounted || mealData.discountedPrice || 0;
                                      
                                      return (
                                        <div key={meal} className="bg-white p-2 rounded border">
                                          <div className="font-medium text-gray-800">{label}</div>
                                          <div className="text-gray-600">
                                            <div>Original: ₹{originalPrice.toLocaleString()}</div>
                                            <div>Discounted: ₹{discountedPrice.toLocaleString()}</div>
                                            <div className="text-green-600 font-medium">
                                              Save: ₹{(originalPrice - discountedPrice).toLocaleString()}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 mb-2">
                                  No meal pricing available - showing basic info
                                </div>
                              )}
                              
                              {/* Alternative: Try to show meal data from different possible structures */}
                              {!pkg.meals && pkg.breakfast && (
                                <div className="bg-blue-50 p-2 rounded text-xs">
                                  <div className="font-medium text-blue-800">Alternative Meal Structure Found:</div>
                                  <div>Breakfast: Original ₹{pkg.breakfast.originalPrice || 0} | Discounted ₹{pkg.breakfast.price || 0}</div>
                                  <div>Lunch: Original ₹{pkg.lunch?.originalPrice || 0} | Discounted ₹{pkg.lunch?.price || 0}</div>
                                  <div>Dinner: Original ₹{pkg.dinner?.originalPrice || 0} | Discounted ₹{pkg.dinner?.price || 0}</div>
                                </div>
                              )}
                              
                              {/* Fallback: Show basic package info if no meal data */}
                              {!pkg.meals && (
                                <div className="bg-yellow-50 p-2 rounded text-xs">
                                  <div className="font-medium text-yellow-800">Package Info (No meal data):</div>
                                  <div>Original Price: ₹{pkg.originalPrice?.toLocaleString() || '0'}</div>
                                  <div>Discounted Price: ₹{pkg.price?.toLocaleString() || '0'}</div>
                                  <div>Discount: {pkg.discount || 0}%</div>
                                  <div className="mt-2 text-red-600">
                                    Available fields: {Object.keys(pkg).join(', ')}
                                  </div>
                                </div>
                              )}
                              
                              {/* Capacity and Unit */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-gray-500">
                                <span>Capacity: {pkg.capacity || 0} people</span>
                                <span>Unit: {pkg.priceUnit || 'per event'}</span>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 py-4">
                              No packages available
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Show detailed packages for ALL services as fallback */
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Packages (Fallback for {service.category})
                        </h4>
                        <div className="text-xs text-orange-600 mb-2">
                          This is the fallback display for {service.category} service
                        </div>
                        <div className="space-y-3">
                          {service.packages && service.packages.length > 0 ? service.packages.map((pkg: any, index: number) => (
                            <div key={pkg.id || index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{pkg.name || `Package ${index + 1}`}</h5>
                                <Badge variant={pkg.isActive ? "default" : "secondary"} className="text-xs">
                                  {pkg.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                              
                              {/* Show meal data if it exists */}
                              {pkg.meals ? (
                                <div className="bg-green-50 p-2 rounded text-xs">
                                  <div className="font-medium text-green-800">Meal Data Found:</div>
                                  <div>Breakfast: ₹{pkg.meals.breakfast?.originalPrice || 0} → ₹{pkg.meals.breakfast?.price || 0}</div>
                                  <div>Lunch: ₹{pkg.meals.lunch?.originalPrice || 0} → ₹{pkg.meals.lunch?.price || 0}</div>
                                  <div>Dinner: ₹{pkg.meals.dinner?.originalPrice || 0} → ₹{pkg.meals.dinner?.price || 0}</div>
                                </div>
                              ) : (
                                <div className="bg-yellow-50 p-2 rounded text-xs">
                                  <div className="font-medium text-yellow-800">No meal data - Available fields:</div>
                                  <div>{Object.keys(pkg).join(', ')}</div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-3 pt-2 border-t text-xs text-gray-500">
                                <span>Capacity: {pkg.capacity || 0} people</span>
                                <span>Unit: {pkg.priceUnit || 'per event'}</span>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center text-gray-500 py-4">
                              No packages available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Simple pricing for other categories - REMOVED */}
                    {false && (
                      /* Simple pricing for other categories */
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {service.category === 'Decoration' && service.packages?.[0]?.decoration ? (
                            <span>₹{service.packages[0].decoration.originalPrice?.toLocaleString() || '0'}</span>
                          ) : service.category === 'Photography' && service.packages?.[0]?.photography ? (
                            <span>₹{service.packages[0].photography.perEvent?.originalPrice?.toLocaleString() || service.packages[0].photography.perHour?.originalPrice?.toLocaleString() || '0'}</span>
                          ) : service.category === 'DJ' && service.packages?.[0]?.dj ? (
                            <span>₹{service.packages[0].dj.perEvent?.originalPrice?.toLocaleString() || service.packages[0].dj.perHour?.originalPrice?.toLocaleString() || '0'}</span>
                          ) : (
                            <span>₹{service.price?.toLocaleString() || '0'}</span>
                          )}
                          {service.priceUnit && service.category !== 'Photography' && service.category !== 'DJ' && service.category !== 'Decoration' && (
                            <span className="ml-1 text-xs">/{service.priceUnit}</span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {service.location}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePackagesClick(service)}
                        className="flex-1"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Packages
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleServiceStatus(service.id, service.isActive)}
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{vendorData.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900">{vendorData.mobileNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Working Hours</p>
                  <p className="text-gray-900">{vendorData.hours}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Areas</p>
                  <p className="text-gray-900">{vendorData.from?.join(", ")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <VendorAddServiceForm onSuccess={() => setShowAddService(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDetails} onOpenChange={setShowEditDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor Details</DialogTitle>
          </DialogHeader>
          <EditVendorDetailsModal 
            vendorData={vendorData} 
            onSuccess={() => setShowEditDetails(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPackages} onOpenChange={setShowPackages}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Service Packages - {selectedService?.name}</DialogTitle>
          </DialogHeader>
          <ServicePackagesModal 
            service={selectedService} 
            onSuccess={() => setShowPackages(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
