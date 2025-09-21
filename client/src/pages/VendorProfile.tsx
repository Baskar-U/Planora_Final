import { useParams } from "wouter";
import { useVendor } from "@/hooks/useFirebaseData";
import { useVendorCompanyProfiles } from "@/hooks/useVendorCompanyProfiles";
import { useVendorPackages } from "@/hooks/useVendorPackages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, MapPin, Clock, User, CheckCircle, ArrowLeft, Calendar, Briefcase, Package, Filter, X, DollarSign, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState, useMemo } from "react";
import CollectionsGallery from "@/components/CollectionsGallery";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import BookingDetails from "@/components/BookingDetails";
import VendorServiceManager from "@/components/VendorServiceManager";
import InteractiveAvailabilityCalendar from "@/components/InteractiveAvailabilityCalendar";
import { useUserType } from "@/contexts/UserTypeContext";
import { auth } from "@/lib/firebase";
import { useOrderTrackingContext } from "@/contexts/OrderTrackingContext";
import { useAuthRequired } from "@/hooks/useAuthRequired";

export default function VendorProfile() {
  const { id } = useParams();
  const { data: vendor, isLoading, error } = useVendor(id || "");
  // Use the vendorid field to fetch company profiles from postorder collection
  const vendorIdForProfiles = vendor?.vendorid || "";
  
  const { data: companyProfiles = [], isLoading: profilesLoading } = useVendorCompanyProfiles(vendorIdForProfiles);
  
  // Simple direct approach - get packages directly from postorder collection
  const { data: packages = [], isLoading: packagesLoading, error: packagesError } = useVendorPackages(vendor?.vendorid || "");
  
  // Debug packages data
  useEffect(() => {
  }, [packages, packagesLoading, packagesError, vendor?.vendorid, companyProfiles]);
  
  // Helper function to get business name with fallbacks
  const getBusinessName = (vendor: any) => {
    return vendor.businessname || 
           vendor.business_name || 
           vendor.companyName || 
           vendor.company_name || 
           vendor.name || 
           'Business name not available';
  };
  
  const [, setLocation] = useLocation();
  const { userType } = useUserType();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  // Calculation state for meal details
  const [calcDays, setCalcDays] = useState<number>(1);
  const [calcInclude, setCalcInclude] = useState<{ breakfast: boolean; lunch: boolean; dinner: boolean }>({
    breakfast: true,
    lunch: true,
    dinner: true
  });
  // Calculation state for travel details
  const [travelCalcPeople, setTravelCalcPeople] = useState<number>(1);
  const [preSelectedPackage, setPreSelectedPackage] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { createApplication } = useOrderTrackingContext();
  const { requireAuth } = useAuthRequired();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);


  // Create merged vendor data with packages from simple hook or fallback to companyProfiles
  const mergedVendor = useMemo(() => {
    if (!vendor) {
      return null;
    }
    
    
    // Prefer packages from companyProfiles (they keep full structure like meals); fallback to simple hook
    const finalPackagesMerged = (companyProfiles[0]?.packages && companyProfiles[0]?.packages.length > 0)
      ? companyProfiles[0]?.packages
      : (packages || []);
    
    const vendorWithPackages = {
      ...vendor,
      packages: finalPackagesMerged
    };
    
    
    return vendorWithPackages;
  }, [vendor, packages, companyProfiles]);

  // Create vendor data for booking form
  const vendorForBooking = useMemo(() => {
    if (!mergedVendor) {
      return null;
    }
    
    
    // Prefer packages from companyProfiles (they keep full structure like meals); fallback to simple hook
    const finalPackagesForBooking = (companyProfiles[0]?.packages && companyProfiles[0]?.packages.length > 0)
      ? companyProfiles[0]?.packages
      : (packages || []);
    // Prefer packages from companyProfiles (they keep full structure like meals); fallback to simple hook
    const finalPackages = (companyProfiles[0]?.packages && companyProfiles[0]?.packages.length > 0)
      ? companyProfiles[0]?.packages
      : (packages || []);
    
    const vendorData = {
      id: mergedVendor.vendorid || mergedVendor.id || '', // This should be the Firebase Auth UID
      name: mergedVendor.name || '',
      businessname: getBusinessName(mergedVendor),
      eventname: mergedVendor.eventname || '',
      description: mergedVendor.description || '',
      location: mergedVendor.location || '',
      email: mergedVendor.email || '',
      mobilenumber: mergedVendor.mobilenumber || '',
      packages: finalPackagesForBooking, // Use final packages with fallback
      preSelectedPackage: preSelectedPackage, // Pass the pre-selected package
      price: 0,
      priceUnit: 'fixed'
    };
    return vendorData;
  }, [mergedVendor, packages, companyProfiles, preSelectedPackage]);

  // Debug: Log vendor data when it loads
  useEffect(() => {
    if (vendor) {
    }
  }, [vendor]);

  // Debug: Log vendor data
  useEffect(() => {
    if (vendor) {
    }
  }, [vendor]);

  // Handle back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/");
    }
  };


  // Handle booking a specific service
  const handleBookService = (service: any) => {
    if (!currentUser) {
      // Show login prompt or redirect to login
      alert("Please sign in to book services");
      return;
    }
    
    setShowBookingForm(true);
    // You can also set the selected service here if needed
  };

  // Handle viewing package details
  const handleViewPackageDetails = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowPackageDetails(true);
  };

  // Handle booking a package
  const handleBookPackage = (pkg: any) => {
    requireAuth(() => {
      
      // Set the pre-selected package
      setPreSelectedPackage(pkg);
      setShowBookingForm(true);
    });
  };

  // Handle slot selection from availability calendar
  const handleSlotSelect = (date: string, time: string, eventType: string) => {
    requireAuth(() => {
      setSelectedDate(date);
      setSelectedTime(time);
      setSelectedEventType(eventType);
      setShowBookingForm(true);
    });
  };

  // Handle booking completion
  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedEventType('');
  };

  // Handle booking cancellation
  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setPreSelectedPackage(null); // Clear pre-selected package
    setSelectedDate('');
    setSelectedTime('');
    setSelectedEventType('');
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };



  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Venue': 'bg-blue-100 text-blue-800',
      'Catering': 'bg-orange-100 text-orange-800',
      'Decoration': 'bg-pink-100 text-pink-800',
      'DJ': 'bg-green-100 text-green-800',
      'Cakes': 'bg-red-100 text-red-800',
      'Return Gift': 'bg-yellow-100 text-yellow-800',
      'Photography': 'bg-purple-100 text-purple-800',
      'Transport': 'bg-indigo-100 text-indigo-800',
      'Wedding': 'bg-rose-100 text-rose-800',
      'Birthday': 'bg-purple-100 text-purple-800',
      'Corporate': 'bg-slate-100 text-slate-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };


  if (isLoading || profilesLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" text="Loading vendor profile..." />
          </div>
        </div>
               <Footer />
     </div>
   );
 }


  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
            <p className="text-gray-600 mb-8">The vendor you're looking for doesn't exist or has been removed.</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`${getCategoryColor(vendor?.eventname || '')} bg-white/20 backdrop-blur-sm border-white/30 text-white`}>
                {vendor?.eventname || 'Vendor'}
              </Badge>
              {vendor?.isVerified && (
                <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-green-400/30">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span className="text-sm font-medium text-green-100">Verified</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 leading-tight">
              {getBusinessName(vendor || {})}
            </h1>
            <p className="text-xl opacity-95 font-medium">
              {vendor?.name || 'Vendor Name'}
            </p>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{vendor?.location || 'Location'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (120 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Vendor Details Section */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Owner */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="font-semibold text-gray-900">{vendor?.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900">{vendor?.location || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Packages Count */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Package className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Packages</p>
                      <p className="font-semibold text-gray-900">
                        {mergedVendor?.packages ? `${mergedVendor.packages.length} package${mergedVendor.packages.length !== 1 ? 's' : ''}` : '0 packages'}
                      </p>
                    </div>
                  </div>

                  {/* Posting Date */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Posted</p>
                      <p className="font-semibold text-gray-900">
                        {vendor?.createdAt ? new Date(vendor.createdAt.toDate()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit'
                        }).toUpperCase() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Mobile</p>
                      <p className="font-semibold text-gray-900">{vendor?.mobilenumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Working Hours</p>
                      <p className="font-semibold text-gray-900">{vendor?.hours || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-semibold text-gray-900">{vendor?.exprience || 0} years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Packages Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Packages</h2>
                    <p className="text-sm text-gray-600">
                      {mergedVendor?.packages ? `${mergedVendor.packages.length} package${mergedVendor.packages.length !== 1 ? 's' : ''} available` : 'No packages available'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!mergedVendor?.packages || mergedVendor.packages.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages available</h3>
                    <p className="text-gray-600">This vendor hasn't added any packages yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {mergedVendor.packages.map((pkg: any, index: number) => (
                      <div key={pkg.id || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all duration-300 group flex flex-col h-full min-h-[400px] w-full">
                        <div className="flex flex-col h-full space-y-4">
                          {/* Package Image */}
                          {pkg.images && pkg.images.length > 0 && (
                            <div className="relative overflow-hidden rounded-lg">
                              <img
                                src={pkg.images[0]}
                                alt={pkg.name}
                                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => handleImageClick(pkg.images[0])}
                              />
                            </div>
                          )}
                          
                          {/* Package Info */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-base line-clamp-2">
                                {pkg.name || "Package Name"}
                              </h3>
                              <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                                {pkg.description || "No description available"}
                              </p>
                            </div>
                            
                            {/* Category-specific package details */}
                            <div className="space-y-3">
                              {/* For Catering: Show meal details */}
                              {vendor?.category === 'Catering' && (pkg.meals || pkg.mealDetails) && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Meal</div>
                                    <div className="text-right">Original Price</div>
                                  </div>
                                  {(['breakfast','lunch','dinner'] as const).map((meal) => {
                                    // Use mealDetails if available, fallback to meals
                                    const mealData = pkg.mealDetails || pkg.meals;
                                    const mp = mealData?.[meal];
                                    const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                                    const value = mp?.originalPrice ?? null;
                                    return (
                                      <div key={meal} className="grid grid-cols-2 gap-2">
                                        <div>{label}</div>
                                        <div className="text-right">{value ? `₹${value.toLocaleString()}` : '-'}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* For Photography: Show clean pricing structure */}
                              {vendor?.category === 'Photography' && (pkg.photography || pkg.photographyDetails) && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Category</div>
                                    <div className="text-right">Original Price</div>
                                </div>
                                  
                                  {/* Use photographyDetails if available, fallback to photography */}
                                  {(() => {
                                    const photoData = pkg.photographyDetails || pkg.photography;
                                    return (
                                      <>
                                        {/* Per Event Pricing */}
                                        {(photoData.perEvent?.originalPrice || photoData.perEvent?.price) && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Per Event (1 day)</div>
                                            <div className="text-right">₹{(photoData.perEvent.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                        )}
                                        
                                        {/* Per Hour Pricing */}
                                        {(photoData.perHour?.originalPrice || photoData.perHour?.price) && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Per Hour</div>
                                            <div className="text-right">₹{(photoData.perHour.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* For DJ: Show clean pricing structure */}
                              {vendor?.category === 'DJ' && (pkg.dj || pkg.djDetails) && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Category</div>
                                    <div className="text-right">Original Price</div>
                                </div>
                                  
                                  {/* Use djDetails if available, fallback to dj */}
                                  {(() => {
                                    const djData = pkg.djDetails || pkg.dj;
                                    return (
                                      <>
                                        {/* Per Event Pricing */}
                                        {(djData.perEvent?.originalPrice || djData.perEvent?.price) && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Per Event (1 day)</div>
                                            <div className="text-right">₹{(djData.perEvent.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                        )}
                                        
                                        {/* Per Hour Pricing */}
                                        {(djData.perHour?.originalPrice || djData.perHour?.price) && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>Per Hour</div>
                                            <div className="text-right">₹{(djData.perHour.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* For DJ with wrong data structure: Show basic pricing as fallback */}
                              {vendor?.category === 'DJ' && !(pkg.dj || pkg.djDetails) && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Price</div>
                                    <div className="text-right">Amount</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Original</div>
                                    <div className="text-right">₹{(pkg.originalPrice || pkg.price || 0).toLocaleString()}</div>
                                  </div>
                                  {pkg.discount && pkg.discount > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>Discounted</div>
                                      <div className="text-right text-green-600">₹{((pkg.originalPrice || pkg.price || 0) * (1 - pkg.discount / 100)).toLocaleString()}</div>
                                    </div>
                                  )}
                                  <div className="text-xs text-orange-600 mt-2">
                                    ⚠️ Package structure needs to be updated for DJ pricing
                                  </div>
                                </div>
                              )}

                              {/* For Decoration: Show clean pricing structure */}
                              {vendor?.category === 'Decoration' && (pkg.decoration || pkg.decorationDetails) && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Category</div>
                                    <div className="text-right">Original Price</div>
                                  </div>
                                  
                                  {/* Use decorationDetails if available, fallback to decoration */}
                                  {(() => {
                                    const decorationData = pkg.decorationDetails || pkg.decoration;
                                    return (
                                      <>
                                        {/* Decoration Image */}
                                        {decorationData.image && (
                                          <div className="mb-2">
                                            <img 
                                              src={decorationData.image} 
                                              alt="Decoration preview" 
                                              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => handleImageClick(decorationData.image)}
                                            />
                                          </div>
                                        )}
                                  
                                        {/* Pricing */}
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>Decoration Package</div>
                                          <div className="text-right">₹{(decorationData.originalPrice || pkg.originalPrice || 0).toLocaleString()}</div>
                                        </div>
                                        
                                        {/* Features */}
                                        {decorationData.features && decorationData.features.length > 0 && (
                                          <div className="mt-2">
                                            <div className="text-xs text-gray-500 mb-1">Features:</div>
                                            <div className="flex flex-wrap gap-1">
                                              {decorationData.features.slice(0, 3).map((feature: string, index: number) => (
                                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                  {feature}
                                                </span>
                                              ))}
                                              {decorationData.features.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                  +{decorationData.features.length - 3} more
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* For Cakes: Show clean pricing structure */}
                              {vendor?.category === 'Cakes' && (pkg.cakes || pkg.cakeDetails || typeof pkg.originalPrice !== 'undefined') && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Category</div>
                                    <div className="text-right">Original Price</div>
                                  </div>
                                  
                                  {/* Cakes Image */}
                                  {(pkg.cakes?.image) && (
                                    <div className="mb-2">
                                      <img 
                                        src={pkg.cakes.image} 
                                        alt="Cakes preview" 
                                        className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handleImageClick(pkg.cakes.image)}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Pricing */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Cakes Package</div>
                                    {(() => {
                                      const original = pkg.cakes?.originalPrice ?? pkg.originalPrice ?? 0;
                                      return (
                                        <div className="text-right">₹{(original || 0).toLocaleString()}</div>
                                      );
                                    })()}
                                  </div>
                                  
                                  {/* Features */}
                                  {pkg.cakes?.features && pkg.cakes.features.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 mb-1">Features:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {pkg.cakes.features.slice(0, 3).map((feature: string, index: number) => (
                                          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                            {feature}
                                          </span>
                                        ))}
                                        {pkg.cakes.features.length > 3 && (
                                          <span className="text-xs text-gray-500">
                                            +{pkg.cakes.features.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* For Travel: Show travel package structure */}
                              {vendor?.category === 'Travel' && (pkg.travel || pkg.travelDetails) && (
                                <div className="space-y-3 text-sm">
                                  {/* Use travelDetails if available, fallback to travel */}
                                  {(() => {
                                    const travelData = pkg.travelDetails || pkg.travel;
                                    return (
                                      <>
                                        {/* Travel Image */}
                                        {travelData.image && (
                                          <div className="mb-3">
                                            <img 
                                              src={travelData.image} 
                                              alt="Travel preview" 
                                              className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                              onClick={() => handleImageClick(travelData.image)}
                                            />
                                          </div>
                                        )}
                                        
                                        {/* Route and Duration */}
                                        <div className="space-y-2">
                                          <div className="font-medium text-blue-600 text-sm leading-tight">
                                            {travelData.source} → {travelData.destination}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {travelData.days} day{(travelData.days > 1 ? 's' : '')}
                                          </div>
                                        </div>
                                        
                                        {/* Pickup Location */}
                                        {travelData.pickupLocation && (
                                          <div className="text-xs text-gray-600">
                                            <span className="font-medium">Pickup:</span> {travelData.pickupLocation}
                                          </div>
                                        )}
                                        
                                        {/* Areas */}
                                        {travelData.areas && travelData.areas.length > 0 && (
                                          <div className="text-xs text-gray-500">
                                            <span className="font-medium">Via:</span> {travelData.areas.map((area: any) => area.name).join(' → ')}
                                          </div>
                                        )}
                                        
                                        {/* Pricing */}
                                        <div className="mt-3 space-y-2">
                                          <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="font-medium text-gray-700 text-xs">1 Person:</div>
                                            <div className="text-sm font-semibold text-gray-900">₹{(travelData.personPricing?.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                          <div className="bg-gray-50 p-2 rounded-lg">
                                            <div className="font-medium text-gray-700 text-xs">Group of {travelData.groupPricing?.groupSize || 2}:</div>
                                            <div className="text-sm font-semibold text-gray-900">₹{(travelData.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                                          </div>
                                        </div>
                                        
                                        {/* Features */}
                                        {travelData.features && travelData.features.length > 0 && (
                                          <div className="mt-3">
                                            <div className="text-xs text-gray-500 mb-1 font-medium">Features:</div>
                                            <div className="flex flex-wrap gap-1">
                                              {travelData.features.slice(0, 2).map((feature: string, index: number) => (
                                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                                  {feature}
                                                </span>
                                              ))}
                                              {travelData.features.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                  +{travelData.features.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* For other categories: Show basic pricing */}
                              {vendor?.category !== 'Catering' && vendor?.category !== 'Photography' && vendor?.category !== 'DJ' && vendor?.category !== 'Decoration' && vendor?.category !== 'Cakes' && vendor?.category !== 'Travel' && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2 font-medium">
                                    <div>Price</div>
                                    <div className="text-right">Amount</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Original</div>
                                    <div className="text-right">₹{(pkg.originalPrice || pkg.price || 0).toLocaleString()}</div>
                                  </div>
                                  {pkg.discount && pkg.discount > 0 && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>Discounted</div>
                                      <div className="text-right text-green-600">₹{((pkg.originalPrice || pkg.price || 0) * (1 - pkg.discount / 100)).toLocaleString()}</div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Capacity - only show for non-Photography, non-DJ, non-Decoration, non-Cakes, and non-Travel categories */}
                              {typeof pkg.capacity !== 'undefined' && vendor?.category !== 'Photography' && vendor?.category !== 'DJ' && vendor?.category !== 'Decoration' && vendor?.category !== 'Cakes' && vendor?.category !== 'Travel' && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="h-4 w-4 mr-2" />
                                  <span>{pkg.capacity} {pkg.priceUnit ? pkg.priceUnit.replace('_', ' ') : 'people'}</span>
                                </div>
                              )}

                              {/* Event Type (category) - Use vendor category instead of package category */}
                              <div className="flex items-center text-sm text-gray-600">
                                <Briefcase className="h-4 w-4 mr-2" />
                                <span>{vendor?.eventname || vendor?.category || 'Event'}</span>
                              </div>
                            </div>
                            
                            {/* Inclusions */}
                            {pkg.inclusions && pkg.inclusions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">What's Included:</h4>
                                <ul className="space-y-1">
                                  {pkg.inclusions.slice(0, 3).map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-600">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                                      <span className="line-clamp-1">{item}</span>
                                    </li>
                                  ))}
                                  {pkg.inclusions.length > 3 && (
                                    <li className="text-xs text-gray-500">
                                      +{pkg.inclusions.length - 3} more items
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            
                            {/* Add-on Services */}
                            {pkg.addOnServices && pkg.addOnServices.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 text-sm">Add-ons Available:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {pkg.addOnServices.slice(0, 2).map((addon: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {addon}
                                    </Badge>
                                  ))}
                                  {pkg.addOnServices.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{pkg.addOnServices.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Package Status */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center">
                                {pkg.isActive ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Available
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500">
                                    Unavailable
                                  </Badge>
                                )}
                              </div>
                              </div>
                            </div>
                            
                          {/* Action Buttons - Pushed to bottom */}
                          <div className="flex gap-2 mt-auto pt-3">
                              <Button 
                                size="sm" 
                                variant="outline"
                              className="flex-1 h-9 text-xs"
                                onClick={() => handleViewPackageDetails(pkg)}
                              >
                                <Package className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              <Button 
                                size="sm" 
                              className="flex-1 h-9 text-xs"
                                disabled={!pkg.isActive}
                                onClick={() => handleBookPackage(pkg)}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {pkg.isActive ? 'Book Now' : 'Unavailable'}
                              </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold text-gray-900">About</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {vendor?.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {/* Services/Menu Section
            {vendor?.menu && vendor.menu.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="text-xl font-bold text-gray-900">Services & Menu</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {vendor?.menu?.map((item, index) => {
                      // Check if the item is a Firebase storage URL (contains firebasestorage.googleapis.com)
                      const isImageUrl = item.includes('firebasestorage.googleapis.com') || 
                                       item.includes('http') && (item.includes('.jpg') || item.includes('.jpeg') || item.includes('.png') || item.includes('.webp'));
                      
                      if (isImageUrl) {
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={item}
                              alt={`Menu item ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to text display if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center p-4';
                                fallbackDiv.innerHTML = `
                                  <div class="text-center">
                                    <div class="w-2 h-2 bg-primary-500 rounded-full mx-auto mb-2"></div>
                                    <span class="text-gray-700 text-sm">${item}</span>
                                  </div>
                                `;
                                target.parentNode?.appendChild(fallbackDiv);
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Badge className="bg-white text-gray-900">
                                  Menu Item {index + 1}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Display as text item in a card format
                        return (
                          <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-700 text-sm font-medium line-clamp-3">
                                  {item}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Service {index + 1}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Collections Section */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold text-gray-900">Collections</h2>
                <p className="text-sm text-gray-600">Our service photos and portfolio</p>
              </CardHeader>
              <CardContent>
                <CollectionsGallery vendorId={vendor?.vendorid || ''} />
              </CardContent>
            </Card>

                         {/* Service Management Section - Only for vendors viewing their own profile */}
             {userType === 'vendor' && currentUser?.uid === vendor?.id && (
               <Card>
                 <CardHeader className="pb-3">
                   <h2 className="text-xl font-bold text-gray-900">Manage Services</h2>
                   <p className="text-sm text-gray-600">Add, edit, and manage your service offerings</p>
                 </CardHeader>
                 <CardContent>
                   <VendorServiceManager 
                     vendorId={vendor?.vendorid || vendor?.id || ''} 
                     vendorName={getBusinessName(vendor || {})} 
                   />
                 </CardContent>
               </Card>
             )}

             {/* Interactive Availability Calendar */}
             <Card>
               <CardHeader className="pb-3">
                 <h2 className="text-xl font-bold text-gray-900">
                   {userType === 'vendor' && currentUser?.uid === vendor?.id ? 'Set Availability' : 'Check Availability'}
                 </h2>
                 <p className="text-sm text-gray-600">
                   {userType === 'vendor' && currentUser?.uid === vendor?.id 
                     ? 'Click on dates to set your availability slots' 
                     : 'Select a date to view available time slots'
                   }
                 </p>
               </CardHeader>
               <CardContent>
                 <InteractiveAvailabilityCalendar
                   vendorId={vendor?.vendorid || vendor?.id || ''}
                   vendorName={getBusinessName(vendor || {})}
                   isVendor={userType === 'vendor' && currentUser?.uid === vendor?.id}
                   onSlotSelect={handleSlotSelect}
                 />
               </CardContent>
             </Card>

             {/* Additional vendor management features can be added here */}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Vendor Image */}
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={vendor?.image || "/placeholder-vendor.jpg"}
                    alt={getBusinessName(vendor || {})}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-semibold text-lg">{getBusinessName(vendor || {})}</p>
                      <p className="text-sm opacity-90">{vendor?.eventname}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Info */}
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Business Name</p>
                  <p className="font-semibold text-gray-900">
                    {getBusinessName(vendor || {})}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <Badge className={getCategoryColor(vendor?.category || vendor?.eventname || '')}>
                    {vendor?.category || vendor?.eventname || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Packages Available</p>
                  <p className="font-semibold text-gray-900">
                    {mergedVendor?.packages ? mergedVendor.packages.length : 0}
                  </p>
                </div>
                {vendor?.isVerified && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Verified Vendor</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-300" 
                  size="lg"
                  onClick={() => {
                    requireAuth(() => {
                      setShowBookingForm(true);
                    });
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book This Vendor
                </Button>
                <Button variant="outline" className="w-full hover:bg-gray-100 hover:border-gray-400 transition-all duration-300" size="lg" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

        {/* Booking Details Modal - Using Pre-computed Vendor Data */}
        {showBookingForm && vendorForBooking && (
          <BookingDetails
            vendor={vendorForBooking}
            isOpen={showBookingForm}
            onClose={handleBookingCancel}
          />
        )}


      {/* Package Details Modal */}
      {showPackageDetails && selectedPackage && (
        <Dialog open={showPackageDetails} onOpenChange={setShowPackageDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Package Image */}
              {selectedPackage.images && selectedPackage.images.length > 0 && (
                <div className="relative rounded-lg">
                  <img
                    src={selectedPackage.images[0]}
                    alt={selectedPackage.name}
                    className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(selectedPackage.images[0])}
                  />
                    </div>
                  )}

              {/* Decoration Image if available */}
              {(selectedPackage.decoration?.image || selectedPackage.decorationDetails?.image) && (
                <div className="relative rounded-lg">
                  <img
                    src={selectedPackage.decorationDetails?.image || selectedPackage.decoration?.image}
                    alt="Decoration preview"
                    className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(selectedPackage.decorationDetails?.image || selectedPackage.decoration?.image)}
                  />
                </div>
              )}

              {/* Travel Image if available */}
              {selectedPackage.travel?.image && (
                <div className="relative rounded-lg">
                  <img
                    src={selectedPackage.travel.image}
                    alt="Travel preview"
                    className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(selectedPackage.travel.image)}
                  />
                </div>
              )}

              {/* Cakes Image if available */}
              {selectedPackage.cakes?.image && (
                <div className="relative rounded-lg">
                  <img
                    src={selectedPackage.cakes.image}
                    alt="Cakes preview"
                    className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(selectedPackage.cakes.image)}
                  />
                </div>
              )}

              {/* Package Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPackage.name || "Package Name"}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {selectedPackage.description || "No description available"}
                  </p>
                </div>
                
                {/* Pricing Details - Only Original Price */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Details
                  </h4>
                  
                  {/* Catering Meal Pricing */}
                  {vendor?.category === 'Catering' && (selectedPackage.meals || selectedPackage.mealDetails) && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 font-medium">
                        <div>Meal</div>
                        <div className="text-right">Original Price</div>
                    </div>
                      {(['breakfast','lunch','dinner'] as const).map((meal) => {
                        // Use mealDetails if available, fallback to meals
                        const mealData = selectedPackage.mealDetails || selectedPackage.meals;
                        const mp = mealData?.[meal];
                        if (!mp) return null;
                        const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                        return (
                          <div key={meal} className="grid grid-cols-2 gap-2">
                            <div>{label}</div>
                            <div className="text-right">₹{(mp.originalPrice || 0).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Photography Pricing */}
                  {vendor?.category === 'Photography' && (selectedPackage.photography || selectedPackage.photographyDetails) && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 font-medium">
                        <div>Type</div>
                        <div className="text-right">Original Price</div>
                        </div>
                      {(() => {
                        const photoData = selectedPackage.photographyDetails || selectedPackage.photography;
                        return (
                          <>
                            {photoData.perEvent?.originalPrice && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>Per Event</div>
                                <div className="text-right">₹{(photoData.perEvent.originalPrice || 0).toLocaleString()}</div>
                              </div>
                            )}
                            {photoData.perHour?.originalPrice && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>Per Hour</div>
                                <div className="text-right">₹{(photoData.perHour.originalPrice || 0).toLocaleString()}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* DJ Pricing */}
                  {vendor?.category === 'DJ' && (selectedPackage.dj || selectedPackage.djDetails) && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 font-medium">
                        <div>Type</div>
                        <div className="text-right">Original Price</div>
                </div>
                      {(() => {
                        const djData = selectedPackage.djDetails || selectedPackage.dj;
                        return (
                          <>
                            {djData.perEvent?.originalPrice && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>Per Event</div>
                                <div className="text-right">₹{(djData.perEvent.originalPrice || 0).toLocaleString()}</div>
                              </div>
                            )}
                            {djData.perHour?.originalPrice && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>Per Hour</div>
                                <div className="text-right">₹{(djData.perHour.originalPrice || 0).toLocaleString()}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Decoration Pricing */}
                  {vendor?.category === 'Decoration' && (selectedPackage.decoration || selectedPackage.decorationDetails) && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2 font-medium">
                        <div>Decoration Package</div>
                        <div className="text-right">Original Price</div>
                      </div>
                      {(() => {
                        const decorationData = selectedPackage.decorationDetails || selectedPackage.decoration;
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            <div>Decoration</div>
                            <div className="text-right">₹{(decorationData.originalPrice || selectedPackage.originalPrice || 0).toLocaleString()}</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  {/* Cakes Pricing */}
                  {vendor?.category === 'Cakes' && selectedPackage.cakes && (
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-2 gap-2 font-medium">
                        <div>Cakes Package</div>
                        <div className="text-right">Original Price</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Cakes</div>
                        <div className="text-right">₹{(selectedPackage.cakes.originalPrice || 0).toLocaleString()}</div>
                      </div>
                      
                      {/* Cake Details */}
                      {selectedPackage.cakes.cakeDetails && (
                        <div className="mt-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="font-medium text-gray-700 mb-2">Cake Details:</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                                <div className="text-gray-600">Size:</div>
                                <div className="font-medium">{selectedPackage.cakes.cakeDetails.size}</div>
                      </div>
                              <div>
                                <div className="text-gray-600">Design:</div>
                                <div className="font-medium">{selectedPackage.cakes.cakeDetails.design}</div>
                              </div>
                            </div>
                            {selectedPackage.cakes.cakeDetails.flavors && selectedPackage.cakes.cakeDetails.flavors.length > 0 && (
                              <div className="mt-3">
                                <div className="text-gray-600 mb-1">Available Flavors:</div>
                                <div className="flex flex-wrap gap-1">
                                  {selectedPackage.cakes.cakeDetails.flavors.map((flavor: string, index: number) => (
                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {flavor}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Travel Pricing */}
                  {vendor?.category === 'Travel' && (selectedPackage.travel || selectedPackage.travelDetails) && (
                    <div className="space-y-4 text-sm">
                      {(() => {
                        const travelData = selectedPackage.travelDetails || selectedPackage.travel;
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2 font-medium">
                              <div>Travel Package</div>
                              <div className="text-right">Route & Duration</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="font-medium text-blue-600">
                                {travelData.source} → {travelData.destination}
                              </div>
                              <div className="text-right">
                                {travelData.days} day{(travelData.days > 1 ? 's' : '')}
                              </div>
                            </div>
                            
                            {/* Areas with Speciality */}
                            {travelData.areas && travelData.areas.length > 0 && (
                              <div className="mt-3">
                                <div className="font-medium text-gray-700 mb-2">Via Areas:</div>
                                <div className="space-y-2">
                                  {travelData.areas.map((area: any, index: number) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                      <div className="font-medium text-gray-800">{area.name}</div>
                                      {area.speciality && (
                                        <div className="text-sm text-gray-600 mt-1">{area.speciality}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Pickup Location */}
                            {travelData.pickupLocation && (
                              <div className="mt-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="font-medium text-gray-700 mb-1">Pickup Location:</div>
                                  <div className="text-lg font-semibold text-blue-900">
                                    {travelData.pickupLocation}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Pricing Options */}
                            <div className="mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* 1 Person Pricing */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="font-medium text-gray-700 mb-2">For 1 Person:</div>
                                  <div className="text-lg font-semibold text-gray-900">
                                    ₹{(travelData.personPricing?.originalPrice || 0).toLocaleString()}
                                  </div>
                                </div>
                                
                                {/* Group Package Pricing */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="font-medium text-gray-700 mb-2">Group of {travelData.groupPricing?.groupSize || 2}:</div>
                                  <div className="text-lg font-semibold text-gray-900">
                                    ₹{(travelData.groupPricing?.originalPrice || 0).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Calculation Tab */}
                            <div className="mt-6">
                              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Price Calculator
                              </h4>
                              
                              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <Label htmlFor="travelCalcPeople" className="text-sm font-medium">Number of People</Label>
                                    <Input
                                      id="travelCalcPeople"
                                      type="number"
                                      min="1"
                                      value={travelCalcPeople}
                                      onChange={(e) => setTravelCalcPeople(parseInt(e.target.value) || 1)}
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                                
                                {/* Calculation Result */}
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-2">Total Price for {travelCalcPeople} {travelCalcPeople === 1 ? 'person' : 'people'}</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                      ₹{((travelData.personPricing?.originalPrice || 0) * travelCalcPeople).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      ₹{(travelData.personPricing?.originalPrice || 0).toLocaleString()} per person
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Other Categories */}
                  {vendor?.category !== 'Catering' && vendor?.category !== 'Photography' && vendor?.category !== 'DJ' && vendor?.category !== 'Decoration' && vendor?.category !== 'Cakes' && vendor?.category !== 'Travel' && (
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{(selectedPackage.originalPrice || selectedPackage.price || 0).toLocaleString()}
                    </div>
                  )}
                </div>
                
                {/* Package Features */}
                {selectedPackage.packageFeatures && selectedPackage.packageFeatures.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Package Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPackage.packageFeatures.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Decoration Features */}
                {((selectedPackage.decoration?.features && selectedPackage.decoration.features.length > 0) || 
                  (selectedPackage.decorationDetails?.features && selectedPackage.decorationDetails.features.length > 0)) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Package Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPackage.decorationDetails?.features || selectedPackage.decoration?.features || []).map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Cakes Features */}
                {selectedPackage.cakes?.features && selectedPackage.cakes.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Package Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.cakes.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travel Features */}
                {selectedPackage.travel?.features && selectedPackage.travel.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Package Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.travel.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPackageDetails(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setShowPackageDetails(false);
                    handleBookPackage(selectedPackage);
                  }}
                  disabled={!selectedPackage.isActive}
                  className="flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedPackage.isActive ? 'Book This Package' : 'Currently Unavailable'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Popup Modal */}
      {showImagePopup && selectedImage && (
        <Dialog open={showImagePopup} onOpenChange={setShowImagePopup}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Image Preview
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Package preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="p-6 pt-0">
              <Button
                variant="outline"
                onClick={() => setShowImagePopup(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
