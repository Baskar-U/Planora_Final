import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { auth, storage } from "@/lib/firebase";
import { firebaseService } from "@/lib/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserType } from "@/contexts/UserTypeContext";
import { 
  CalendarDays, 
  DollarSign, 
  FileText, 
  Store, 
  Users, 
  ArrowLeft, 
  Upload, 
  X, 
  ImageIcon,
  MapPin,
  Phone,
  Mail,
  Building,
  Star,
  Package,
  Camera,
  Plus,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";

const serviceSchema = z.object({
  // Vendor Information
  businessname: z.string().min(1, "Business name is required"),
  name: z.string().min(1, "Contact person name is required"),
  mobilenumber: z.string().min(10, "Valid mobile number is required"),
  email: z.string().email("Valid email is required"),
  
  // Service Information
  eventname: z.string().min(1, "Event type is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  
  // Pricing
  price: z.coerce.number().min(0, "Price must be positive"),
  priceUnit: z.string().min(1, "Price unit is required"),
  
  // Location & Experience
  location: z.string().min(1, "Location is required"),
  from: z.string().min(1, "Service area is required"),
  exprience: z.string().min(1, "Experience is required"),
  hours: z.string().min(1, "Working hours are required"),
  
  // Features & Menu
  features: z.string().optional(),
  menu: z.string().optional(),
  
  // Images
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const categories = [
  "Venue",
  "Catering", 
  "Decoration",
  "DJ",
  "Cakes",
  "Return Gift",
  "Photography",
  "Transport",
  "Wedding",
  "Birthday",
  "Corporate",
  "Orchestra"
];

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Anniversary",
  "Engagement",
  "Reception",
  "Baby Shower",
  "Graduation",
  "Conference",
  "Seminar",
  "Party",
  "Other"
];

const priceUnits = [
  { value: "fixed", label: "Fixed Price" },
  { value: "per_person", label: "Per Person" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "per_event", label: "Per Event" }
];

export default function PostOrder() {
  const [user, setUser] = useState<any>(null);
  const { userType } = useUserType();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string>("");
  const [uploadedCoverImage, setUploadedCoverImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      businessname: "",
      name: "",
      mobilenumber: "",
      email: "",
      eventname: "",
      description: "",
      category: "",
      subcategory: "",
      price: 0,
      priceUnit: "fixed",
      location: "",
      from: "",
      exprience: "",
      hours: "",
      features: "",
      menu: "",
    },
  });

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const path = `users/${user?.uid}/uploads/${Date.now()}_${index}_${file.name}`;
        return await uploadImage(file, path);
      });
      
      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      
      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleProfileImageUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      const path = `users/${user?.uid}/profile/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setUploadedProfileImage(url);
      form.setValue("profileImage", url);
      
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    }
  };

  const handleCoverImageUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      const path = `users/${user?.uid}/cover/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      setUploadedCoverImage(url);
      form.setValue("coverImage", url);
      
      toast({
        title: "Success",
        description: "Cover image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceFormData) => {
      if (!user) throw new Error("User not authenticated");
      
      const vendorData = {
        ...serviceData,
        vendorid: user.uid,
        image: uploadedProfileImage || "/placeholder-vendor.jpg",
        coverImage: uploadedCoverImage || "/placeholder-cover.jpg",
        menu: serviceData.menu ? serviceData.menu.split(',').map(item => item.trim()) : [],
        features: serviceData.features ? serviceData.features.split(',').map(f => f.trim()) : [],
        collections: uploadedImages,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
      };

      // Use Firebase directly instead of server API
      return await firebaseService.createPostorder(vendorData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service posted successfully! Your listing is now live.",
      });
      form.reset();
      setUploadedImages([]);
      setUploadedProfileImage("");
      setUploadedCoverImage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post service",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  // If user is a customer, show access denied
  if (userType === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Vendor Access Only</h1>
            <p className="text-gray-600 mb-6">
              This page is only available for vendors. Please switch to vendor mode to post services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Browse as Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to post a service</h2>
            <p className="text-gray-600">Please sign in to create a new service listing.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Service</h1>
          <p className="text-gray-600">Create a comprehensive service listing to attract customers</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="mobilenumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
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
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Service Details
            </CardTitle>
          </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map((eventType) => (
                              <SelectItem key={eventType} value={eventType}>
                                {eventType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your service in detail, including what makes you unique..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Unit *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {priceUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                    name="exprience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Area *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mumbai, Pune, Thane" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Hours *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 9 AM - 6 PM, Monday to Saturday" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Features & Menu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Features & Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Features (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Feature 1, Feature 2, Feature 3..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Items (comma-separated)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Item 1, Item 2, Item 3..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Images & Collections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Profile & Cover Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                      {uploadedProfileImage ? (
                        <div className="relative">
                          <img 
                            src={uploadedProfileImage} 
                            alt="Profile" 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => {
                              setUploadedProfileImage("");
                              form.setValue("profileImage", "");
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => profileImageRef.current?.click()}
                          className="w-20 h-20 flex flex-col items-center justify-center"
                        >
                          <Upload className="h-6 w-6" />
                        </Button>
                      )}
                      <input
                        ref={profileImageRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProfileImageUpload(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image
                    </label>
                    <div className="flex items-center space-x-4">
                      {uploadedCoverImage ? (
                        <div className="relative">
                          <img 
                            src={uploadedCoverImage} 
                            alt="Cover" 
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => {
                              setUploadedCoverImage("");
                              form.setValue("coverImage", "");
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => coverImageRef.current?.click()}
                          className="w-20 h-20 flex flex-col items-center justify-center"
                        >
                          <Upload className="h-6 w-6" />
                        </Button>
                      )}
                      <input
                        ref={coverImageRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverImageUpload(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Collections Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Photos (Multiple images)
                  </label>
                  <div className="space-y-4">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                    className="w-full"
                    >
                      {uploadingImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Collection Images
                        </>
                      )}
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                    />

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Collection ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                  </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
          </CardContent>
        </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  form.reset();
                  setUploadedImages([]);
                  setUploadedProfileImage("");
                  setUploadedCoverImage("");
                }}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={createServiceMutation.isPending}
                className="flex items-center gap-2 px-8"
                size="lg"
              >
                {createServiceMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Posting Service...
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4" />
                    Post Service
                  </>
                )}
              </Button>
        </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
