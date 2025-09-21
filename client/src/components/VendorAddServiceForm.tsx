import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, X, Upload, Image as ImageIcon, Trash2, Plus, Package, Percent } from "lucide-react";

interface MealPricing {
  originalPrice: number;
  price: number;
  discount: number; // percentage 0-100
}

interface PhotographyPricingItem {
  originalPrice: number;
  price: number;
  discount: number;
}

interface PhotographyPricing {
  perEvent: PhotographyPricingItem;
  perHour: PhotographyPricingItem;
}

interface DJPricingItem {
  originalPrice: number;
  price: number;
  discount: number;
}

interface DJPricing {
  perEvent: DJPricingItem;
  perHour: DJPricingItem;
}

interface DecorationPricing {
  originalPrice: number;
  price: number;
  discount: number;
  image?: string;
  features: string[];
}

interface CakesPricing {
  originalPrice: number;
  price: number;
  discount: number;
  image?: string;
  features: string[];
}

interface TravelArea {
  name: string;
  speciality: string;
}

interface TravelPricing {
  source: string;
  destination: string;
  pickupLocation: string;
  areas: TravelArea[];
  days: number;
  personPricing: {
    originalPrice: number;
    price: number;
    discount: number;
  };
  groupPricing: {
    groupSize: number;
    originalPrice: number;
    price: number;
    discount: number;
  };
  image?: string;
  features: string[];
}

interface PackageData {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  capacity: number;
  priceUnit: string;
  features: string[];
  isActive: boolean;
  // Optional detailed meal pricing for Catering
  meals?: {
    breakfast?: MealPricing;
    lunch?: MealPricing;
    dinner?: MealPricing;
  };
  // Optional photography pricing for Photography
  photography?: PhotographyPricing;
  // Optional DJ pricing for DJ
  dj?: DJPricing;
  // Optional decoration pricing for Decoration
  decoration?: DecorationPricing;
  // Optional cakes pricing for Cakes
  cakes?: CakesPricing;
  // Optional travel pricing for Travel
  travel?: TravelPricing;
  eventType?: 'per_event' | 'per_hour'; // For Photography
}

interface ServiceFormData {
  // Basic service info
  businessname: string;
  serviceName: string;
  description: string;
  category: string;
  subcategory: string;
  location: string;
  coverImage: string;
  image: string; // For backward compatibility
  upiQrImage?: string;
  
  // Contact details
  name: string;
  email: string;
  mobilenumber: string;
  
  // Service details
  serviceFeatures: string[];
  workingHours: string;
  serviceableCities: string[];
  exprience: string;
  
  // Collections and media
  collections: string[];
  menu: string[];
  features: string[]; // For backward compatibility
  
  // Packages
  packages: PackageData[];
  
  // Status
  isActive: boolean;
  isVerified: boolean;
}

interface VendorAddServiceFormProps {
  onSuccess: () => void;
  serviceId?: string;
  initialData?: Partial<ServiceFormData>;
}

const categories = [
  "Catering",
  "Wedding",
  "Decoration",
  "Photography",
  "Venue",
  "DJ",
  "Transportation",
  "Travel",
  "Makeup & Beauty",
  "Event Planning",
  "Cakes",
  "Flowers",
  "Lighting",
  "Security",
  "Birthday",
  "Corporate",
  "Other"
];

const priceUnits = [
  { value: "per_person", label: "Per Person" },
  { value: "fixed", label: "Fixed Price" },
  { value: "per_hour", label: "Per Hour" },
  { value: "per_day", label: "Per Day" },
  { value: "per_event", label: "Per Event" }
];

export default function VendorAddServiceForm({ onSuccess, serviceId, initialData }: VendorAddServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    // Basic service info
    businessname: "",
    serviceName: "",
    description: "",
    category: "",
    subcategory: "",
    location: "",
    coverImage: "",
    image: "",
    
    // Contact details
    name: "",
    email: "",
    mobilenumber: "",
    
    // Service details
    serviceFeatures: [],
    workingHours: "",
    serviceableCities: [],
    exprience: "",
    
    // Collections and media
    collections: [],
    menu: [],
    features: [],
    
    // Packages
    packages: [],
    
    // Status
    isActive: true,
    isVerified: false
  });
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentServiceFeature, setCurrentServiceFeature] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingUPI, setIsUploadingUPI] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<PackageData>({
    id: "",
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    capacity: 0,
    priceUnit: "per_person",
    features: [],
    isActive: true,
    meals: undefined,
    photography: undefined,
    dj: undefined,
    decoration: undefined,
    cakes: undefined,
    travel: undefined,
    eventType: undefined
  });
  const [isEditingPackage, setIsEditingPackage] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  // Live calculation state for Catering meal combos
  const [calcDays, setCalcDays] = useState<number>(1);
  const [calcInclude, setCalcInclude] = useState<{ breakfast: boolean; lunch: boolean; dinner: boolean }>({
    breakfast: true,
    lunch: true,
    dinner: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // When editing, prefill from initialData
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // ensure arrays are defined
        serviceFeatures: initialData.serviceFeatures || prev.serviceFeatures,
        serviceableCities: initialData.serviceableCities || prev.serviceableCities,
        collections: initialData.collections || prev.collections,
        menu: initialData.menu || prev.menu,
        features: initialData.features || prev.features,
        packages: (initialData as any).packages || prev.packages,
        coverImage: initialData.coverImage || prev.coverImage,
        image: initialData.image || prev.image,
        businessname: initialData.businessname || prev.businessname,
        serviceName: (initialData as any).serviceName || prev.serviceName,
        category: initialData.category || prev.category,
        subcategory: initialData.subcategory || prev.subcategory,
        description: initialData.description || prev.description,
        workingHours: (initialData as any).workingHours || prev.workingHours,
        exprience: (initialData as any).exprience || prev.exprience,
        location: initialData.location || prev.location,
        name: (initialData as any).name || prev.name,
        email: (initialData as any).email || prev.email,
        mobilenumber: (initialData as any).mobilenumber || prev.mobilenumber,
        isActive: initialData.isActive ?? prev.isActive,
        isVerified: initialData.isVerified ?? prev.isVerified,
      }));
    }
  }, [initialData]);

  const upsertServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      if (!auth.currentUser) throw new Error("User not authenticated");
      
      const serviceData = {
        // Basic service info
        businessname: data.businessname,
        serviceName: data.serviceName,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        location: data.location,
        coverImage: data.coverImage,
        image: data.coverImage, // For backward compatibility
        upiQrImage: data.upiQrImage || "",
        
        // Contact details
        name: data.name,
        email: data.email,
        mobilenumber: data.mobilenumber,
        
        // Service details
        serviceFeatures: data.serviceFeatures,
        workingHours: data.workingHours,
        serviceableCities: data.serviceableCities,
        exprience: data.exprience,
        
        // Collections and media
        collections: data.collections,
        menu: data.menu,
        features: data.features, // For backward compatibility
        
        // Packages (clean undefined values)
        packages: data.packages.map(pkg => {
          const cleanPkg = { ...pkg };
          if (cleanPkg.meals === undefined) delete cleanPkg.meals;
          if (cleanPkg.photography === undefined) delete cleanPkg.photography;
          if (cleanPkg.dj === undefined) delete cleanPkg.dj;
          if (cleanPkg.decoration === undefined) delete cleanPkg.decoration;
          if (cleanPkg.cakes === undefined) delete cleanPkg.cakes;
          if (cleanPkg.travel === undefined) delete cleanPkg.travel;
          if (cleanPkg.eventType === undefined) delete cleanPkg.eventType;
          return cleanPkg;
        }),
        
        // Status
        isActive: data.isActive,
        isVerified: data.isVerified,
        
        // Vendor info
        vendorid: auth.currentUser.uid,
        vendorId: auth.currentUser.uid, // For backward compatibility
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (serviceId) {
        // Update existing document
        await updateDoc(doc(db, "postorder", serviceId), serviceData as any);
        return { id: serviceId, ...serviceData } as any;
      } else {
        // Create new
        const docRef = await addDoc(collection(db, "postorder"), serviceData);
        return { id: docRef.id, ...serviceData } as any;
      }
    },
    onSuccess: () => {
      toast({
        title: serviceId ? "Saved!" : "Success!",
        description: serviceId ? "Service updated successfully" : "Service created successfully",
      });
      setFormData({
        // Basic service info
        businessname: "",
        serviceName: "",
        description: "",
        category: "",
        subcategory: "",
        location: "",
        coverImage: "",
        image: "",
        
        // Contact details
        name: "",
        email: "",
        mobilenumber: "",
        
        // Service details
        serviceFeatures: [],
        workingHours: "",
        serviceableCities: [],
        exprience: "",
        
        // Collections and media
        collections: [],
        menu: [],
        features: [],
        
        // Packages
        packages: [],
        
        // Status
        isActive: true,
        isVerified: false
      });
      queryClient.invalidateQueries({ queryKey: ["vendorCompanyProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["myPostorderServices"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Service Features handlers
  const addServiceFeature = () => {
    if (currentServiceFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceFeatures: [...prev.serviceFeatures, currentServiceFeature.trim()]
      }));
      setCurrentServiceFeature("");
    }
  };

  const removeServiceFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceFeatures: prev.serviceFeatures.filter((_, i) => i !== index)
    }));
  };

  // Serviceable Cities handlers
  const addCity = () => {
    if (currentCity.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceableCities: [...prev.serviceableCities, currentCity.trim()]
      }));
      setCurrentCity("");
    }
  };

  const removeCity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      serviceableCities: prev.serviceableCities.filter((_, i) => i !== index)
    }));
  };


  const handleCoverImageUpload = async (file: File) => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const imageRef = ref(storage, `services/${auth.currentUser.uid}/cover/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({
        ...prev,
        coverImage: downloadURL
      }));
      
      toast({
        title: "Success",
        description: "Cover image uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCollectionsUpload = async (files: FileList) => {
    if (!files.length) return;

    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
      }

      const imageRef = ref(storage, `services/${auth.currentUser?.uid}/collections/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const newImages = [...formData.collections, ...urls];
      setFormData(prev => ({
        ...prev,
        collections: newImages
      }));
      toast({
        title: "Success",
        description: `${urls.length} image(s) uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload images. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpiQrUpload = async (file: File) => {
    if (!auth.currentUser) {
      toast({ title: "Error", description: "Please sign in to upload images", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image size should be less than 5MB", variant: "destructive" });
      return;
    }
    setIsUploadingUPI(true);
    try {
      const imageRef = ref(storage, `services/${auth.currentUser.uid}/upi/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData(prev => ({ ...prev, upiQrImage: downloadURL }));
      toast({ title: "Success", description: "UPI QR uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message || "Failed to upload UPI QR", variant: "destructive" });
    } finally {
      setIsUploadingUPI(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!auth.currentUser) {
      toast({
        title: "Error",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const category = formData.category.toLowerCase();
      console.log(`🔄 Starting ${category} image upload...`);
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      const imageRef = ref(storage, `services/${auth.currentUser.uid}/${category}/${Date.now()}_${file.name}`);
      console.log('📂 Storage path:', imageRef.fullPath);
      
      console.log('📤 Uploading to Firebase Storage...');
      const snapshot = await uploadBytes(imageRef, file);
      console.log('✅ Upload successful:', snapshot.metadata.name);
      
      console.log('🔗 Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL generated');
      
      // Update the appropriate field based on category
      if (category === 'decoration') {
        updateDecorationField('image', downloadURL);
      } else if (category === 'cakes') {
        updateCakesField('image', downloadURL);
      } else if (category === 'travel') {
        updateTravelField('image', downloadURL);
      }
      
      toast({
        title: "Success",
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} image uploaded successfully`,
      });
    } catch (error: any) {
      console.error("❌ Upload error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeCollectionImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      collections: prev.collections.filter((_, i) => i !== index)
    }));
  };

  const resetPackageForm = () => {
      setCurrentPackage({
        id: "",
        name: "",
        description: "",
        price: 0,
        originalPrice: 0,
        discount: 0,
        capacity: 0,
        priceUnit: "per_person",
        features: [],
      isActive: true,
      meals: undefined,
      photography: undefined,
      dj: undefined,
      decoration: undefined,
      cakes: undefined,
      travel: undefined,
      eventType: undefined
    });
    setCalcDays(1);
    setCalcInclude({ breakfast: true, lunch: true, dinner: true });
    setIsEditingPackage(false);
    setEditingPackageId(null);
  };

  const addOrUpdatePackage = () => {
    if (!currentPackage.name.trim()) {
      toast({ title: "Error", description: "Please fill in package name", variant: "destructive" });
      return;
    }

    // If Catering with meal pricing provided, ensure at least one meal or base price
    const hasAnyMeal = !!currentPackage.meals && (
      !!currentPackage.meals.breakfast || !!currentPackage.meals.lunch || !!currentPackage.meals.dinner
    );
    if (formData.category === 'Catering' && !hasAnyMeal && currentPackage.price <= 0) {
      toast({ title: "Error", description: "Enter base price or at least one meal price", variant: "destructive" });
      return;
    }

    // If Photography, ensure at least one pricing option is provided
    if (formData.category === 'Photography') {
      const hasPerEventPricing = (currentPackage.photography?.perEvent?.originalPrice || 0) > 0 || (currentPackage.photography?.perEvent?.price || 0) > 0;
      const hasPerHourPricing = (currentPackage.photography?.perHour?.originalPrice || 0) > 0 || (currentPackage.photography?.perHour?.price || 0) > 0;
      
      if (!hasPerEventPricing && !hasPerHourPricing) {
        toast({ title: "Error", description: "Please provide pricing for at least one event type (Per Event or Per Hour)", variant: "destructive" });
        return;
      }

      // Set default values for Photography packages
      if (!currentPackage.capacity) {
        currentPackage.capacity = 1; // Default capacity for photography
      }
      if (!currentPackage.eventType) {
        // Set default event type based on which pricing is provided
        const hasPerEventPricing = (currentPackage.photography?.perEvent?.originalPrice || 0) > 0 || (currentPackage.photography?.perEvent?.price || 0) > 0;
        const hasPerHourPricing = (currentPackage.photography?.perHour?.originalPrice || 0) > 0 || (currentPackage.photography?.perHour?.price || 0) > 0;
        
        if (hasPerEventPricing && !hasPerHourPricing) {
          currentPackage.eventType = 'per_event';
        } else if (hasPerHourPricing && !hasPerEventPricing) {
          currentPackage.eventType = 'per_hour';
    } else {
          currentPackage.eventType = 'per_event'; // Default to per_event
        }
      }
      if (!currentPackage.priceUnit) {
        currentPackage.priceUnit = currentPackage.eventType === 'per_event' ? 'per_event' : 'per_hour';
      }
    }

    // If DJ, ensure at least one pricing option is provided
    if (formData.category === 'DJ') {
      const hasPerEventPricing = (currentPackage.dj?.perEvent?.originalPrice || 0) > 0 || (currentPackage.dj?.perEvent?.price || 0) > 0;
      const hasPerHourPricing = (currentPackage.dj?.perHour?.originalPrice || 0) > 0 || (currentPackage.dj?.perHour?.price || 0) > 0;
      
      if (!hasPerEventPricing && !hasPerHourPricing) {
        toast({ title: "Error", description: "Please provide pricing for at least one event type (Per Event or Per Hour)", variant: "destructive" });
        return;
      }

      // Set default values for DJ packages
      if (!currentPackage.capacity) {
        currentPackage.capacity = 1; // Default capacity for DJ
      }
      if (!currentPackage.eventType) {
        // Set default event type based on which pricing is provided
        const hasPerEventPricing = (currentPackage.dj?.perEvent?.originalPrice || 0) > 0 || (currentPackage.dj?.perEvent?.price || 0) > 0;
        const hasPerHourPricing = (currentPackage.dj?.perHour?.originalPrice || 0) > 0 || (currentPackage.dj?.perHour?.price || 0) > 0;
        
        if (hasPerEventPricing && !hasPerHourPricing) {
          currentPackage.eventType = 'per_event';
        } else if (hasPerHourPricing && !hasPerEventPricing) {
          currentPackage.eventType = 'per_hour';
        } else {
          currentPackage.eventType = 'per_event'; // Default to per_event
        }
      }
      if (!currentPackage.priceUnit) {
        currentPackage.priceUnit = currentPackage.eventType === 'per_event' ? 'per_event' : 'per_hour';
      }
    }

    // If Decoration, ensure pricing is provided
    if (formData.category === 'Decoration') {
      const hasDecorationPricing = (currentPackage.decoration?.originalPrice || 0) > 0 || (currentPackage.decoration?.price || 0) > 0;
      
      if (!hasDecorationPricing) {
        toast({ title: "Error", description: "Please provide pricing for the decoration package", variant: "destructive" });
        return;
      }

      // Set default values for Decoration packages
      if (!currentPackage.capacity) {
        currentPackage.capacity = 1; // Default capacity for decoration
      }
      if (!currentPackage.priceUnit) {
        currentPackage.priceUnit = 'per_event';
      }
    }

    // If Cakes, ensure pricing is provided
    if (formData.category === 'Cakes') {
      const hasCakesPricing = (currentPackage.cakes?.originalPrice || 0) > 0 || (currentPackage.cakes?.price || 0) > 0;
      
      if (!hasCakesPricing) {
        toast({ title: "Error", description: "Please provide pricing for the cakes package", variant: "destructive" });
        return;
      }

      // Set default values for Cakes packages
      if (!currentPackage.capacity) {
        currentPackage.capacity = 1; // Default capacity for cakes
      }
      if (!currentPackage.priceUnit) {
        currentPackage.priceUnit = 'per_event';
      }
    }

    // If Travel, ensure pricing is provided
    if (formData.category === 'Travel') {
      const hasPersonPricing = (currentPackage.travel?.personPricing?.originalPrice || 0) > 0 || (currentPackage.travel?.personPricing?.price || 0) > 0;
      const hasGroupPricing = (currentPackage.travel?.groupPricing?.originalPrice || 0) > 0 || (currentPackage.travel?.groupPricing?.price || 0) > 0;
      
      if (!hasPersonPricing && !hasGroupPricing) {
        toast({ title: "Error", description: "Please provide pricing for at least one option (Person or Group)", variant: "destructive" });
        return;
      }

      if (!currentPackage.travel?.source?.trim()) {
        toast({ title: "Error", description: "Please enter source location", variant: "destructive" });
        return;
      }

      if (!currentPackage.travel?.destination?.trim()) {
        toast({ title: "Error", description: "Please enter destination location", variant: "destructive" });
        return;
      }

      if (!currentPackage.travel?.pickupLocation?.trim()) {
        toast({ title: "Error", description: "Please enter pickup location", variant: "destructive" });
        return;
      }

      // Set default values for Travel packages
      if (!currentPackage.capacity) {
        currentPackage.capacity = 1; // Default capacity for travel
      }
      if (!currentPackage.priceUnit) {
        currentPackage.priceUnit = 'per_person';
      }
    }

    if (isEditingPackage && editingPackageId) {
      // Clean the package data by removing undefined values
      const cleanPackage = { ...currentPackage, id: editingPackageId };
      
      // Remove undefined fields that cause Firestore errors
      if (cleanPackage.meals === undefined) {
        delete cleanPackage.meals;
      }
      if (cleanPackage.photography === undefined) {
        delete cleanPackage.photography;
      }
      if (cleanPackage.dj === undefined) {
        delete cleanPackage.dj;
      }
      if (cleanPackage.decoration === undefined) {
        delete cleanPackage.decoration;
      }
      if (cleanPackage.cakes === undefined) {
        delete cleanPackage.cakes;
      }
      if (cleanPackage.travel === undefined) {
        delete cleanPackage.travel;
      }
      if (cleanPackage.eventType === undefined) {
        delete cleanPackage.eventType;
      }
      
      const nextPackages = formData.packages.map(p => p.id === editingPackageId ? cleanPackage : p);
      setFormData(prev => ({
        ...prev,
        packages: nextPackages
      }));
      if (serviceId) {
        updateDoc(doc(db, "postorder", serviceId), { packages: nextPackages, updatedAt: new Date() })
          .then(() => toast({ title: "Saved", description: "Package updated" }))
          .catch((err) => toast({ title: "Error", description: err.message || "Failed to save package", variant: "destructive" }));
      } else {
        toast({ title: "Saved", description: "Package updated" });
      }
    } else {
      // Clean the package data by removing undefined values
      const cleanPackage = { ...currentPackage, id: Date.now().toString() };
      
      // Remove undefined fields that cause Firestore errors
      if (cleanPackage.meals === undefined) {
        delete cleanPackage.meals;
      }
      if (cleanPackage.photography === undefined) {
        delete cleanPackage.photography;
      }
      if (cleanPackage.dj === undefined) {
        delete cleanPackage.dj;
      }
      if (cleanPackage.decoration === undefined) {
        delete cleanPackage.decoration;
      }
      if (cleanPackage.cakes === undefined) {
        delete cleanPackage.cakes;
      }
      if (cleanPackage.travel === undefined) {
        delete cleanPackage.travel;
      }
      if (cleanPackage.eventType === undefined) {
        delete cleanPackage.eventType;
      }
      
      const nextPackages = [...formData.packages, cleanPackage];
      setFormData(prev => ({
        ...prev,
        packages: nextPackages
      }));
      if (serviceId) {
        updateDoc(doc(db, "postorder", serviceId), { packages: nextPackages, updatedAt: new Date() })
          .then(() => toast({ title: "Success", description: "Package added successfully" }))
          .catch((err) => toast({ title: "Error", description: err.message || "Failed to add package", variant: "destructive" }));
      } else {
        toast({ title: "Success", description: "Package added successfully" });
      }
    }

    resetPackageForm();
    setShowPackageForm(false);
  };

  const removePackage = (packageId: string) => {
    const nextPackages = formData.packages.filter(pkg => pkg.id !== packageId);
    setFormData(prev => ({
      ...prev,
      packages: nextPackages
    }));
    if (serviceId) {
      updateDoc(doc(db, "postorder", serviceId), { packages: nextPackages, updatedAt: new Date() }).catch(() => {});
    }
  };

  const editPackage = (pkg: PackageData) => {
    setCurrentPackage(pkg);
    setIsEditingPackage(true);
    setEditingPackageId(pkg.id);
    setShowPackageForm(true);
  };

  const updatePackageField = (field: keyof PackageData, value: any) => {
    setCurrentPackage(prev => {
      const updatedPackage = {
        ...prev,
        [field]: value
      };
      
      // Auto-calculate discount when original price or price changes
      if (field === 'originalPrice' || field === 'price') {
        const originalPrice = field === 'originalPrice' ? value : prev.originalPrice;
        const price = field === 'price' ? value : prev.price;
        
        if (originalPrice > 0 && price > 0) {
          const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
          updatedPackage.discount = Math.max(0, discount);
        }
      }
      
      return updatedPackage;
    });
  };

  const updateMealField = (meal: 'breakfast' | 'lunch' | 'dinner', field: keyof MealPricing, value: number) => {
    setCurrentPackage(prev => {
      const meals = { ...(prev.meals || {}) } as NonNullable<PackageData['meals']>;
      const existing: MealPricing = { originalPrice: 0, price: 0, discount: 0, ...(meals[meal] || {}) };
      const next: MealPricing = { ...existing, [field]: value } as MealPricing;
      // Recalculate discount if original/price change
      if (field === 'originalPrice' || field === 'price') {
        const original = field === 'originalPrice' ? value : next.originalPrice;
        const discounted = field === 'price' ? value : next.price;
        if (original > 0 && discounted >= 0) {
          next.discount = Math.max(0, Math.round(((original - discounted) / original) * 100));
        }
      }
      meals[meal] = next;
      return { ...prev, meals } as PackageData;
    });
  };

  const updatePhotographyField = (eventType: 'perEvent' | 'perHour', field: keyof PhotographyPricingItem, value: number) => {
    setCurrentPackage(prev => {
      const photography = { ...(prev.photography || {}) } as NonNullable<PackageData['photography']>;
      const existing: PhotographyPricingItem = { 
        originalPrice: photography[eventType]?.originalPrice || 0, 
        price: photography[eventType]?.price || 0, 
        discount: photography[eventType]?.discount || 0 
      };
      const next: PhotographyPricingItem = { ...existing, [field]: value } as PhotographyPricingItem;
      // Recalculate discount if original/price change
      if (field === 'originalPrice' || field === 'price') {
        const original = field === 'originalPrice' ? value : next.originalPrice;
        const discounted = field === 'price' ? value : next.price;
        if (original > 0 && discounted >= 0) {
          next.discount = Math.max(0, Math.round(((original - discounted) / original) * 100));
        }
      }
      photography[eventType] = next;
      return { ...prev, photography } as PackageData;
    });
  };

  const updateDJField = (eventType: 'perEvent' | 'perHour', field: keyof DJPricingItem, value: number) => {
    setCurrentPackage(prev => {
      const dj = { ...(prev.dj || {}) } as NonNullable<PackageData['dj']>;
      const existing: DJPricingItem = { 
        originalPrice: dj[eventType]?.originalPrice || 0, 
        price: dj[eventType]?.price || 0, 
        discount: dj[eventType]?.discount || 0 
      };
      const next: DJPricingItem = { ...existing, [field]: value } as DJPricingItem;
      // Recalculate discount if original/price change
      if (field === 'originalPrice' || field === 'price') {
        const original = field === 'originalPrice' ? value : next.originalPrice;
        const discounted = field === 'price' ? value : next.price;
        if (original > 0 && discounted >= 0) {
          next.discount = Math.max(0, Math.round(((original - discounted) / original) * 100));
        }
      }
      dj[eventType] = next;
      return { ...prev, dj } as PackageData;
    });
  };

  const updateDecorationField = (field: keyof DecorationPricing, value: any) => {
    setCurrentPackage(prev => {
      const decoration = { ...(prev.decoration || {}) } as NonNullable<PackageData['decoration']>;
      const existing: DecorationPricing = { 
        originalPrice: decoration.originalPrice || 0, 
        price: decoration.price || 0, 
        discount: decoration.discount || 0,
        image: decoration.image || '',
        features: decoration.features || []
      };
      const next: DecorationPricing = { ...existing, [field]: value } as DecorationPricing;
      
      // Recalculate discount if original/price change
      if (field === 'originalPrice' || field === 'price') {
        const original = field === 'originalPrice' ? value : next.originalPrice;
        const discounted = field === 'price' ? value : next.price;
        if (original > 0 && discounted >= 0) {
          next.discount = Math.max(0, Math.round(((original - discounted) / original) * 100));
        }
      }
      
      return { ...prev, decoration: next } as PackageData;
    });
  };

  const updateCakesField = (field: keyof CakesPricing, value: any) => {
    setCurrentPackage(prev => {
      const cakes = { ...(prev.cakes || {}) } as NonNullable<PackageData['cakes']>;
      const existing: CakesPricing = { 
        originalPrice: cakes.originalPrice || 0, 
        price: cakes.price || 0, 
        discount: cakes.discount || 0,
        image: cakes.image || '',
        features: cakes.features || []
      };
      const next: CakesPricing = { ...existing, [field]: value } as CakesPricing;
      
      // Recalculate discount if original/price change
      if (field === 'originalPrice' || field === 'price') {
        const original = field === 'originalPrice' ? value : next.originalPrice;
        const discounted = field === 'price' ? value : next.price;
        if (original > 0 && discounted >= 0) {
          next.discount = Math.max(0, Math.round(((original - discounted) / original) * 100));
        }
      }
      
      return { ...prev, cakes: next } as PackageData;
    });
  };

  const updateTravelField = (field: keyof TravelPricing, value: any) => {
    setCurrentPackage(prev => {
      const travel = { ...(prev.travel || {}) } as NonNullable<PackageData['travel']>;
      const existing: TravelPricing = { 
        source: travel.source || '',
        destination: travel.destination || '',
        pickupLocation: travel.pickupLocation || '',
        areas: travel.areas || [],
        days: travel.days || 1,
        personPricing: travel.personPricing || { originalPrice: 0, price: 0, discount: 0 },
        groupPricing: travel.groupPricing || { groupSize: 1, originalPrice: 0, price: 0, discount: 0 },
        image: travel.image || '',
        features: travel.features || []
      };
      const next: TravelPricing = { ...existing, [field]: value } as TravelPricing;
      
      // Recalculate discount for person pricing
      if (field === 'personPricing') {
        const pricing = value as TravelPricing['personPricing'];
        if (pricing.originalPrice > 0 && pricing.price >= 0) {
          next.personPricing.discount = Math.max(0, Math.round(((pricing.originalPrice - pricing.price) / pricing.originalPrice) * 100));
        }
      }
      
      // Recalculate discount for group pricing
      if (field === 'groupPricing') {
        const pricing = value as TravelPricing['groupPricing'];
        if (pricing.originalPrice > 0 && pricing.price >= 0) {
          next.groupPricing.discount = Math.max(0, Math.round(((pricing.originalPrice - pricing.price) / pricing.originalPrice) * 100));
        }
      }
      
      return { ...prev, travel: next } as PackageData;
    });
  };

  const addTravelArea = () => {
    setCurrentPackage(prev => {
      const travel = prev.travel || {
        source: '',
        destination: '',
        pickupLocation: '',
        areas: [],
        days: 1,
        personPricing: { originalPrice: 0, price: 0, discount: 0 },
        groupPricing: { groupSize: 1, originalPrice: 0, price: 0, discount: 0 },
        image: '',
        features: []
      };
      return {
        ...prev,
        travel: {
          ...travel,
          areas: [...travel.areas, { name: '', speciality: '' }]
        }
      };
    });
  };

  const updateTravelArea = (index: number, field: keyof TravelArea, value: string) => {
    setCurrentPackage(prev => {
      const travel = prev.travel || {
        source: '',
        destination: '',
        pickupLocation: '',
        areas: [],
        days: 1,
        personPricing: { originalPrice: 0, price: 0, discount: 0 },
        groupPricing: { groupSize: 1, originalPrice: 0, price: 0, discount: 0 },
        image: '',
        features: []
      };
      const newAreas = [...travel.areas];
      newAreas[index] = { ...newAreas[index], [field]: value };
      return {
        ...prev,
        travel: {
          ...travel,
          areas: newAreas
        }
      };
    });
  };

  const removeTravelArea = (index: number) => {
    setCurrentPackage(prev => {
      const travel = prev.travel || {
        source: '',
        destination: '',
        pickupLocation: '',
        areas: [],
        days: 1,
        personPricing: { originalPrice: 0, price: 0, discount: 0 },
        groupPricing: { groupSize: 1, originalPrice: 0, price: 0, discount: 0 },
        image: '',
        features: []
      };
      return {
        ...prev,
        travel: {
          ...travel,
          areas: travel.areas.filter((_, i) => i !== index)
        }
      };
    });
  };

  const calculateMealTotals = () => {
    const meals = currentPackage.meals || {};
    const selected: Array<keyof typeof meals> = [
      calcInclude.breakfast ? 'breakfast' : undefined,
      calcInclude.lunch ? 'lunch' : undefined,
      calcInclude.dinner ? 'dinner' : undefined
    ].filter(Boolean) as any;
    let perDayOriginal = 0;
    let perDayDiscounted = 0;
    selected.forEach(m => {
      const mp = (meals as any)[m] as MealPricing | undefined;
      if (mp) {
        perDayOriginal += mp.originalPrice || 0;
        perDayDiscounted += mp.price || 0;
      }
    });
    return {
      perDayOriginal,
      perDayDiscounted,
      totalOriginal: perDayOriginal * Math.max(1, calcDays),
      totalDiscounted: perDayDiscounted * Math.max(1, calcDays)
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertServiceMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <Label htmlFor="businessname">Business Name *</Label>
          <Input
              id="businessname"
              value={formData.businessname}
              onChange={(e) => handleInputChange("businessname", e.target.value)}
              placeholder="e.g., Golden Banana Leaf Caterers"
            required
          />
        </div>
        
          <div>
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              value={formData.serviceName}
              onChange={(e) => handleInputChange("serviceName", e.target.value)}
              placeholder="e.g., Wedding Catering Service"
              required
            />
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>

      <div>
        <Label htmlFor="subcategory">Subcategory</Label>
        <Input
          id="subcategory"
          value={formData.subcategory}
          onChange={(e) => handleInputChange("subcategory", e.target.value)}
          placeholder="e.g., South Indian Catering"
        />
          </div>
      </div>

        <div className="mt-4">
        <Label htmlFor="description">Service Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your service in detail..."
          rows={4}
          required
        />
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
            <Label htmlFor="workingHours">Working Hours *</Label>
          <Input
              id="workingHours"
              value={formData.workingHours}
              onChange={(e) => handleInputChange("workingHours", e.target.value)}
              placeholder="e.g., 24/7, 9 AM - 6 PM"
            required
          />
        </div>
        
        <div>
            <Label htmlFor="exprience">Experience (Years) *</Label>
          <Input
              id="exprience"
              value={formData.exprience}
              onChange={(e) => handleInputChange("exprience", e.target.value)}
              placeholder="e.g., 5"
            required
          />
        </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="e.g., Chennai, Tamil Nadu"
            required
          />
        </div>
        </div>
        
      {/* Contact Information */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <Label htmlFor="name">Contact Person Name *</Label>
          <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., John Doe"
            required
          />
        </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="e.g., john@example.com"
              required
            />
      </div>

      <div>
            <Label htmlFor="mobilenumber">Mobile Number *</Label>
            <Input
              id="mobilenumber"
              value={formData.mobilenumber}
              onChange={(e) => handleInputChange("mobilenumber", e.target.value)}
              placeholder="e.g., 9876543210"
              required
            />
          </div>
        </div>
      </div>

      {/* Service Features */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Features</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={currentServiceFeature}
              onChange={(e) => setCurrentServiceFeature(e.target.value)}
              placeholder="Add a service feature (e.g., Free delivery, 24/7 support)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceFeature())}
            />
            <Button type="button" onClick={addServiceFeature} size="sm">
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.serviceFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                {feature}
                <button
                  type="button"
                  onClick={() => removeServiceFeature(index)}
                  className="ml-1 hover:bg-purple-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Serviceable Cities */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviceable Cities</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              placeholder="Add a city (e.g., Chennai, Bangalore)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
            />
            <Button type="button" onClick={addCity} size="sm">
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.serviceableCities.map((city, index) => (
              <div key={index} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                {city}
                <button
                  type="button"
                  onClick={() => removeCity(index)}
                  className="ml-1 hover:bg-orange-200 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Cover Image Upload */}
      <div>
        <Label>Cover Image *</Label>
        <div className="mt-2">
          {formData.coverImage ? (
            <div className="relative inline-block">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="cover-image" className="cursor-pointer">
                  <span className="text-sm text-gray-600">
                    Click to upload cover image
                  </span>
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleCoverImageUpload(e.target.files[0])}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collections Upload */}
      <div>
        <Label>Service Gallery (Collections)</Label>
        <div className="mt-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label htmlFor="collections" className="cursor-pointer">
                <span className="text-sm text-gray-600">
                  Click to upload multiple images
                </span>
                <input
                  id="collections"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handleCollectionsUpload(e.target.files)}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB each
            </p>
          </div>
          
          {/* Display uploaded collections */}
          {formData.collections.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.collections.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Collection ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeCollectionImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payments - UPI QR */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments</h3>
        <Label>Vendor UPI QR (Image)</Label>
        <div className="mt-2">
          {formData.upiQrImage ? (
            <div className="relative inline-block">
              <img src={formData.upiQrImage} alt="UPI QR" className="w-32 h-32 object-cover rounded-lg border" />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, upiQrImage: "" }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="upi-qr" className="cursor-pointer">
                  <span className="text-sm text-gray-600">Click to upload UPI QR image</span>
                  <input id="upi-qr" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpiQrUpload(e.target.files[0])} className="hidden" disabled={isUploadingUPI} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Packages Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold">Service Packages</Label>
          <Button
            type="button"
            onClick={() => setShowPackageForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Package
          </Button>
        </div>

        {/* Display existing packages */}
        {formData.packages.length > 0 ? (
          <div className="space-y-3">
            {formData.packages.map((pkg) => (
              <div key={pkg.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium">{pkg.name}</h4>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                    {/* Capacity and Unit - hide for Photography, DJ, Decoration, Cakes, and Travel */}
                    {formData.category !== 'Photography' && formData.category !== 'DJ' && formData.category !== 'Decoration' && formData.category !== 'Cakes' && formData.category !== 'Travel' && (
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="text-gray-500">Capacity:</span>
                        <span className="ml-1 font-medium">{pkg.capacity} people</span>
                        <span className="mx-2">•</span>
                        <span className="text-gray-500">Unit:</span>
                        <span className="ml-1">{(pkg.priceUnit || '').replace('_', ' ')}</span>
                      </div>
                    )}

                    {/* Meal-wise details for Catering */}
                    {formData.category === 'Catering' && (
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="grid grid-cols-3 gap-2 font-medium">
                          <div>Meal</div>
                          <div className="text-right">Original</div>
                          <div className="text-right">Discounted</div>
                      </div>
                        {(['breakfast','lunch','dinner'] as const).map(meal => {
                          const mp = (pkg.meals || {})[meal];
                          if (!mp) return null;
                          const label = meal[0].toUpperCase() + meal.slice(1);
                          return (
                            <div key={meal} className="grid grid-cols-3 gap-2">
                              <div>{label}</div>
                              <div className="text-right">₹{(mp.originalPrice||0).toLocaleString()}</div>
                              <div className="text-right text-blue-600">₹{(mp.price||0).toLocaleString()}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Photography pricing details */}
                    {formData.category === 'Photography' && pkg.photography && (
                      <div className="mt-2 space-y-3 text-sm">
                        <div className="font-medium text-gray-800">Photography Pricing</div>
                        
                        {/* Per Event Pricing */}
                        {(pkg.photography.perEvent?.originalPrice || pkg.photography.perEvent?.price) && (
                      <div>
                            <div className="font-medium text-gray-700 mb-1">Per Event</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>Original: ₹{(pkg.photography.perEvent.originalPrice || 0).toLocaleString()}</div>
                              <div>Discounted: ₹{(pkg.photography.perEvent.price || 0).toLocaleString()}</div>
                              <div>Discount: {pkg.photography.perEvent.discount || 0}%</div>
                      </div>
                          </div>
                        )}

                        {/* Per Hour Pricing */}
                        {(pkg.photography.perHour?.originalPrice || pkg.photography.perHour?.price) && (
                      <div>
                            <div className="font-medium text-gray-700 mb-1">Per Hour</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>Original: ₹{(pkg.photography.perHour.originalPrice || 0).toLocaleString()}</div>
                              <div>Discounted: ₹{(pkg.photography.perHour.price || 0).toLocaleString()}</div>
                              <div>Discount: {pkg.photography.perHour.discount || 0}%</div>
                      </div>
                    </div>
                        )}

                        {/* Event Type */}
                        {pkg.eventType && (
                          <div className="text-xs text-gray-500">
                            Event Type: {pkg.eventType === 'per_event' ? 'Per Event' : 'Per Hour'}
                    </div>
                        )}
                  </div>
                    )}

                    {/* DJ pricing details */}
                    {formData.category === 'DJ' && pkg.dj && (
                      <div className="mt-2 space-y-3 text-sm">
                        <div className="font-medium text-gray-800">DJ Pricing</div>
                        
                        {/* Per Event Pricing */}
                        {(pkg.dj.perEvent?.originalPrice || pkg.dj.perEvent?.price) && (
                      <div>
                            <div className="font-medium text-gray-700 mb-1">Per Event</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>Original: ₹{(pkg.dj.perEvent.originalPrice || 0).toLocaleString()}</div>
                              <div>Discounted: ₹{(pkg.dj.perEvent.price || 0).toLocaleString()}</div>
                              <div>Discount: {pkg.dj.perEvent.discount || 0}%</div>
                      </div>
                    </div>
                        )}

                        {/* Per Hour Pricing */}
                        {(pkg.dj.perHour?.originalPrice || pkg.dj.perHour?.price) && (
                      <div>
                            <div className="font-medium text-gray-700 mb-1">Per Hour</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>Original: ₹{(pkg.dj.perHour.originalPrice || 0).toLocaleString()}</div>
                              <div>Discounted: ₹{(pkg.dj.perHour.price || 0).toLocaleString()}</div>
                              <div>Discount: {pkg.dj.perHour.discount || 0}%</div>
                    </div>
                  </div>
                        )}

                        {/* Event Type */}
                        {pkg.eventType && (
                          <div className="text-xs text-gray-500">
                            Event Type: {pkg.eventType === 'per_event' ? 'Per Event' : 'Per Hour'}
                    </div>
                        )}
                  </div>
                    )}

                    {/* Decoration pricing details */}
                    {formData.category === 'Decoration' && pkg.decoration && (
                      <div className="mt-2 space-y-3 text-sm">
                        <div className="font-medium text-gray-800">Decoration Pricing</div>
                        
                        {/* Decoration Image */}
                        {pkg.decoration.image && (
                          <div className="mb-2">
                            <img 
                              src={pkg.decoration.image} 
                              alt="Decoration preview" 
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        
                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>Original: ₹{(pkg.decoration.originalPrice || 0).toLocaleString()}</div>
                          <div>Discounted: ₹{(pkg.decoration.price || 0).toLocaleString()}</div>
                          <div>Discount: {pkg.decoration.discount || 0}%</div>
                        </div>
                        
                        {/* Features */}
                        {pkg.decoration.features && pkg.decoration.features.length > 0 && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {pkg.decoration.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                  </div>
                    )}

                    {/* Cakes pricing details */}
                    {formData.category === 'Cakes' && pkg.cakes && (
                      <div className="mt-2 space-y-3 text-sm">
                        <div className="font-medium text-gray-800">Cakes Pricing</div>
                        
                        {/* Cakes Image */}
                        {pkg.cakes.image && (
                          <div className="mb-2">
                            <img 
                              src={pkg.cakes.image} 
                              alt="Cakes preview" 
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        
                        {/* Pricing */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>Original: ₹{(pkg.cakes.originalPrice || 0).toLocaleString()}</div>
                          <div>Discounted: ₹{(pkg.cakes.price || 0).toLocaleString()}</div>
                          <div>Discount: {pkg.cakes.discount || 0}%</div>
                        </div>
                        
                        {/* Features */}
                        {pkg.cakes.features && pkg.cakes.features.length > 0 && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {pkg.cakes.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                  </div>
                    )}

                    {/* Travel pricing details */}
                    {formData.category === 'Travel' && pkg.travel && (
                      <div className="mt-2 space-y-3 text-sm">
                        <div className="font-medium text-gray-800">Travel Package</div>
                        
                        {/* Travel Image */}
                        {pkg.travel.image && (
                          <div className="mb-2">
                            <img 
                              src={pkg.travel.image} 
                              alt="Travel preview" 
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        
                        {/* Route */}
                        <div className="font-medium text-blue-600">
                          {pkg.travel.source} → {pkg.travel.destination}
                        </div>
                        <div className="text-sm text-gray-600">
                          Pickup: {pkg.travel.pickupLocation}
                        </div>
                        
                        {/* Days */}
                        <div className="text-gray-600">
                          {pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}
                        </div>
                        
                        {/* Areas */}
                        {pkg.travel.areas && pkg.travel.areas.length > 0 && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Via:</div>
                            <div className="text-xs text-gray-500">
                              {pkg.travel.areas.map(area => area.name).join(' → ')}
                            </div>
                          </div>
                        )}
                        
                        {/* Person Pricing */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="font-medium text-gray-700">1 Person:</div>
                            <div>Original: ₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()}</div>
                            <div>Discounted: ₹{(pkg.travel.personPricing?.price || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">Group of {pkg.travel.groupPricing?.groupSize || 2}:</div>
                            <div>Original: ₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                            <div>Discounted: ₹{(pkg.travel.groupPricing?.price || 0).toLocaleString()}</div>
                          </div>
                        </div>
                        
                        {/* Features */}
                        {pkg.travel.features && pkg.travel.features.length > 0 && (
                          <div>
                            <div className="font-medium text-gray-700 mb-1">Features:</div>
                            <div className="flex flex-wrap gap-1">
                              {pkg.travel.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editPackage(pkg)}>
                      Edit
                    </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePackage(pkg.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">No packages added yet</p>
            <p className="text-sm text-gray-400">Click "Add Package" to create your first package</p>
          </div>
        )}
      </div>

      {/* Package Form Modal */}
      {showPackageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{isEditingPackage ? 'Edit Package' : 'Add New Package'}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPackageForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Package Name */}
              <div>
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  value={currentPackage.name}
                  onChange={(e) => updatePackageField("name", e.target.value)}
                  placeholder="e.g., Non-Veg Package for 200 people"
                  required
                />
              </div>

              {/* Package Description */}
              <div>
                <Label htmlFor="packageDescription">Description</Label>
                <Textarea
                  id="packageDescription"
                  value={currentPackage.description}
                  onChange={(e) => updatePackageField("description", e.target.value)}
                  placeholder="Describe what's included in this package..."
                  rows={3}
                />
              </div>

              {/* Pricing - hide base fields for Catering, Photography, DJ, Decoration, Cakes, and Travel; show for other categories */}
              {formData.category !== 'Catering' && formData.category !== 'Photography' && formData.category !== 'DJ' && formData.category !== 'Decoration' && formData.category !== 'Cakes' && formData.category !== 'Travel' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={currentPackage.originalPrice}
                    onChange={(e) => updatePackageField("originalPrice", parseInt(e.target.value) || 0)}
                    placeholder="0"
                      required={formData.category !== 'Catering'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="packagePrice">Discounted Price (₹) *</Label>
                  <Input
                    id="packagePrice"
                    type="number"
                    value={currentPackage.price}
                    onChange={(e) => updatePackageField("price", parseInt(e.target.value) || 0)}
                    placeholder="0"
                      required={formData.category !== 'Catering'}
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <div className="relative">
                    <Input
                      id="discount"
                      type="number"
                      value={currentPackage.discount}
                      onChange={(e) => updatePackageField("discount", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="pr-8"
                    />
                    <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              )}

              {/* Catering meal pricing - shown only if category is Catering */}
              {formData.category === 'Catering' && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Meal-wise Pricing (optional)</h4>
                  {(['breakfast','lunch','dinner'] as const).map(meal => (
                    <div key={meal} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>{meal[0].toUpperCase() + meal.slice(1)} Original (₹)</Label>
                        <Input type="number" value={currentPackage.meals?.[meal]?.originalPrice || 0} onChange={(e) => updateMealField(meal, 'originalPrice', parseInt(e.target.value) || 0)} placeholder="0" />
                      </div>
                      <div>
                        <Label>{meal[0].toUpperCase() + meal.slice(1)} Discounted (₹)</Label>
                        <Input type="number" value={currentPackage.meals?.[meal]?.price || 0} onChange={(e) => updateMealField(meal, 'price', parseInt(e.target.value) || 0)} placeholder="0" />
                      </div>
                      <div>
                        <Label>{meal[0].toUpperCase() + meal.slice(1)} Discount (%)</Label>
                        <Input type="number" value={currentPackage.meals?.[meal]?.discount || 0} onChange={(e) => updateMealField(meal, 'discount', parseInt(e.target.value) || 0)} placeholder="0" />
                      </div>
                    </div>
                  ))}

                  {/* Live calculation */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Label>Days</Label>
                        <Input type="number" value={calcDays} onChange={(e) => setCalcDays(Math.max(1, parseInt(e.target.value) || 1))} className="w-24" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={calcInclude.breakfast} onChange={(e) => setCalcInclude(prev => ({ ...prev, breakfast: e.target.checked }))} />
                        <Label>Breakfast</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={calcInclude.lunch} onChange={(e) => setCalcInclude(prev => ({ ...prev, lunch: e.target.checked }))} />
                        <Label>Lunch</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={calcInclude.dinner} onChange={(e) => setCalcInclude(prev => ({ ...prev, dinner: e.target.checked }))} />
                        <Label>Dinner</Label>
                      </div>
                    </div>

                    {(() => {
                      const meals = currentPackage.meals || {};
                      const rows: Array<{ label: string; enabled: boolean; original: number; discounted: number }>= [
                        { label: 'Breakfast', enabled: calcInclude.breakfast, original: meals.breakfast?.originalPrice || 0, discounted: meals.breakfast?.price || 0 },
                        { label: 'Lunch', enabled: calcInclude.lunch, original: meals.lunch?.originalPrice || 0, discounted: meals.lunch?.price || 0 },
                        { label: 'Dinner', enabled: calcInclude.dinner, original: meals.dinner?.originalPrice || 0, discounted: meals.dinner?.price || 0 },
                      ];
                      const perDayOriginal = rows.filter(r=>r.enabled).reduce((s,r)=>s+r.original,0);
                      const perDayDiscounted = rows.filter(r=>r.enabled).reduce((s,r)=>s+r.discounted,0);
                      const totalOriginal = perDayOriginal * Math.max(1, calcDays);
                      const totalDiscounted = perDayDiscounted * Math.max(1, calcDays);

                      return (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-3 gap-2 font-medium">
                            <div>Per Day</div>
                            <div className="text-right">Original</div>
                            <div className="text-right">Discounted</div>
                          </div>

                          {rows.map(row => row.enabled && (
                            <div key={row.label} className="grid grid-cols-3 gap-2">
                              <div>{row.label}</div>
                              <div className="text-right">₹{row.original.toLocaleString()}</div>
                              <div className="text-right text-blue-600">₹{row.discounted.toLocaleString()}</div>
                            </div>
                          ))}

                          <div className="grid grid-cols-3 gap-2 border-t pt-2 font-semibold">
                            <div>Total ({calcDays} day{calcDays>1?'s':''})</div>
                            <div className="text-right">₹{totalOriginal.toLocaleString()}</div>
                            <div className="text-right text-blue-600">₹{totalDiscounted.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Photography pricing - shown only if category is Photography */}
              {formData.category === 'Photography' && (
                <div className="mt-4 space-y-6">
                  <h4 className="font-semibold text-gray-900">Photography Pricing</h4>
                  

                  {/* Per Event Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Per Event Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perEvent?.originalPrice || 0} 
                          onChange={(e) => updatePhotographyField('perEvent', 'originalPrice', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perEvent?.price || 0} 
                          onChange={(e) => updatePhotographyField('perEvent', 'price', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perEvent?.discount || 0} 
                          onChange={(e) => updatePhotographyField('perEvent', 'discount', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Per Hour Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Per Hour Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price per Hour (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perHour?.originalPrice || 0} 
                          onChange={(e) => updatePhotographyField('perHour', 'originalPrice', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discounted Price per Hour (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perHour?.price || 0} 
                          onChange={(e) => updatePhotographyField('perHour', 'price', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.photography?.perHour?.discount || 0} 
                          onChange={(e) => updatePhotographyField('perHour', 'discount', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live calculation for Photography */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Label>{currentPackage.eventType === 'per_event' ? 'Days' : 'Hours'}</Label>
                        <Input 
                          type="number" 
                          value={calcDays} 
                          onChange={(e) => setCalcDays(Math.max(1, parseInt(e.target.value) || 1))} 
                          className="w-24" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Event Type</Label>
                        <Select value={currentPackage.eventType || 'per_event'} onValueChange={(value) => updatePackageField("eventType", value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_event">Per Event</SelectItem>
                            <SelectItem value="per_hour">Per Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      {currentPackage.eventType === 'per_event' ? (
                        <div>
                          <div className="font-medium">Per Event Calculation:</div>
                          <div>Original: ₹{(currentPackage.photography?.perEvent?.originalPrice || 0).toLocaleString()}</div>
                          <div>Discounted: ₹{(currentPackage.photography?.perEvent?.price || 0).toLocaleString()}</div>
                          <div className="font-semibold text-green-600">
                            Total: ₹{(currentPackage.photography?.perEvent?.price || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Note: Per Event pricing is fixed regardless of duration
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">Per Hour Calculation:</div>
                          <div>Original per hour: ₹{(currentPackage.photography?.perHour?.originalPrice || 0).toLocaleString()}</div>
                          <div>Discounted per hour: ₹{(currentPackage.photography?.perHour?.price || 0).toLocaleString()}</div>
                          <div className="font-semibold text-green-600">
                            Total for {calcDays} hours: ₹{((currentPackage.photography?.perHour?.price || 0) * calcDays).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DJ pricing - shown only if category is DJ */}
              {formData.category === 'DJ' && (
                <div className="mt-4 space-y-6">
                  <h4 className="font-semibold text-gray-900">DJ Pricing</h4>
                  

                  {/* Per Event Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Per Event Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perEvent?.originalPrice || 0} 
                          onChange={(e) => updateDJField('perEvent', 'originalPrice', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perEvent?.price || 0} 
                          onChange={(e) => updateDJField('perEvent', 'price', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perEvent?.discount || 0} 
                          onChange={(e) => updateDJField('perEvent', 'discount', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Per Hour Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Per Hour Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price per Hour (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perHour?.originalPrice || 0} 
                          onChange={(e) => updateDJField('perHour', 'originalPrice', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discounted Price per Hour (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perHour?.price || 0} 
                          onChange={(e) => updateDJField('perHour', 'price', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.dj?.perHour?.discount || 0} 
                          onChange={(e) => updateDJField('perHour', 'discount', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live calculation for DJ */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Label>{currentPackage.eventType === 'per_event' ? 'Days' : 'Hours'}</Label>
                        <Input 
                          type="number" 
                          value={calcDays} 
                          onChange={(e) => setCalcDays(Math.max(1, parseInt(e.target.value) || 1))} 
                          className="w-24" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label>Event Type</Label>
                        <Select value={currentPackage.eventType || 'per_event'} onValueChange={(value) => updatePackageField("eventType", value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_event">Per Event</SelectItem>
                            <SelectItem value="per_hour">Per Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-2">Live Calculation:</div>
                      {(() => {
                        const perEventPrice = currentPackage.dj?.perEvent?.price || currentPackage.dj?.perEvent?.originalPrice || 0;
                        const perHourPrice = currentPackage.dj?.perHour?.price || currentPackage.dj?.perHour?.originalPrice || 0;
                        const days = calcDays;
                        
                        if (currentPackage.eventType === 'per_event') {
                          return (
                            <div className="space-y-1">
                              <div>Per Event: ₹{perEventPrice.toLocaleString()}</div>
                              <div className="font-semibold text-blue-600">
                                Total for {days} day{days > 1 ? 's' : ''}: ₹{(perEventPrice * days).toLocaleString()}
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div className="space-y-1">
                              <div>Per Hour: ₹{perHourPrice.toLocaleString()}</div>
                              <div className="font-semibold text-blue-600">
                                Total for {days} hour{days > 1 ? 's' : ''}: ₹{(perHourPrice * days).toLocaleString()}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Decoration pricing - shown only if category is Decoration */}
              {formData.category === 'Decoration' && (
                <div className="mt-4 space-y-6">
                  <h4 className="font-semibold text-gray-900">Decoration Pricing</h4>
                  
                  {/* Decoration Image with Beautiful UI */}
                  <div className="space-y-3">
                    <Label>Decoration Image</Label>
                    <div className="relative">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          currentPackage.decoration?.image 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleImageUpload(files[0]);
                          }
                        }}
                      >
                        {currentPackage.decoration?.image ? (
                          <div className="space-y-4">
                            <img 
                              src={currentPackage.decoration.image} 
                              alt="Decoration preview" 
                              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                            />
                            <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✓ Image uploaded successfully</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateDecorationField('image', '')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-gray-700">Upload Decoration Image</p>
                              <p className="text-sm text-gray-500">Drag and drop your image here, or click to browse</p>
                              <div className="flex items-center justify-center">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                  }}
                                  className="hidden"
                                  id="decoration-image-upload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById('decoration-image-upload')?.click()}
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <>
                                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Choose File
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.decoration?.originalPrice || 0} 
                          onChange={(e) => updateDecorationField('originalPrice', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.decoration?.price || 0} 
                          onChange={(e) => updateDecorationField('price', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input 
                          type="number" 
                          value={currentPackage.decoration?.discount || 0} 
                          onChange={(e) => updateDecorationField('discount', parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  </div>


                  {/* Live calculation for Decoration */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-2">Live Calculation:</div>
                      <div className="space-y-1">
                        <div>Original Price: ₹{(currentPackage.decoration?.originalPrice || 0).toLocaleString()}</div>
                        <div>Discounted Price: ₹{(currentPackage.decoration?.price || 0).toLocaleString()}</div>
                        <div className="font-semibold text-blue-600">
                          Final Price: ₹{(currentPackage.decoration?.price || currentPackage.decoration?.originalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cakes pricing - shown only if category is Cakes */}
              {formData.category === 'Cakes' && (
                <div className="mt-4 space-y-6">
                  <h4 className="font-semibold text-gray-900">Cakes Pricing</h4>
                  
                  {/* Cakes Image with Beautiful UI */}
                  <div className="space-y-3">
                    <Label>Cakes Image</Label>
                    <div className="relative">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          currentPackage.cakes?.image 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleImageUpload(files[0]);
                          }
                        }}
                      >
                        {currentPackage.cakes?.image ? (
                          <div className="space-y-4">
                            <img 
                              src={currentPackage.cakes.image} 
                              alt="Cakes preview" 
                              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                            />
                            <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✓ Image uploaded successfully</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateCakesField('image', '')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-600">Drag & drop an image here, or click to select</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('cakes-image-upload')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Choose Image
                              </Button>
                            </div>
                          </div>
                        )}
                        <input
                          id="cakes-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.cakes?.originalPrice || 0}
                          onChange={(e) => updateCakesField('originalPrice', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.cakes?.price || 0}
                          onChange={(e) => updateCakesField('price', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={currentPackage.cakes?.discount || 0}
                          onChange={(e) => updateCakesField('discount', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live calculation for Cakes */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-2">Live Calculation:</div>
                      <div className="space-y-1">
                        <div>Original Price: ₹{(currentPackage.cakes?.originalPrice || 0).toLocaleString()}</div>
                        <div>Discounted Price: ₹{(currentPackage.cakes?.price || 0).toLocaleString()}</div>
                        <div className="font-semibold text-blue-600">
                          Final Price: ₹{(currentPackage.cakes?.price || currentPackage.cakes?.originalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Travel pricing - shown only if category is Travel */}
              {formData.category === 'Travel' && (
                <div className="mt-4 space-y-6">
                  <h4 className="font-semibold text-gray-900">Travel Package Details</h4>
                  
                  {/* Travel Image with Beautiful UI */}
                  <div className="space-y-3">
                    <Label>Travel Image</Label>
                    <div className="relative">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          currentPackage.travel?.image 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                          const files = e.dataTransfer.files;
                          if (files.length > 0) {
                            handleImageUpload(files[0]);
                          }
                        }}
                      >
                        {currentPackage.travel?.image ? (
                          <div className="space-y-4">
                            <img 
                              src={currentPackage.travel.image} 
                              alt="Travel preview" 
                              className="w-32 h-32 object-cover rounded-lg mx-auto border-2 border-white shadow-lg"
                            />
                            <div className="space-y-2">
                              <p className="text-sm text-green-600 font-medium">✓ Image uploaded successfully</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateTravelField('image', '')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-gray-600">Drag & drop an image here, or click to select</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('travel-image-upload')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Choose Image
                              </Button>
                            </div>
                          </div>
                        )}
                        <input
                          id="travel-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Source, Destination and Pickup Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Source Location *</Label>
                      <Input
                        value={currentPackage.travel?.source || ''}
                        onChange={(e) => updateTravelField('source', e.target.value)}
                        placeholder="e.g., Chennai"
                        required
                      />
                    </div>
                    <div>
                      <Label>Destination Location *</Label>
                      <Input
                        value={currentPackage.travel?.destination || ''}
                        onChange={(e) => updateTravelField('destination', e.target.value)}
                        placeholder="e.g., Goa"
                        required
                      />
                    </div>
                    <div>
                      <Label>Pickup Location *</Label>
                      <Input
                        value={currentPackage.travel?.pickupLocation || ''}
                        onChange={(e) => updateTravelField('pickupLocation', e.target.value)}
                        placeholder="e.g., Chennai Central Station"
                        required
                      />
                    </div>
                  </div>

                  {/* Number of Days */}
                  <div>
                    <Label>Number of Days *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentPackage.travel?.days || 1}
                      onChange={(e) => updateTravelField('days', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      required
                    />
                  </div>

                  {/* Areas in Between */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Areas in Between</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTravelArea}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Area
                      </Button>
                    </div>
                    
                    {currentPackage.travel?.areas?.map((area, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-gray-50">
                        <div>
                          <Label>Area Name</Label>
                          <Input
                            value={area.name}
                            onChange={(e) => updateTravelArea(index, 'name', e.target.value)}
                            placeholder="e.g., Bangalore"
                          />
                        </div>
                        <div>
                          <Label>Speciality</Label>
                          <Input
                            value={area.speciality}
                            onChange={(e) => updateTravelArea(index, 'speciality', e.target.value)}
                            placeholder="e.g., Meenakshi amman Temple View for 1 Hour"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTravelArea(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Person Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">For 1 Person Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.personPricing?.originalPrice || 0}
                          onChange={(e) => updateTravelField('personPricing', {
                            ...currentPackage.travel?.personPricing,
                            originalPrice: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.personPricing?.price || 0}
                          onChange={(e) => updateTravelField('personPricing', {
                            ...currentPackage.travel?.personPricing,
                            price: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.personPricing?.discount || 0}
                          onChange={(e) => updateTravelField('personPricing', {
                            ...currentPackage.travel?.personPricing,
                            discount: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Group Pricing */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-800">For Group Pricing</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label>Group Size</Label>
                        <Input
                          type="number"
                          min="2"
                          value={currentPackage.travel?.groupPricing?.groupSize || 2}
                          onChange={(e) => updateTravelField('groupPricing', {
                            ...currentPackage.travel?.groupPricing,
                            groupSize: parseInt(e.target.value) || 2
                          })}
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.groupPricing?.originalPrice || 0}
                          onChange={(e) => updateTravelField('groupPricing', {
                            ...currentPackage.travel?.groupPricing,
                            originalPrice: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discounted Price (₹)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.groupPricing?.price || 0}
                          onChange={(e) => updateTravelField('groupPricing', {
                            ...currentPackage.travel?.groupPricing,
                            price: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Discount (%)</Label>
                        <Input
                          type="number"
                          value={currentPackage.travel?.groupPricing?.discount || 0}
                          onChange={(e) => updateTravelField('groupPricing', {
                            ...currentPackage.travel?.groupPricing,
                            discount: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live calculation for Travel */}
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-2">Live Calculation:</div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-medium text-gray-600">For 1 Person ({currentPackage.travel?.days || 1} day{(currentPackage.travel?.days || 1) > 1 ? 's' : ''}):</div>
                            <div>Original: ₹{(currentPackage.travel?.personPricing?.originalPrice || 0).toLocaleString()}</div>
                            <div>Discounted: ₹{(currentPackage.travel?.personPricing?.price || 0).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">For Group of {currentPackage.travel?.groupPricing?.groupSize || 2}:</div>
                            <div>Original: ₹{(currentPackage.travel?.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                            <div>Discounted: ₹{(currentPackage.travel?.groupPricing?.price || 0).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="border-t pt-2">
                          <div className="font-semibold text-blue-600">
                            Route: {currentPackage.travel?.source || 'Source'} → {currentPackage.travel?.destination || 'Destination'}
                          </div>
                          {currentPackage.travel?.areas && currentPackage.travel.areas.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Via: {currentPackage.travel.areas.map(area => area.name).join(' → ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Capacity and Price Unit - hide for Photography, DJ, Decoration, Cakes, and Travel */}
              {formData.category !== 'Photography' && formData.category !== 'DJ' && formData.category !== 'Decoration' && formData.category !== 'Cakes' && formData.category !== 'Travel' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="packageCapacity">Capacity (People) *</Label>
                  <Input
                    id="packageCapacity"
                    type="number"
                    value={currentPackage.capacity}
                    onChange={(e) => updatePackageField("capacity", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="packagePriceUnit">Price Unit *</Label>
                  <Select 
                    value={currentPackage.priceUnit} 
                    onValueChange={(value) => updatePackageField("priceUnit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceUnits.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              )}

              {/* Package Features */}
              <div>
                <Label>Package Features</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature (e.g., Free delivery, Setup included)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            updatePackageField("features", [...currentPackage.features, input.value.trim()]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder*="Add a feature"]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          updatePackageField("features", [...currentPackage.features, input.value.trim()]);
                          input.value = "";
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {feature}
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = currentPackage.features.filter((_, i) => i !== index);
                            updatePackageField("features", newFeatures);
                          }}
                          className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Package Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="packageActive"
                  checked={currentPackage.isActive}
                  onChange={(e) => updatePackageField("isActive", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="packageActive">Package is active and available for booking</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPackageForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addOrUpdatePackage}
                disabled={!currentPackage.name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditingPackage ? 'Save Changes' : 'Add Package'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={upsertServiceMutation.isPending || isUploading || !formData.coverImage}
        >
          {upsertServiceMutation.isPending ? (
            serviceId ? "Saving..." : "Creating Service..."
          ) : isUploading ? (
            "Uploading Images..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {serviceId ? "Save Changes" : "Create Service"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
