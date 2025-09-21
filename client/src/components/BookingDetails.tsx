import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Package, Users, DollarSign, Calendar, MapPin, User, Phone, Mail, Home, Camera, Music } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuthRequired } from '@/hooks/useAuthRequired';

interface BookingDetailsProps {
  vendor: {
    id: string;
    name: string;
    businessname: string;
    packages: any[];
    preSelectedPackage?: any;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface BookingFormData {
  // Personal Information
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  aadharNumber: string;
  
  // Event Information
  eventDate: string;
  numberOfGuests: number;
  eventLocation: string;
  eventDescription: string;
  
  // Travel Information
  travelStartDate: string;
  travelEndDate: string;
  memberCount: number;
  queries: string;
  
  // Package Selection
  selectedPackages: any[];
  // Per-package meal selection (for catering packages)
  selectedMeals: { [packageId: string]: { breakfast: boolean; lunch: boolean; dinner: boolean } };
  // Per-package photography selection (for photography packages)
  selectedPhotography: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  // Per-package DJ selection (for DJ packages)
  selectedDJ: { [packageId: string]: { eventType: 'per_event' | 'per_hour'; hours: number } };
  // Per-package decoration selection (for decoration packages)
  selectedDecoration: { [packageId: string]: { quantity: number } };
  // Per-package cakes selection (for cakes packages)
  selectedCakes: { [packageId: string]: { quantity: number } };
  // Per-package travel selection (for travel packages)
  selectedTravel: { [packageId: string]: { pricingType: 'person' | 'group'; groupSize?: number } };
  
  // Negotiation
  isNegotiating: boolean;
  negotiatedPrice: number;
  aiSuggestedPrice: number;
  mealDiscounts: { [key: string]: { original: number; discounted: number; discountPercent: number; aiDiscount: number; finalDiscount: number } };
  renegotiationCount: number;
  showRenegotiate: boolean;
  isFinalOffer: boolean;
  firstOfferPrice?: number;
  negotiationFinalized: boolean;
  userBudget: number;
  finalOfferApplied: boolean;
}

export default function BookingDetails({ vendor, isOpen, onClose }: BookingDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthRequired();
  
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    aadharNumber: '',
    eventDate: '',
    numberOfGuests: 0,
    eventLocation: '',
    eventDescription: '',
    travelStartDate: '',
    travelEndDate: '',
    memberCount: 1,
    queries: '',
    selectedPackages: [],
    selectedMeals: {},
    selectedPhotography: {},
    selectedDJ: {},
    selectedDecoration: {},
    selectedCakes: {},
    selectedTravel: {},
    isNegotiating: false,
    negotiatedPrice: 0,
    aiSuggestedPrice: 0,
    mealDiscounts: {},
    renegotiationCount: 0,
    showRenegotiate: false,
    isFinalOffer: false,
    negotiationFinalized: false,
    userBudget: 0,
    finalOfferApplied: false
  });

  // Debug: Log vendor data when component mounts or vendor changes
  useEffect(() => {
    console.log("BookingDetails - Vendor data:", vendor);
    console.log("BookingDetails - Packages:", vendor?.packages);
    console.log("BookingDetails - Packages length:", vendor?.packages?.length);
    console.log("BookingDetails - Pre-selected package:", vendor?.preSelectedPackage);
    console.log("BookingDetails - All vendor keys:", vendor ? Object.keys(vendor) : []);
    if (vendor?.packages) {
      console.log("BookingDetails - First package:", vendor.packages[0]);
      console.log("BookingDetails - All packages:", vendor.packages);
    } else {
      console.log("BookingDetails - NO PACKAGES FOUND!");
    }
  }, [vendor]);

  // Handle pre-selected package
  useEffect(() => {
    if (vendor?.preSelectedPackage && isOpen) {
      console.log("BookingDetails - Auto-selecting package:", vendor.preSelectedPackage);
      
      // Find the package in the packages array by ID or name
      const packageToSelect = vendor.packages?.find((pkg: any) => 
        pkg.id === vendor.preSelectedPackage.id || 
        pkg.name === vendor.preSelectedPackage.name
      );
      
      if (packageToSelect) {
        console.log("BookingDetails - Found package to select:", packageToSelect);
        setFormData(prev => ({
          ...prev,
          selectedPackages: [packageToSelect]
        }));
      } else {
        console.log("BookingDetails - Could not find package to select");
      }
    }
  }, [vendor?.preSelectedPackage, isOpen, vendor?.packages]);

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Apply vendor's full discount as the final offer using AI negotiation logic
  const handleApplyFinalOffer = () => {
    const invoice = calculateInvoice();
    if (!invoice) return;
    
    // Generate AI suggested price with final offer (uses total vendor discount)
    const { totalDiscountedPrice, mealDiscounts } = generateAISuggestedPrice(formData.selectedPackages, false, true);
    
    setFormData(prev => ({
      ...prev,
      aiSuggestedPrice: totalDiscountedPrice,
      negotiatedPrice: totalDiscountedPrice,
      mealDiscounts: mealDiscounts,
      isNegotiating: false,
      showRenegotiate: false,
      isFinalOffer: false,
      negotiationFinalized: true
    }));
    
    toast({
      title: "Final Offer Applied",
      description: `Applied vendor's total discount. Final total: ₹${totalDiscountedPrice.toLocaleString()} (+ fee).`,
    });
  };

  const handlePackageToggle = (packageId: string, isSelected: boolean) => {
    if (!vendor.packages) return;
    
    const packageToToggle = vendor.packages.find((pkg: any) => 
      (pkg.id || pkg.packageName) === packageId
    );
    
    if (!packageToToggle) return;
    
    setFormData(prev => {
      if (isSelected) {
        // Add package if not already selected
        const isAlreadySelected = prev.selectedPackages.some(selected => 
          (selected.id || selected.packageName) === packageId
        );
        if (!isAlreadySelected) {
          const newState = {
            ...prev,
            selectedPackages: [...prev.selectedPackages, packageToToggle]
          };
          
          // Initialize meal selection for catering packages
          if (packageToToggle.meals) {
            newState.selectedMeals = {
              ...prev.selectedMeals,
              [packageId]: { breakfast: true, lunch: true, dinner: true }
            };
          }
          
          // Initialize photography selection for photography packages
          if (packageToToggle.photography) {
            newState.selectedPhotography = {
              ...prev.selectedPhotography,
              [packageId]: { eventType: 'per_event', hours: 1 }
            };
          }
          
          // Initialize DJ selection for DJ packages
          if (packageToToggle.dj) {
            newState.selectedDJ = {
              ...prev.selectedDJ,
              [packageId]: { eventType: 'per_event', hours: 1 }
            };
          }
          
          // Initialize decoration selection for decoration packages
          if (packageToToggle.decoration) {
            newState.selectedDecoration = {
              ...prev.selectedDecoration,
              [packageId]: { quantity: 1 }
            };
          }
          
          // Initialize cakes selection for cakes packages
          if (packageToToggle.cakes) {
            newState.selectedCakes = {
              ...prev.selectedCakes,
              [packageId]: { quantity: 1 }
            };
          }
          
          // Initialize travel selection for travel packages
          if (packageToToggle.travel) {
            newState.selectedTravel = {
              ...prev.selectedTravel,
              [packageId]: { pricingType: 'person' }
            };
          }
          
          return newState;
        }
      } else {
        // Remove package
        return {
          ...prev,
          selectedPackages: prev.selectedPackages.filter(selected => 
            (selected.id || selected.packageName) !== packageId
          ),
          selectedMeals: Object.fromEntries(
            Object.entries(prev.selectedMeals).filter(([id]) => id !== packageId)
          )
        };
      }
      return prev;
    });
  };

  const handleMealToggle = (
    packageId: string,
    meal: 'breakfast' | 'lunch' | 'dinner',
    checked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      selectedMeals: {
        ...prev.selectedMeals,
        [packageId]: {
          breakfast: prev.selectedMeals[packageId]?.breakfast ?? true,
          lunch: prev.selectedMeals[packageId]?.lunch ?? true,
          dinner: prev.selectedMeals[packageId]?.dinner ?? true,
          [meal]: checked
        } as any
      }
    }));
  };

  // Handle photography selection change
  const handlePhotographyChange = (packageId: string, eventType: 'per_event' | 'per_hour', hours: number = 1) => {
    setFormData(prev => ({
      ...prev,
      selectedPhotography: {
        ...prev.selectedPhotography,
        [packageId]: { eventType, hours }
      }
    }));
  };

  // Handle DJ selection change
  const handleDJChange = (packageId: string, eventType: 'per_event' | 'per_hour', hours: number = 1) => {
    setFormData(prev => ({
      ...prev,
      selectedDJ: {
        ...prev.selectedDJ,
        [packageId]: { eventType, hours }
      }
    }));
  };

  // Handle decoration selection change
  const handleDecorationChange = (packageId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      selectedDecoration: {
        ...prev.selectedDecoration,
        [packageId]: { quantity }
      }
    }));
  };

  const handleCakesChange = (packageId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      selectedCakes: {
        ...prev.selectedCakes,
        [packageId]: { quantity }
      }
    }));
  };

  const handleTravelChange = (packageId: string, pricingType: 'person' | 'group', groupSize?: number) => {
    setFormData(prev => ({
      ...prev,
      selectedTravel: {
        ...prev.selectedTravel,
        [packageId]: { pricingType, groupSize }
      }
    }));
  };

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      // Build a filtered version of selected packages with only the selected meals
      const filteredPackages = (data.selectedPackages || []).map((pkg: any) => {
        if (!pkg?.meals) return pkg;
        const packageId = pkg.id || pkg.packageName || '';
        const selection = (data as any).selectedMeals?.[packageId] || { breakfast: true, lunch: true, dinner: true };
        const filteredMeals: any = {};
        (['breakfast','lunch','dinner'] as const).forEach((meal) => {
          if (selection[meal] && pkg.meals?.[meal]) {
            filteredMeals[meal] = pkg.meals[meal];
          }
        });
        return { ...pkg, meals: filteredMeals };
      });

      // Summary for quick CRM rendering
      const selectedMealsSummary = (data.selectedPackages || []).map((pkg: any) => {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = (data as any).selectedMeals?.[packageId] || { breakfast: true, lunch: true, dinner: true };
        const mealsChosen = (['breakfast','lunch','dinner'] as const).filter(m => selection[m]);
        return { packageId, packageName: pkg.name || pkg.packageName, meals: mealsChosen };
      });

      const bookingData = {
        // Customer details
        customerId: user?.uid, // Add customer ID for better querying
        customerName: data.fullName,
        customerPhone: data.phoneNumber,
        customerEmail: data.email,
        customerAddress: data.address,
        
        // Event details
        eventDate: data.eventDate,
        numberOfGuests: data.numberOfGuests,
        eventLocation: data.eventLocation,
        eventDescription: data.eventDescription,
        
        // Travel details
        travelStartDate: data.travelStartDate,
        travelEndDate: data.travelEndDate,
        memberCount: data.memberCount,
        aadharNumber: data.aadharNumber,
        queries: data.queries,
        
        // Vendor details
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorBusiness: vendor.businessname,
        
        // Package details
        selectedPackages: data.selectedPackages,
        selectedMeals: (data as any).selectedMeals || {},
        selectedPhotography: (data as any).selectedPhotography || {},
        selectedDJ: (data as any).selectedDJ || {},
        selectedDecoration: (data as any).selectedDecoration || {},
        selectedCakes: (data as any).selectedCakes || {},
        selectedTravel: Object.fromEntries(
          Object.entries((data as any).selectedTravel || {}).map(([key, value]: [string, any]) => [
            key, 
            value && typeof value === 'object' 
              ? Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== undefined))
              : value
          ])
        ),
        packagesWithSelectedMeals: filteredPackages,
        selectedMealsSummary,
        
        // Booking status
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Calculate final amount including negotiation and budget overrides
      const invoice = calculateInvoice();
      let finalAmount = invoice?.finalTotal || 0;
      
      // Priority: userBudget > negotiatedPrice > actual
      if (formData.negotiationFinalized && formData.userBudget > 0) {
        finalAmount = formData.userBudget + (invoice?.convenienceFee || 0);
      } else if (formData.negotiatedPrice > 0 && !formData.isNegotiating) {
        finalAmount = formData.negotiatedPrice + (invoice?.convenienceFee || 0);
      }
      
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        totalAmount: finalAmount,
        paidAmount: 0,
        remainingAmount: finalAmount,
        // Store negotiation details
        negotiatedPrice: formData.negotiatedPrice > 0 ? formData.negotiatedPrice : null,
        userBudget: formData.userBudget > 0 ? formData.userBudget : null,
        originalPrice: invoice?.subtotal || 0,
        convenienceFee: invoice?.convenienceFee || 0,
        isNegotiated: (formData.negotiatedPrice > 0 && !formData.isNegotiating) || (formData.userBudget > 0)
      });
      
      // Create notification for vendor
      const hasPhotographyPackage = data.selectedPackages.some((pkg: any) => pkg.photography);
      const hasCateringPackage = data.selectedPackages.some((pkg: any) => pkg.meals);
      const hasDJPackage = data.selectedPackages.some((pkg: any) => pkg.dj);
      const hasDecorationPackage = data.selectedPackages.some((pkg: any) => pkg.decoration);
      const hasCakesPackage = data.selectedPackages.some((pkg: any) => pkg.cakes);
      const hasTravelPackage = data.selectedPackages.some((pkg: any) => pkg.travel);
      
      let notificationMessage = '';
      if (hasPhotographyPackage && hasCateringPackage && hasDJPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography, Catering, DJ & Decoration services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasCateringPackage && hasDJPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography, Catering & DJ services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasCateringPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography, Catering & Decoration services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasDJPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography, DJ & Decoration services. Please review and respond.`;
      } else if (hasCateringPackage && hasDJPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Catering, DJ & Decoration services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasCateringPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography & Catering services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasDJPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography & DJ services. Please review and respond.`;
      } else if (hasPhotographyPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Photography & Decoration services. Please review and respond.`;
      } else if (hasCateringPackage && hasDJPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Catering & DJ services. Please review and respond.`;
      } else if (hasCateringPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Catering & Decoration services. Please review and respond.`;
      } else if (hasDJPackage && hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, DJ & Decoration services. Please review and respond.`;
      } else if (hasPhotographyPackage) {
        notificationMessage = `${data.fullName} has requested a photography booking for ${vendor.businessname}. Event: ${data.eventDate}. Please review and respond.`;
      } else if (hasCateringPackage) {
        notificationMessage = `${data.fullName} has requested a catering booking for ${vendor.businessname}. Event: ${data.eventDate}, Guests: ${data.numberOfGuests}. Please review and respond.`;
      } else if (hasDJPackage) {
        notificationMessage = `${data.fullName} has requested a DJ booking for ${vendor.businessname}. Event: ${data.eventDate}. Please review and respond.`;
      } else if (hasDecorationPackage) {
        notificationMessage = `${data.fullName} has requested a decoration booking for ${vendor.businessname}. Event: ${data.eventDate}. Please review and respond.`;
      } else if (hasCakesPackage) {
        notificationMessage = `${data.fullName} has requested a cakes booking for ${vendor.businessname}. Event: ${data.eventDate}. Please review and respond.`;
      } else if (hasTravelPackage) {
        notificationMessage = `${data.fullName} has requested a travel booking for ${vendor.businessname}. Event: ${data.eventDate}. Please review and respond.`;
      } else {
        notificationMessage = `${data.fullName} has requested a booking for ${vendor.businessname}. Event: ${data.eventDate}, Guests: ${data.numberOfGuests}. Please review and respond.`;
      }
      
      await addDoc(collection(db, 'notifications'), {
        userId: vendor.id, // This should be the Firebase Auth UID of the vendor
        type: 'booking',
        title: 'New Booking Request',
        message: notificationMessage,
        data: { 
          bookingId: docRef.id, 
          customerId: data.email,
          customerName: data.fullName,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          numberOfGuests: data.numberOfGuests,
          // Travel details
          travelStartDate: data.travelStartDate,
          travelEndDate: data.travelEndDate,
          memberCount: data.memberCount,
          aadharNumber: data.aadharNumber,
          queries: data.queries,
          totalAmount: finalAmount,
          selectedPackages: filteredPackages,
          selectedMeals: (data as any).selectedMeals || {},
          selectedPhotography: (data as any).selectedPhotography || {},
        selectedDJ: (data as any).selectedDJ || {},
        selectedDecoration: (data as any).selectedDecoration || {},
        selectedCakes: (data as any).selectedCakes || {},
        selectedTravel: Object.fromEntries(
          Object.entries((data as any).selectedTravel || {}).map(([key, value]: [string, any]) => [
            key, 
            value && typeof value === 'object' 
              ? Object.fromEntries(Object.entries(value).filter(([_, v]) => v !== undefined))
              : value
          ])
        ),
          selectedMealsSummary,
          negotiatedPrice: formData.negotiatedPrice > 0 ? formData.negotiatedPrice : null,
          userBudget: formData.userBudget > 0 ? formData.userBudget : null,
          originalPrice: invoice?.subtotal || 0,
          convenienceFee: invoice?.convenienceFee || 0,
          isNegotiated: (formData.negotiatedPrice > 0 && !formData.isNegotiating) || (formData.userBudget > 0)
        },
        isRead: false,
        createdAt: new Date()
      });
      
      return { id: docRef.id, ...bookingData };
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Submitted!",
        description: `Your booking has been submitted successfully. Order ID: ${data.id}`,
      });
      
      // Store customer email for notifications
      localStorage.setItem('customerEmail', formData.email);
      
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        eventDate: '',
        numberOfGuests: 0,
        eventLocation: '',
        eventDescription: '',
        selectedPackages: [],
        selectedMeals: {},
        selectedPhotography: {},
        selectedDJ: {},
        selectedDecoration: {},
        selectedCakes: {},
        selectedTravel: {},
      travelStartDate: '',
      travelEndDate: '',
      memberCount: 1,
      queries: '',
        aadharNumber: '',
        isNegotiating: false,
        negotiatedPrice: 0,
        aiSuggestedPrice: 0,
        mealDiscounts: {},
        renegotiationCount: 0,
        showRenegotiate: false,
        isFinalOffer: false,
        negotiationFinalized: false,
        userBudget: 0,
        finalOfferApplied: false
      });
      
      onClose();
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all personal information fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if this is a Travel package and validate Aadhar Number
    const hasTravelPackage = formData.selectedPackages.some(pkg => pkg.travel);
    if (hasTravelPackage && !formData.aadharNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in your Aadhar Number for travel booking.",
        variant: "destructive",
      });
      return;
    }
    
    if (hasTravelPackage) {
      // Validate Travel-specific fields
      if (!formData.travelStartDate || !formData.travelEndDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all travel information fields.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validate Event-specific fields for non-Travel packages
      if (!formData.eventDate || !formData.eventLocation || !formData.eventDescription) {
        toast({
          title: "Missing Information",
          description: "Please fill in all event information fields.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Only validate numberOfGuests for non-Photography, non-DJ, non-Decoration, and non-Cakes packages
    const hasPhotographyOrDJPackage = formData.selectedPackages.some(pkg => pkg.photography || pkg.dj || pkg.decoration || pkg.cakes || pkg.travel);
    if (!hasPhotographyOrDJPackage && formData.numberOfGuests <= 0) {
      toast({
        title: "Missing Information",
        description: "Please enter the number of guests.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.selectedPackages.length === 0) {
      toast({
        title: "No Packages Selected",
        description: "Please select at least one package.",
        variant: "destructive",
      });
      return;
    }
    
    createBookingMutation.mutate(formData);
  };

  // Calculate invoice totals
  const calculateInvoice = () => {
    if (formData.selectedPackages.length === 0) return null;
    
    const subtotal = formData.selectedPackages.reduce((sum, pkg) => {
      // For catering packages with meals, calculate total of all meal original prices
      if (pkg.meals) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedMeals[packageId] || { breakfast: true, lunch: true, dinner: true };
        const mealTotal = (['breakfast', 'lunch', 'dinner'] as const).reduce((mealSum, meal) => {
          if (!selection[meal]) return mealSum;
          const mealPrice = pkg.meals?.[meal]?.originalPrice || 0;
          return mealSum + mealPrice;
    }, 0);
        return sum + mealTotal;
      }
      // For photography packages, calculate based on selected event type and hours
      if (pkg.photography) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedPhotography[packageId] || { eventType: 'per_event', hours: 1 };
        
        if (selection.eventType === 'per_event') {
          return sum + (pkg.photography.perEvent?.originalPrice || 0);
        } else {
          const hourlyPrice = pkg.photography.perHour?.originalPrice || 0;
          return sum + (hourlyPrice * selection.hours);
        }
      }
      // For DJ packages, calculate based on selected event type and hours
      if (pkg.dj) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedDJ[packageId] || { eventType: 'per_event', hours: 1 };
        
        if (selection.eventType === 'per_event') {
          return sum + (pkg.dj.perEvent?.originalPrice || 0);
        } else {
          const hourlyPrice = pkg.dj.perHour?.originalPrice || 0;
          return sum + (hourlyPrice * selection.hours);
        }
      }
      // For decoration packages, calculate based on quantity
      if (pkg.decoration) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedDecoration[packageId] || { quantity: 1 };
        const decorationPrice = pkg.decoration.originalPrice || 0;
        return sum + (decorationPrice * selection.quantity);
      }
      // For cakes packages, calculate based on quantity
      if (pkg.cakes) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedCakes[packageId] || { quantity: 1 };
        const cakesPrice = pkg.cakes.originalPrice || 0;
        return sum + (cakesPrice * selection.quantity);
      }
      // For travel packages, calculate based on pricing type
      if (pkg.travel) {
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedTravel[packageId] || { pricingType: 'person' };
        
        if (selection.pricingType === 'person') {
          return sum + ((pkg.travel.personPricing?.originalPrice || 0) * formData.memberCount);
        } else {
          return sum + (pkg.travel.groupPricing?.originalPrice || 0);
        }
      }
      // For non-catering/non-photography/non-DJ/non-decoration/non-cakes/non-travel packages, use original price
      return sum + (pkg.originalPrice || pkg.price || 0);
    }, 0);
    
    // No discount calculation for meal-wise pricing
    const totalDiscount = 0;
    
    const convenienceFee = subtotal * 0.01; // 1% convenience fee
    
    // If negotiating, use negotiated meals price + convenience fee
    let finalTotal = subtotal + convenienceFee;
    if (formData.isNegotiating && formData.negotiatedPrice > 0) {
      finalTotal = formData.negotiatedPrice + convenienceFee;
    }
    
    return {
      subtotal,
      totalDiscount,
      convenienceFee,
      finalTotal,
      packages: formData.selectedPackages
    };
  };

  // Generate AI-suggested price using vendor's discount as base
  const generateAISuggestedPrice = (packages: any[], isRenegotiation: boolean = false, isFinalOffer: boolean = false) => {
    let totalDiscountedPrice = 0;
    const mealDiscounts: { [key: string]: { original: number; discounted: number; discountPercent: number; aiDiscount: number; finalDiscount: number; isFixedPrice: boolean } } = {};
    
    packages.forEach((pkg, pkgIndex) => {
      if (pkg.meals) {
        // Use vendor's discount as base for AI negotiation
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedMeals[packageId] || { breakfast: true, lunch: true, dinner: true };
        (['breakfast', 'lunch', 'dinner'] as const).forEach((meal) => {
          if (!selection[meal]) return;
          const mealData = pkg.meals[meal];
          if (mealData && mealData.originalPrice > 0) {
            const vendorDiscountPercent = mealData.discount || 0; // Vendor's discount percentage
            
            // Check if vendor has 0% discount (fixed price)
            if (vendorDiscountPercent === 0) {
              const mealKey = `${pkg.name}_${meal}`;
              mealDiscounts[mealKey] = {
                original: mealData.originalPrice,
                discounted: mealData.originalPrice,
                discountPercent: 0,
                aiDiscount: 0,
                finalDiscount: 0,
                isFixedPrice: true
              };
              totalDiscountedPrice += mealData.originalPrice;
              return;
            }
            
            let aiDiscountPercent;
            if (isFinalOffer) {
              // Final offer: Use total vendor discount
              aiDiscountPercent = vendorDiscountPercent / 100;
            } else if (isRenegotiation) {
              // Renegotiation: Use 50% of vendor's discount
              aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
            } else {
              // First negotiation: Use 20% of vendor's discount
              aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
            }
            
            const discountedPrice = Math.round(mealData.originalPrice * (1 - aiDiscountPercent));
            
            // Ensure minimum profitability (at least 10% margin from original price)
            const minProfitablePrice = Math.round(mealData.originalPrice * 0.9);
            const finalPrice = Math.max(discountedPrice, minProfitablePrice);
            
            // Calculate final discount percentage from original price
            const finalDiscountPercent = Math.round(((mealData.originalPrice - finalPrice) / mealData.originalPrice) * 100);
            
            // Store discount details for this meal
            const mealKey = `${pkg.name}_${meal}`;
            mealDiscounts[mealKey] = {
              original: mealData.originalPrice,
              discounted: finalPrice,
              discountPercent: vendorDiscountPercent, // Show vendor's discount
              aiDiscount: Math.round(aiDiscountPercent * 100), // Show AI discount applied
              finalDiscount: finalDiscountPercent, // Show total discount applied
              isFixedPrice: false
            };
            
            totalDiscountedPrice += finalPrice;
          }
        });
      } else if (pkg.photography) {
        // Handle Photography packages using vendor's discount as base
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedPhotography[packageId] || { eventType: 'per_event', hours: 1 };
        
        let originalPrice = 0;
        let vendorDiscountPercent = 0;
        
        if (selection.eventType === 'per_event') {
          originalPrice = pkg.photography.perEvent?.originalPrice || 0;
          vendorDiscountPercent = pkg.photography.perEvent?.discount || 0;
        } else {
          originalPrice = (pkg.photography.perHour?.originalPrice || 0) * selection.hours;
          vendorDiscountPercent = pkg.photography.perHour?.discount || 0;
        }
        
        if (originalPrice > 0) {
          // Check if vendor has 0% discount (fixed price)
          if (vendorDiscountPercent === 0) {
            const pkgKey = `${pkg.name}_photography`;
            mealDiscounts[pkgKey] = {
              original: originalPrice,
              discounted: originalPrice,
              discountPercent: 0,
              aiDiscount: 0,
              finalDiscount: 0,
              isFixedPrice: true
            };
            totalDiscountedPrice += originalPrice;
            return;
          }
          
          let aiDiscountPercent;
          if (isFinalOffer) {
            // Final offer: Use total vendor discount
            aiDiscountPercent = vendorDiscountPercent / 100;
          } else if (isRenegotiation) {
            // Renegotiation: Use 50% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
          } else {
            // First negotiation: Use 20% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
          }
          
          const discountedPrice = Math.round(originalPrice * (1 - aiDiscountPercent));
          const minProfitablePrice = Math.round(originalPrice * 0.9);
          const finalPrice = Math.max(discountedPrice, minProfitablePrice);
          const finalDiscountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
          
          const pkgKey = `${pkg.name}_photography`;
          mealDiscounts[pkgKey] = {
            original: originalPrice,
            discounted: finalPrice,
            discountPercent: vendorDiscountPercent,
            aiDiscount: Math.round(aiDiscountPercent * 100),
            finalDiscount: finalDiscountPercent,
            isFixedPrice: false
          };
          
          totalDiscountedPrice += finalPrice;
        }
      } else if (pkg.dj) {
        // Handle DJ packages using vendor's discount as base
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedDJ[packageId] || { eventType: 'per_event', hours: 1 };
        
        let originalPrice = 0;
        let vendorDiscountPercent = 0;
        
        if (selection.eventType === 'per_event') {
          originalPrice = pkg.dj.perEvent?.originalPrice || 0;
          vendorDiscountPercent = pkg.dj.perEvent?.discount || 0;
        } else {
          originalPrice = (pkg.dj.perHour?.originalPrice || 0) * selection.hours;
          vendorDiscountPercent = pkg.dj.perHour?.discount || 0;
        }
        
        if (originalPrice > 0) {
          // Check if vendor has 0% discount (fixed price)
          if (vendorDiscountPercent === 0) {
            const pkgKey = `${pkg.name}_dj`;
            mealDiscounts[pkgKey] = {
              original: originalPrice,
              discounted: originalPrice,
              discountPercent: 0,
              aiDiscount: 0,
              finalDiscount: 0,
              isFixedPrice: true
            };
            totalDiscountedPrice += originalPrice;
            return;
          }
          
          let aiDiscountPercent;
          if (isFinalOffer) {
            // Final offer: Use total vendor discount
            aiDiscountPercent = vendorDiscountPercent / 100;
          } else if (isRenegotiation) {
            // Renegotiation: Use 50% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
          } else {
            // First negotiation: Use 20% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
          }
          
          const discountedPrice = Math.round(originalPrice * (1 - aiDiscountPercent));
          const minProfitablePrice = Math.round(originalPrice * 0.9);
          const finalPrice = Math.max(discountedPrice, minProfitablePrice);
          const finalDiscountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
          
          const pkgKey = `${pkg.name}_dj`;
          mealDiscounts[pkgKey] = {
            original: originalPrice,
            discounted: finalPrice,
            discountPercent: vendorDiscountPercent,
            aiDiscount: Math.round(aiDiscountPercent * 100),
            finalDiscount: finalDiscountPercent,
            isFixedPrice: false
          };
          
          totalDiscountedPrice += finalPrice;
        }
      } else if (pkg.decoration) {
        // Handle Decoration packages using vendor's discount as base
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedDecoration[packageId] || { quantity: 1 };
        
        const originalPrice = (pkg.decoration.originalPrice || 0) * selection.quantity;
        const vendorDiscountPercent = pkg.decoration.discount || 0;
        
        if (originalPrice > 0) {
          // Check if vendor has 0% discount (fixed price)
          if (vendorDiscountPercent === 0) {
            const pkgKey = `${pkg.name}_decoration`;
            mealDiscounts[pkgKey] = {
              original: originalPrice,
              discounted: originalPrice,
              discountPercent: 0,
              aiDiscount: 0,
              finalDiscount: 0,
              isFixedPrice: true
            };
            totalDiscountedPrice += originalPrice;
            return;
          }
          
          let aiDiscountPercent;
          if (isFinalOffer) {
            // Final offer: Use total vendor discount
            aiDiscountPercent = vendorDiscountPercent / 100;
          } else if (isRenegotiation) {
            // Renegotiation: Use 50% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
          } else {
            // First negotiation: Use 20% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
          }
          
          const discountedPrice = Math.round(originalPrice * (1 - aiDiscountPercent));
          const minProfitablePrice = Math.round(originalPrice * 0.9);
          const finalPrice = Math.max(discountedPrice, minProfitablePrice);
          const finalDiscountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
          
          const pkgKey = `${pkg.name}_decoration`;
          mealDiscounts[pkgKey] = {
            original: originalPrice,
            discounted: finalPrice,
            discountPercent: vendorDiscountPercent,
            aiDiscount: Math.round(aiDiscountPercent * 100),
            finalDiscount: finalDiscountPercent,
            isFixedPrice: false
          };
          
          totalDiscountedPrice += finalPrice;
        }
      } else if (pkg.cakes) {
        // Handle Cakes packages using vendor's discount as base
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedCakes[packageId] || { quantity: 1 };
        
        const originalPrice = (pkg.cakes.originalPrice || 0) * selection.quantity;
        const vendorDiscountPercent = pkg.cakes.discount || 0;
        
        if (originalPrice > 0) {
          // Check if vendor has 0% discount (fixed price)
          if (vendorDiscountPercent === 0) {
            const pkgKey = `${pkg.name}_cakes`;
            mealDiscounts[pkgKey] = {
              original: originalPrice,
              discounted: originalPrice,
              discountPercent: 0,
              aiDiscount: 0,
              finalDiscount: 0,
              isFixedPrice: true
            };
            totalDiscountedPrice += originalPrice;
            return;
          }
          
          let aiDiscountPercent;
          if (isFinalOffer) {
            // Final offer: Use total vendor discount
            aiDiscountPercent = vendorDiscountPercent / 100;
          } else if (isRenegotiation) {
            // Renegotiation: Use 50% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
          } else {
            // First negotiation: Use 20% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
          }
          
          const discountedPrice = Math.round(originalPrice * (1 - aiDiscountPercent));
          const minProfitablePrice = Math.round(originalPrice * 0.9);
          const finalPrice = Math.max(discountedPrice, minProfitablePrice);
          const finalDiscountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
          
          const pkgKey = `${pkg.name}_cakes`;
          mealDiscounts[pkgKey] = {
            original: originalPrice,
            discounted: finalPrice,
            discountPercent: vendorDiscountPercent,
            aiDiscount: Math.round(aiDiscountPercent * 100),
            finalDiscount: finalDiscountPercent,
            isFixedPrice: false
          };
          
          totalDiscountedPrice += finalPrice;
        }
      }
      else if (pkg.travel) {
        // Handle Travel packages using vendor's discount as base
        const packageId = pkg.id || pkg.packageName || '';
        const selection = formData.selectedTravel[packageId] || { pricingType: 'person' };
        
        let originalPrice = 0;
        let vendorDiscountPercent = 0;
        
        if (selection.pricingType === 'person') {
          originalPrice = (pkg.travel.personPricing?.originalPrice || 0) * formData.memberCount;
          vendorDiscountPercent = pkg.travel.personPricing?.discount || 0;
        } else {
          originalPrice = pkg.travel.groupPricing?.originalPrice || 0;
          vendorDiscountPercent = pkg.travel.groupPricing?.discount || 0;
        }
        
        if (originalPrice > 0) {
          // Check if vendor has 0% discount (fixed price)
          if (vendorDiscountPercent === 0) {
            const pkgKey = `${pkg.name}_travel`;
            mealDiscounts[pkgKey] = {
              original: originalPrice,
              discounted: originalPrice,
              discountPercent: 0,
              aiDiscount: 0,
              finalDiscount: 0,
              isFixedPrice: true
            };
            totalDiscountedPrice += originalPrice;
            return;
          }
          
          let aiDiscountPercent;
          if (isFinalOffer) {
            // Final offer: Use total vendor discount
            aiDiscountPercent = vendorDiscountPercent / 100;
          } else if (isRenegotiation) {
            // Renegotiation: Use 50% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.5) / 100;
          } else {
            // First negotiation: Use 20% of vendor's discount
            aiDiscountPercent = (vendorDiscountPercent * 0.2) / 100;
          }
          
          const discountedPrice = Math.round(originalPrice * (1 - aiDiscountPercent));
          const minProfitablePrice = Math.round(originalPrice * 0.9);
          const finalPrice = Math.max(discountedPrice, minProfitablePrice);
          const finalDiscountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
          
          const pkgKey = `${pkg.name}_travel`;
          mealDiscounts[pkgKey] = {
            original: originalPrice,
            discounted: finalPrice,
            discountPercent: vendorDiscountPercent,
            aiDiscount: Math.round(aiDiscountPercent * 100),
            finalDiscount: finalDiscountPercent,
            isFixedPrice: false
          };
          
          totalDiscountedPrice += finalPrice;
        }
      } else {
        // For other packages, apply only AI discount to original price
        let aiDiscountPercent;
        if (isRenegotiation) {
          aiDiscountPercent = 0.03 + Math.random() * 0.02; // 3-5% AI discount
        } else {
          aiDiscountPercent = 0.01 + Math.random() * 0.01; // 1-2% AI discount
        }
        
        const discountedPrice = Math.round((pkg.originalPrice || pkg.price || 0) * (1 - aiDiscountPercent));
        const minProfitablePrice = Math.round((pkg.originalPrice || pkg.price || 0) * 0.9);
        const finalPrice = Math.max(discountedPrice, minProfitablePrice);
        
        const pkgKey = `${pkg.name}_package`;
        mealDiscounts[pkgKey] = {
          original: pkg.originalPrice || pkg.price || 0,
          discounted: finalPrice,
          discountPercent: 0, // No vendor discount used
          aiDiscount: Math.round(aiDiscountPercent * 100), // Show AI discount only
          finalDiscount: Math.round(((pkg.originalPrice || pkg.price || 0) - finalPrice) / (pkg.originalPrice || pkg.price || 1) * 100),
          isFixedPrice: false
        };
        
        totalDiscountedPrice += finalPrice;
      }
    });
    
    return { totalDiscountedPrice, mealDiscounts };
  };

  // Handle negotiate button click
  const handleNegotiate = () => {
    const invoice = calculateInvoice();
    if (!invoice) return;
    
    // Generate AI suggested price with individual meal discounts
    const { totalDiscountedPrice, mealDiscounts } = generateAISuggestedPrice(formData.selectedPackages, false);
    
    // Calculate final amount including convenience fee for display
    const aiSuggestedFinalAmount = totalDiscountedPrice + invoice.convenienceFee;
    
    setFormData(prev => ({
      ...prev,
      isNegotiating: true,
      aiSuggestedPrice: totalDiscountedPrice, // Store meals-only price
      negotiatedPrice: totalDiscountedPrice,
      mealDiscounts: mealDiscounts,
      renegotiationCount: 0,
      showRenegotiate: false,
      firstOfferPrice: totalDiscountedPrice
    }));
    
    // Create detailed description showing individual discounts
    let discountDetails = '';
    let hasFixedPrice = false;
    Object.entries(mealDiscounts).forEach(([key, discount]) => {
      const [pkgName, itemType] = key.split('_');
      if (discount.isFixedPrice) {
        hasFixedPrice = true;
        if (itemType === 'package') {
          discountDetails += `${pkgName}: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'photography') {
          discountDetails += `${pkgName} Photography: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'dj') {
          discountDetails += `${pkgName} DJ: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'decoration') {
          discountDetails += `${pkgName} Decoration: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'cakes') {
          discountDetails += `${pkgName} Cakes: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else {
          discountDetails += `${pkgName} ${itemType}: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        }
      } else {
        if (itemType === 'package') {
          discountDetails += `${pkgName}: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'photography') {
          discountDetails += `${pkgName} Photography: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'dj') {
          discountDetails += `${pkgName} DJ: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'decoration') {
          discountDetails += `${pkgName} Decoration: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'cakes') {
          discountDetails += `${pkgName} Cakes: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else {
          discountDetails += `${pkgName} ${itemType}: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        }
      }
    });
    
    const title = hasFixedPrice ? "AI Negotiation Started (Some Fixed Prices)" : "AI Negotiation Started";
    const description = hasFixedPrice 
      ? `Our AI suggests ₹${aiSuggestedFinalAmount.toLocaleString()} with available discounts:\n${discountDetails}Total: ₹${totalDiscountedPrice.toLocaleString()} + fee: ₹${invoice.convenienceFee.toLocaleString()}\n\nNote: Some packages have fixed prices and cannot be discounted.`
      : `Our AI suggests ₹${aiSuggestedFinalAmount.toLocaleString()} with individual discounts:\n${discountDetails}Total: ₹${totalDiscountedPrice.toLocaleString()} + fee: ₹${invoice.convenienceFee.toLocaleString()}`;
    
    toast({
      title,
      description,
    });
  };

  // Handle renegotiate button click
  const handleRenegotiate = () => {
    const invoice = calculateInvoice();
    if (!invoice) return;
    
    // Generate AI suggested price with higher discounts for renegotiation
    const { totalDiscountedPrice, mealDiscounts } = generateAISuggestedPrice(formData.selectedPackages, true);
    
    // Calculate final amount including convenience fee for display
    const aiSuggestedFinalAmount = totalDiscountedPrice + invoice.convenienceFee;
    
    setFormData(prev => ({
      ...prev,
      aiSuggestedPrice: totalDiscountedPrice,
      negotiatedPrice: totalDiscountedPrice,
      mealDiscounts: mealDiscounts,
      renegotiationCount: prev.renegotiationCount + 1,
      showRenegotiate: false,
      isFinalOffer: prev.renegotiationCount + 1 >= 1 // After first renegotiation, mark next as final
    }));
    
    // Create detailed description showing individual discounts
    let discountDetails = '';
    let hasFixedPrice = false;
    Object.entries(mealDiscounts).forEach(([key, discount]) => {
      const [pkgName, itemType] = key.split('_');
      if (discount.isFixedPrice) {
        hasFixedPrice = true;
        if (itemType === 'package') {
          discountDetails += `${pkgName}: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'photography') {
          discountDetails += `${pkgName} Photography: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'dj') {
          discountDetails += `${pkgName} DJ: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'decoration') {
          discountDetails += `${pkgName} Decoration: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else if (itemType === 'cakes') {
          discountDetails += `${pkgName} Cakes: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        } else {
          discountDetails += `${pkgName} ${itemType}: Fixed price (₹${discount.original.toLocaleString()}) - No discount available\n`;
        }
      } else {
        if (itemType === 'package') {
          discountDetails += `${pkgName}: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'photography') {
          discountDetails += `${pkgName} Photography: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'dj') {
          discountDetails += `${pkgName} DJ: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'decoration') {
          discountDetails += `${pkgName} Decoration: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else if (itemType === 'cakes') {
          discountDetails += `${pkgName} Cakes: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        } else {
          discountDetails += `${pkgName} ${itemType}: ${discount.aiDiscount}% off (₹${discount.original.toLocaleString()} → ₹${discount.discounted.toLocaleString()})\n`;
        }
      }
    });
    
    const title = hasFixedPrice ? "AI Renegotiation (Some Fixed Prices)" : "AI Renegotiation";
    const description = hasFixedPrice 
      ? `Our AI offers a better deal! ₹${aiSuggestedFinalAmount.toLocaleString()} with available discounts:\n${discountDetails}Total: ₹${totalDiscountedPrice.toLocaleString()} + fee: ₹${invoice.convenienceFee.toLocaleString()}\n\nNote: Some packages have fixed prices and cannot be discounted.`
      : `Our AI offers a better deal! ₹${aiSuggestedFinalAmount.toLocaleString()} with higher discounts:\n${discountDetails}Total: ₹${totalDiscountedPrice.toLocaleString()} + fee: ₹${invoice.convenienceFee.toLocaleString()}`;
    
    toast({
      title,
      description,
    });
  };

  // Handle negotiation price change
  const handleNegotiatedPriceChange = (value: string) => {
    const price = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      negotiatedPrice: price
    }));
  };

  // Handle accept negotiation
  const handleAcceptNegotiation = () => {
    setFormData(prev => ({
      ...prev,
      isNegotiating: false,
      showRenegotiate: false,
      negotiationFinalized: true
    }));
    
    toast({
      title: "Negotiation Accepted",
      description: `This is the final amount: ₹${formData.negotiatedPrice.toLocaleString()}`,
    });
  };

  // Handle cancel negotiation
  const handleCancelNegotiation = () => {
    setFormData(prev => ({
      ...prev,
      isNegotiating: false,
      negotiatedPrice: 0,
      aiSuggestedPrice: 0,
      showRenegotiate: true, // Show renegotiate button after cancel
      isFinalOffer: false
    }));
  };

  const invoice = calculateInvoice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Booking Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
          {/* Package Selection Section - Show at top for Travel packages */}
          {formData.selectedPackages.some(pkg => pkg.travel) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Packages (Click to Choose)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor.packages?.filter(pkg => pkg.travel).map((pkg: any, index: number) => {
                  const packageId = pkg.id || pkg.packageName || index.toString();
                  const isSelected = formData.selectedPackages.some(selected => 
                    (selected.id || selected.packageName) === packageId
                  );
                
                  return (
                    <Card 
                      key={packageId} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handlePackageToggle(packageId, !isSelected)}
                    >
                      <CardContent className="p-4">
                        {/* Selection indicator */}
                        <div className="flex justify-end mb-2">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>

                        {/* Package Image */}
                        {pkg.images && pkg.images.length > 0 && (
                          <div className="mb-3">
                            <img 
                              src={pkg.images[0]} 
                              alt={pkg.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Package Details */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-lg">{pkg.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                          
                          {/* Travel Package Details */}
                          {pkg.travel && (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-700">Travel Package:</div>
                              <div className="text-sm text-blue-600 font-medium">
                                {pkg.travel.source} → {pkg.travel.destination}
                              </div>
                              <div className="text-sm text-gray-600">
                                {pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}
                              </div>
                              {pkg.travel.pickupLocation && (
                                <div className="text-sm text-gray-600">
                                  Pickup: {pkg.travel.pickupLocation}
                                </div>
                              )}
                              {pkg.travel.areas && pkg.travel.areas.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  Via: {pkg.travel.areas.map((area: any) => area.name).join(' → ')}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="mt-3 space-y-2">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="font-medium text-gray-700 text-xs">1 Person:</div>
                              <div className="text-sm font-semibold text-gray-900">₹{(pkg.travel?.personPricing?.originalPrice || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <div className="font-medium text-gray-700 text-xs">Group of {pkg.travel?.groupPricing?.groupSize || 2}:</div>
                              <div className="text-sm font-semibold text-gray-900">₹{(pkg.travel?.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Travel Options Section - Show after package selection for Travel packages */}
          {formData.selectedPackages.some(pkg => pkg.travel) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Travel Options
              </h3>
              
              {formData.selectedPackages.filter(pkg => pkg.travel).map((pkg: any, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    {pkg.travel.image && (
                      <img 
                        src={pkg.travel.image} 
                        alt="Travel preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{pkg.name}</h4>
                      <div className="text-sm text-gray-600">
                        <div>{pkg.travel.source} → {pkg.travel.destination}</div>
                        <div>{pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}</div>
                        {pkg.travel.pickupLocation && (
                          <div>Pickup: {pkg.travel.pickupLocation}</div>
                        )}
                        {pkg.travel.areas && pkg.travel.areas.length > 0 && (
                          <div>Via: {pkg.travel.areas.map((area: any) => area.name).join(' → ')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Selection */}
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Select Pricing Type</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div 
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.selectedTravel[pkg.id || pkg.packageName || index]?.pricingType === 'person' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleTravelChange(pkg.id || pkg.packageName || index, 'person')}
                      >
                        <div className="font-medium">1 Person</div>
                        <div className="text-lg font-semibold text-green-600">
                          ₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                      <div 
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.selectedTravel[pkg.id || pkg.packageName || index]?.pricingType === 'group' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleTravelChange(pkg.id || pkg.packageName || index, 'group')}
                      >
                        <div className="font-medium">Group of {pkg.travel.groupPricing?.groupSize || 2}</div>
                        <div className="text-lg font-semibold text-green-600">
                          ₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Member Count Input for 1 Person */}
                    {formData.selectedTravel[pkg.id || pkg.packageName || index]?.pricingType === 'person' && (
                      <div className="mt-4">
                        <Label htmlFor={`memberCount-${index}`}>Number of Members</Label>
                        <Input
                          id={`memberCount-${index}`}
                          type="number"
                          min="1"
                          value={formData.memberCount}
                          onChange={(e) => handleInputChange('memberCount', parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                <Input
                  id="aadharNumber"
                  placeholder="Enter your Aadhar number"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Travel Information Section - Show for Travel packages */}
          {formData.selectedPackages.some(pkg => pkg.travel) ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Travel Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="travelStartDate">Travel Start Date *</Label>
                  <Input
                    id="travelStartDate"
                    type="date"
                    value={formData.travelStartDate}
                    onChange={(e) => {
                      handleInputChange('travelStartDate', e.target.value);
                      // Calculate end date based on travel duration
                      if (e.target.value && formData.selectedPackages.some(pkg => pkg.travel)) {
                        const startDate = new Date(e.target.value);
                        const travelPackage = formData.selectedPackages.find(pkg => pkg.travel);
                        if (travelPackage?.travel?.days) {
                          const endDate = new Date(startDate);
                          endDate.setDate(startDate.getDate() + travelPackage.travel.days - 1);
                          handleInputChange('travelEndDate', endDate.toISOString().split('T')[0]);
                        }
                      }
                    }}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="travelEndDate">Travel End Date *</Label>
                  <Input
                    id="travelEndDate"
                    type="date"
                    value={formData.travelEndDate}
                    onChange={(e) => handleInputChange('travelEndDate', e.target.value)}
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500">Calculated based on travel duration</p>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="queries">Any Queries</Label>
                  <Textarea
                    id="queries"
                    placeholder="Any questions or special requirements for your travel"
                    value={formData.queries}
                    onChange={(e) => handleInputChange('queries', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
            </div>
          ) : (
            /* Event Information Section - Show for non-Travel packages */
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleInputChange('eventDate', e.target.value)}
                  required
                />
              </div>
              
                {/* Only show Number of Guests for non-Photography, non-DJ, non-Decoration, non-Cakes, and non-Travel packages */}
                {!formData.selectedPackages.some(pkg => pkg.photography || pkg.dj || pkg.decoration || pkg.cakes || pkg.travel) && (
              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.numberOfGuests}
                  onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
                )}
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="eventLocation">Event Location *</Label>
                <Input
                  id="eventLocation"
                  placeholder="Enter event location"
                  value={formData.eventLocation}
                  onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="eventDescription">Event Description *</Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Describe your event requirements"
                  value={formData.eventDescription}
                  onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          </div>
          )}

          {/* Package Selection Section - Show for non-Travel packages */}
          {!formData.selectedPackages.some(pkg => pkg.travel) && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Packages (Click to Choose)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                console.log("BookingDetails - Rendering packages section");
                console.log("BookingDetails - vendor.packages:", vendor.packages);
                console.log("BookingDetails - vendor.packages?.length:", vendor.packages?.length);
                return vendor.packages?.length > 0;
              })() ? (
                vendor.packages.map((pkg: any, index: number) => {
                  console.log("Rendering package:", pkg);
                  const packageId = pkg.id || pkg.packageName || index.toString();
                  const isSelected = formData.selectedPackages.some(selected => 
                    (selected.id || selected.packageName) === packageId
                  );
                
                  return (
                    <Card 
                      key={packageId} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handlePackageToggle(packageId, !isSelected)}
                    >
                      <CardContent className="p-4">
                        {/* Selection indicator */}
                        <div className="flex justify-end mb-2">
                          {isSelected ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </div>

                        {/* Package content */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-gray-900 text-lg">
                              {pkg.name || pkg.packageName}
                            </h5>
                          </div>
                          
                          {pkg.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                          
                          {/* Meal-wise pricing for catering packages */}
                          {pkg.meals ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Meal Pricing:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Meal</div>
                                  <div className="text-right">Original Price</div>
                                </div>
                                {(['breakfast','lunch','dinner'] as const).map((meal) => {
                                  const mp = pkg.meals?.[meal];
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
                            </div>
                          ) : pkg.photography ? (
                            /* Photography pricing */
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Photography Pricing:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Category</div>
                                  <div className="text-right">Original Price</div>
                                </div>
                                {pkg.photography.perEvent?.originalPrice && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Per Event (1 day)</div>
                                    <div className="text-right">₹{(pkg.photography.perEvent.originalPrice).toLocaleString()}</div>
                                  </div>
                                )}
                                {pkg.photography.perHour?.originalPrice && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Per Hour</div>
                                    <div className="text-right">₹{(pkg.photography.perHour.originalPrice).toLocaleString()}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : pkg.dj ? (
                            /* DJ pricing */
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">DJ Pricing:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Category</div>
                                  <div className="text-right">Original Price</div>
                                </div>
                                {pkg.dj.perEvent?.originalPrice && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Per Event (1 day)</div>
                                    <div className="text-right">₹{(pkg.dj.perEvent.originalPrice).toLocaleString()}</div>
                                  </div>
                                )}
                                {pkg.dj.perHour?.originalPrice && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Per Hour</div>
                                    <div className="text-right">₹{(pkg.dj.perHour.originalPrice).toLocaleString()}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : pkg.decoration ? (
                            /* Decoration pricing */
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Decoration Pricing:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Category</div>
                                  <div className="text-right">Original Price</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>Decoration Package</div>
                                  <div className="text-right">₹{(pkg.decoration.originalPrice || 0).toLocaleString()}</div>
                                </div>
                                {/* Decoration Image */}
                                {pkg.decoration.image && (
                                  <div className="mt-2">
                                    <img 
                                      src={pkg.decoration.image} 
                                      alt="Decoration preview" 
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  </div>
                                )}
                                {/* Features */}
                                {pkg.decoration.features && pkg.decoration.features.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Features:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {pkg.decoration.features.slice(0, 2).map((feature: string, index: number) => (
                                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {feature}
                                        </span>
                                      ))}
                                      {pkg.decoration.features.length > 2 && (
                                        <span className="text-xs text-gray-500">
                                          +{pkg.decoration.features.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : pkg.cakes ? (
                            /* Cakes pricing */
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Cakes Pricing:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Category</div>
                                  <div className="text-right">Original Price</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>Cakes Package</div>
                                  <div className="text-right">₹{(pkg.cakes.originalPrice || 0).toLocaleString()}</div>
                                </div>
                                {/* Cakes Image */}
                                {pkg.cakes.image && (
                                  <div className="mt-2">
                                    <img 
                                      src={pkg.cakes.image} 
                                      alt="Cakes preview" 
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  </div>
                                )}
                                {/* Features */}
                                {pkg.cakes.features && pkg.cakes.features.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Features:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {pkg.cakes.features.slice(0, 2).map((feature: string, index: number) => (
                                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {feature}
                                        </span>
                                      ))}
                                      {pkg.cakes.features.length > 2 && (
                                        <span className="text-xs text-gray-500">
                                          +{pkg.cakes.features.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : pkg.travel ? (
                            /* Travel pricing */
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700 mb-2">Travel Package:</div>
                              <div className="space-y-1 text-xs">
                                <div className="grid grid-cols-2 gap-2 font-medium">
                                  <div>Route</div>
                                  <div className="text-right">Duration</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="font-medium text-blue-600">
                                    {pkg.travel.source} → {pkg.travel.destination}
                                  </div>
                                  <div className="text-right">
                                    {pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}
                                  </div>
                                </div>
                                {/* Travel Image */}
                                {pkg.travel.image && (
                                  <div className="mt-2">
                                    <img 
                                      src={pkg.travel.image} 
                                      alt="Travel preview" 
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                  </div>
                                )}
                                {/* Areas */}
                                {pkg.travel.areas && pkg.travel.areas.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Via:</div>
                                    <div className="text-xs text-gray-600">
                                      {pkg.travel.areas.map((area: any) => area.name).join(' → ')}
                                    </div>
                                  </div>
                                )}
                          {/* Pricing */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <div>
                                    <div className="font-medium text-gray-700">1 Person:</div>
                                    <div className="text-xs">₹{(pkg.travel.personPricing?.originalPrice || 0).toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-700">Group of {pkg.travel.groupPricing?.groupSize || 2}:</div>
                                    <div className="text-xs">₹{(pkg.travel.groupPricing?.originalPrice || 0).toLocaleString()}</div>
                                  </div>
                                </div>
                                {/* Features */}
                                {pkg.travel.features && pkg.travel.features.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-xs text-gray-500 mb-1">Features:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {pkg.travel.features.slice(0, 2).map((feature: string, index: number) => (
                                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {feature}
                                        </span>
                                      ))}
                                      {pkg.travel.features.length > 2 && (
                                        <span className="text-xs text-gray-500">
                                          +{pkg.travel.features.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Fallback to single price for other packages */
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{(pkg.originalPrice || pkg.price || 0).toLocaleString()}
                              </span>
                            </div>
                            </div>
                          )}
                            
                            {/* Capacity - Only show for Catering */}
                            {pkg.capacity && (vendor as any)?.category === 'Catering' && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{pkg.capacity} people</span>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No packages available</p>
                  <p className="text-sm">This vendor hasn't added any packages yet.</p>
                  <div className="mt-4 p-4 bg-red-100 rounded text-sm text-red-600">
                    <p><strong>Debug Info:</strong></p>
                    <p>vendor.packages: {vendor.packages ? 'exists' : 'null'}</p>
                    <p>vendor.packages.length: {vendor.packages?.length || 0}</p>
                    <p>vendor keys: {vendor ? Object.keys(vendor).join(', ') : 'null'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Photography Selection Section */}
          {formData.selectedPackages.some((pkg: any) => pkg.photography) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photography Options
              </h3>
              
              <div className="space-y-4">
                {formData.selectedPackages
                  .filter((pkg: any) => pkg.photography)
                  .map((pkg: any) => {
                    const packageId = pkg.id || pkg.packageName || '';
                    const selection = formData.selectedPhotography[packageId] || { eventType: 'per_event', hours: 1 };
                    
                    return (
                      <Card key={packageId} className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">{pkg.name || pkg.packageName}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Event Type</Label>
                              <Select 
                                value={selection.eventType} 
                                onValueChange={(value: 'per_event' | 'per_hour') => 
                                  handlePhotographyChange(packageId, value, selection.hours)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="per_event">Per Event (1 day)</SelectItem>
                                  <SelectItem value="per_hour">Per Hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {selection.eventType === 'per_hour' && (
                              <div>
                                <Label className="text-sm font-medium">Number of Hours</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={selection.hours}
                                  onChange={(e) => 
                                    handlePhotographyChange(packageId, 'per_hour', parseInt(e.target.value) || 1)
                                  }
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {selection.eventType === 'per_event' ? (
                              <div>
                                <div>Per Event: ₹{(pkg.photography.perEvent?.originalPrice || 0).toLocaleString()}</div>
                                <div className="font-semibold text-green-600">
                                  Total: ₹{(pkg.photography.perEvent?.originalPrice || 0).toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>Per Hour: ₹{(pkg.photography.perHour?.originalPrice || 0).toLocaleString()}</div>
                                <div className="font-semibold text-green-600">
                                  Total ({selection.hours} hour{selection.hours > 1 ? 's' : ''}): ₹{((pkg.photography.perHour?.originalPrice || 0) * selection.hours).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* DJ Selection Section */}
          {formData.selectedPackages.some((pkg: any) => pkg.dj) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Music className="h-5 w-5" />
                DJ Options
              </h3>
              
              <div className="space-y-4">
                {formData.selectedPackages
                  .filter((pkg: any) => pkg.dj)
                  .map((pkg: any) => {
                    const packageId = pkg.id || pkg.packageName || '';
                    const selection = formData.selectedDJ[packageId] || { eventType: 'per_event', hours: 1 };
                    
                    return (
                      <Card key={packageId} className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">{pkg.name || pkg.packageName}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Event Type</Label>
                              <Select 
                                value={selection.eventType} 
                                onValueChange={(value) => handleDJChange(packageId, value as 'per_event' | 'per_hour', selection.hours)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="per_event">Per Event</SelectItem>
                                  <SelectItem value="per_hour">Per Hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {selection.eventType === 'per_hour' && (
                              <div className="space-y-2">
                                <Label>Number of Hours</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={selection.hours}
                                  onChange={(e) => handleDJChange(packageId, selection.eventType, parseInt(e.target.value) || 1)}
                                  placeholder="1"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            {selection.eventType === 'per_event' ? (
                              <div>
                                <div>Per Event: ₹{(pkg.dj.perEvent?.originalPrice || 0).toLocaleString()}</div>
                                <div className="font-semibold text-green-600">
                                  Total: ₹{(pkg.dj.perEvent?.originalPrice || 0).toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div>Per Hour: ₹{(pkg.dj.perHour?.originalPrice || 0).toLocaleString()}</div>
                                <div className="font-semibold text-green-600">
                                  Total ({selection.hours} hour{selection.hours > 1 ? 's' : ''}): ₹{((pkg.dj.perHour?.originalPrice || 0) * selection.hours).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Decoration Selection Section */}
          {formData.selectedPackages.some((pkg: any) => pkg.decoration) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Decoration Options
              </h3>
              
              <div className="space-y-4">
                {formData.selectedPackages
                  .filter((pkg: any) => pkg.decoration)
                  .map((pkg: any) => {
                    const packageId = pkg.id || pkg.packageName || '';
                    const selection = formData.selectedDecoration[packageId] || { quantity: 1 };
                    
                    return (
                      <Card key={packageId} className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">{pkg.name || pkg.packageName}</h4>
                          
                          {/* Decoration Image */}
                          {pkg.decoration.image && (
                            <div className="mb-4">
                              <img 
                                src={pkg.decoration.image} 
                                alt="Decoration preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={selection.quantity}
                                onChange={(e) => handleDecorationChange(packageId, parseInt(e.target.value) || 1)}
                                placeholder="1"
                              />
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div>Price per unit: ₹{(pkg.decoration.originalPrice || 0).toLocaleString()}</div>
                            <div className="font-semibold text-green-600">
                              Total ({selection.quantity} unit{selection.quantity > 1 ? 's' : ''}): ₹{((pkg.decoration.originalPrice || 0) * selection.quantity).toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Features */}
                          {pkg.decoration.features && pkg.decoration.features.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-700 mb-2">Package Features:</div>
                              <div className="flex flex-wrap gap-2">
                                {pkg.decoration.features.map((feature: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Cakes Selection Section */}
          {formData.selectedPackages.some((pkg: any) => pkg.cakes) && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Cakes Options
              </h3>
              
              <div className="space-y-4">
                {formData.selectedPackages
                  .filter((pkg: any) => pkg.cakes)
                  .map((pkg: any) => {
                    const packageId = pkg.id || pkg.packageName || '';
                    const selection = formData.selectedCakes[packageId] || { quantity: 1 };
                    
                    return (
                      <Card key={packageId} className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">{pkg.name || pkg.packageName}</h4>
                          
                          {/* Cakes Image */}
                          {pkg.cakes.image && (
                            <div className="mb-4">
                              <img 
                                src={pkg.cakes.image} 
                                alt="Cakes preview" 
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={selection.quantity}
                                onChange={(e) => handleCakesChange(packageId, parseInt(e.target.value) || 1)}
                                placeholder="1"
                              />
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <div>Price per unit: ₹{(pkg.cakes.originalPrice || 0).toLocaleString()}</div>
                            <div className="font-semibold text-green-600">
                              Total ({selection.quantity} unit{selection.quantity > 1 ? 's' : ''}): ₹{((pkg.cakes.originalPrice || 0) * selection.quantity).toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Features */}
                          {pkg.cakes.features && pkg.cakes.features.length > 0 && (
                            <div>
                              <div className="font-medium text-gray-700 mb-2">Package Features:</div>
                              <div className="flex flex-wrap gap-2">
                                {pkg.cakes.features.map((feature: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
              </div>
            </div>
          )}


              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createBookingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createBookingMutation.isPending ? 'Submitting...' : 'Submit Booking'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right side - Dynamic Invoice */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {invoice ? (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Quick Invoice
                    </h3>
                    
                    {/* Selected Packages */}
                    <div className="space-y-3 mb-4">
                      {invoice.packages.map((pkg: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {pkg.name || pkg.packageName}
                            </h4>
                          </div>
                          
                          <div className="space-y-1">
                            {pkg.meals ? (
                              /* Meal-wise pricing for catering packages */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">Meal Details:</div>
                                {(['breakfast','lunch','dinner'] as const).map((meal) => {
                                  const mp = pkg.meals?.[meal];
                                  const label = meal.charAt(0).toUpperCase() + meal.slice(1);
                                  const value = mp?.originalPrice ?? 0;
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedMeals[packageId] || { breakfast: true, lunch: true, dinner: true };
                                  return (
                                    <div key={meal} className="flex items-center justify-between text-xs gap-2">
                                      <label className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          className="h-3 w-3"
                                          checked={!!selection[meal]}
                                          onChange={(e) => handleMealToggle(packageId, meal, e.target.checked)}
                                        />
                                        <span className="text-gray-600">{label}:</span>
                                      </label>
                                      <span className="font-medium">₹{value.toLocaleString()}</span>
                            </div>
                                  );
                                })}
                                <div className="flex justify-between text-sm font-semibold border-t pt-1 mt-2">
                                  <span>Package Total:</span>
                                  <span className="text-blue-600">
                                    ₹{(['breakfast','lunch','dinner'] as const).reduce((sum, meal) => {
                                      const packageId = pkg.id || pkg.packageName || '';
                                      const selection = formData.selectedMeals[packageId] || { breakfast: true, lunch: true, dinner: true };
                                      if (!selection[meal]) return sum;
                                      return sum + (pkg.meals?.[meal]?.originalPrice || 0);
                                    }, 0).toLocaleString()}
                              </span>
                            </div>
                              </div>
                            ) : pkg.photography ? (
                              /* Photography pricing */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">Photography Details:</div>
                                {(() => {
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedPhotography[packageId] || { eventType: 'per_event', hours: 1 };
                                  
                                  if (selection.eventType === 'per_event') {
                                    return (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Per Event (1 day):</span>
                                        <span className="font-medium">₹{(pkg.photography.perEvent?.originalPrice || 0).toLocaleString()}</span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-600">Per Hour:</span>
                                          <span className="font-medium">₹{(pkg.photography.perHour?.originalPrice || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-600">Hours:</span>
                                          <span className="font-medium">{selection.hours}</span>
                                        </div>
                            <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                          <span>Total:</span>
                              <span className="text-blue-600">
                                            ₹{((pkg.photography.perHour?.originalPrice || 0) * selection.hours).toLocaleString()}
                                </span>
                              </div>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : pkg.dj ? (
                              /* DJ pricing */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">DJ Details:</div>
                                {(() => {
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedDJ[packageId] || { eventType: 'per_event', hours: 1 };
                                  
                                  if (selection.eventType === 'per_event') {
                                    return (
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Per Event (1 day):</span>
                                        <span className="font-medium">₹{(pkg.dj.perEvent?.originalPrice || 0).toLocaleString()}</span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-600">Per Hour:</span>
                                          <span className="font-medium">₹{(pkg.dj.perHour?.originalPrice || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span className="text-gray-600">Hours:</span>
                                          <span className="font-medium">{selection.hours}</span>
                                        </div>
                            <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                          <span>Total:</span>
                              <span className="text-blue-600">
                                            ₹{((pkg.dj.perHour?.originalPrice || 0) * selection.hours).toLocaleString()}
                              </span>
                            </div>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            ) : pkg.decoration ? (
                              /* Decoration pricing */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">Decoration Details:</div>
                                {(() => {
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedDecoration[packageId] || { quantity: 1 };
                                  
                                  return (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Price per unit:</span>
                                        <span className="font-medium">₹{(pkg.decoration.originalPrice || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{selection.quantity}</span>
                                      </div>
                                      <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                        <span>Total:</span>
                                        <span className="text-blue-600">
                                          ₹{((pkg.decoration.originalPrice || 0) * selection.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : pkg.cakes ? (
                              /* Cakes pricing */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">Cakes Details:</div>
                                {(() => {
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedCakes[packageId] || { quantity: 1 };
                                  
                                  return (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Price per unit:</span>
                                        <span className="font-medium">₹{(pkg.cakes.originalPrice || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-medium">{selection.quantity}</span>
                                      </div>
                                      <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                        <span>Total:</span>
                                        <span className="text-blue-600">
                                          ₹{((pkg.cakes.originalPrice || 0) * selection.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : pkg.travel ? (
                              /* Travel pricing */
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-600 mb-1">Travel Details:</div>
                                {(() => {
                                  const packageId = pkg.id || pkg.packageName || '';
                                  const selection = formData.selectedTravel[packageId] || { pricingType: 'person' };
                                  
                                  const perPersonPrice = pkg.travel.personPricing?.originalPrice || 0;
                                  const groupPrice = pkg.travel.groupPricing?.originalPrice || 0;
                                  const groupSize = pkg.travel.groupPricing?.groupSize || 2;
                                  
                                  let totalPrice = 0;
                                  let memberCount = 1;
                                  let pricingType = '1 Person';
                                  
                                  if (selection.pricingType === 'person') {
                                    memberCount = formData.memberCount || 1;
                                    totalPrice = perPersonPrice * memberCount;
                                    pricingType = `${memberCount} Member${memberCount > 1 ? 's' : ''}`;
                                  } else {
                                    totalPrice = groupPrice;
                                    pricingType = `Group of ${groupSize}`;
                                  }
                                  
                                  return (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Route:</span>
                                        <span className="font-medium text-blue-600">
                                          {pkg.travel.source} → {pkg.travel.destination}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Duration:</span>
                                        <span className="font-medium">{pkg.travel.days} day{(pkg.travel.days > 1 ? 's' : '')}</span>
                                      </div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">Pricing Type:</span>
                                        <span className="font-medium">{pricingType}</span>
                                      </div>
                                      
                                      {/* Detailed calculation for person pricing */}
                                      {selection.pricingType === 'person' && memberCount > 1 && (
                                        <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Per Person Rate:</span>
                                            <span>₹{perPersonPrice.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">Number of Members:</span>
                                            <span>{memberCount}</span>
                                          </div>
                                          <div className="flex justify-between font-medium border-t pt-1">
                                            <span>Subtotal:</span>
                                            <span>₹{totalPrice.toLocaleString()}</span>
                                          </div>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-sm font-semibold border-t pt-1">
                                        <span>Total:</span>
                              <span className="text-blue-600">
                                          ₹{totalPrice.toLocaleString()}
                              </span>
                            </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              /* Single price for other packages */
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Price:</span>
                                  <span className="font-medium">
                                    ₹{(pkg.originalPrice || pkg.price || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Invoice Summary */}
                    <div className="space-y-4 border-t pt-4">
                      {/* Before Negotiation */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800">Before negotiation</p>
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Actual Price:</span>
                        <span>₹{invoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Convenience Fee (1%):</span>
                          <span>₹{invoice.convenienceFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-blue-600">₹{invoice.finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {/* After Negotiation (shown only after accept/finalize) */}
                      {formData.negotiationFinalized && (
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-sm font-semibold text-gray-800">After negotiation</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Negotiated Price:</span>
                            <span className="text-green-600">₹{formData.negotiatedPrice.toLocaleString()}</span>
                          </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Convenience Fee (1%):</span>
                        <span>₹{invoice.convenienceFee.toLocaleString()}</span>
                      </div>
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-blue-600">₹{(formData.negotiatedPrice + invoice.convenienceFee).toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Your Budget (overrides after negotiation if present) */}
                      {formData.negotiationFinalized && formData.userBudget > 0 && (
                        <div className="space-y-2 border-t pt-4">
                          <p className="text-sm font-semibold text-gray-800">Your Budget</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Budget Amount:</span>
                            <span className="text-purple-700 font-semibold">₹{formData.userBudget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Convenience Fee (1%):</span>
                            <span>₹{invoice.convenienceFee.toLocaleString()}</span>
                          </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-blue-600">₹{(formData.userBudget + invoice.convenienceFee).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Negotiation Section */}
                    {!formData.isNegotiating ? (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {formData.negotiationFinalized ? (
                              <div className="text-center text-xs text-green-700 font-medium">
                                Negotiation finalized
                              </div>
                            ) : !formData.showRenegotiate ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleNegotiate}
                                className="w-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              >
                                🤖 Negotiate
                              </Button>
                            ) : (
                              formData.isFinalOffer ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleApplyFinalOffer}
                                  className="w-full bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                >
                                  🏁 Final Offer
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleRenegotiate}
                                  className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                >
                                  🔄 Renegotiate
                                </Button>
                              )
                            )}
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              {!formData.showRenegotiate 
                                ? "Not convinced? Our AI will negotiate a discounted rate that's still profitable for the vendor"
                                : (formData.isFinalOffer 
                                    ? "This is the final AI offer. If not convinced, contact the vendor or enter your budget."
                                    : "Still not satisfied? Our AI will offer a better deal with higher discounts")
                              }
                            </p>
                            {formData.finalOfferApplied && (
                              <div className="mt-2 space-y-2">
                                <Label className="text-xs">Enter Your Budget (optional)</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter your budget"
                                  value={formData.userBudget || ''}
                                  onChange={(e) => setFormData(prev => ({ ...prev, userBudget: parseInt(e.target.value) || 0 }))}
                                />
                                <p className="text-[11px] text-gray-500">
                                  If you're not satisfied, enter your budget; we'll use it as the final amount.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t bg-orange-50 rounded-lg p-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-orange-800">🤖 AI Suggested Price:</span>
                            <span className="text-lg font-bold text-orange-900">₹{formData.aiSuggestedPrice.toLocaleString()}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="negotiatedPrice" className="text-sm text-orange-700">
                              Adjust Amount (if needed):
                            </Label>
                            <Input
                              id="negotiatedPrice"
                              type="number"
                              value={formData.negotiatedPrice}
                              onChange={(e) => handleNegotiatedPriceChange(e.target.value)}
                              className="border-orange-200 focus:border-orange-400"
                              placeholder="Enter your preferred amount"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleAcceptNegotiation}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              ✓ Accept
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCancelNegotiation}
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              ✗ Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Debug UI - AI Negotiation Calculation */}
                    {formData.isNegotiating && (
                      <div className="mt-4 pt-4 border-t bg-blue-50 rounded-lg p-3">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                            🔍 Debug: AI Negotiation Calculation
                          </h4>
                          
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-blue-700 font-medium">Original Meals Total:</span>
                              <span className="text-blue-900">₹{invoice?.subtotal.toLocaleString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-blue-700 font-medium">Convenience Fee (1%):</span>
                              <span className="text-blue-900">₹{invoice?.convenienceFee.toLocaleString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-blue-700 font-medium">Original Total:</span>
                              <span className="text-blue-900">₹{(invoice?.subtotal || 0) + (invoice?.convenienceFee || 0)}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-blue-700 font-medium">AI Discount Range:</span>
                              <span className="text-blue-900">
                                {formData.renegotiationCount > 0 ? "3% - 5%" : "1% - 2%"} 
                                {formData.renegotiationCount > 0 ? " (Renegotiation)" : " (First Offer)"}
                        </span>
                      </div>
                            
                            {formData.renegotiationCount > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-blue-700 font-medium">Renegotiation Count:</span>
                                <span className="text-blue-900">{formData.renegotiationCount}</span>
                    </div>
                            )}
                            
                            {/* Individual Meal Discounts */}
                            {Object.entries(formData.mealDiscounts).map(([key, discount]) => {
                              const [pkgName, meal] = key.split('_');
                              const displayName = meal === 'package' ? pkgName : `${pkgName} ${meal}`;
                              return (
                                <div key={key} className="bg-blue-100 p-2 rounded space-y-1">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="text-blue-700 font-medium">{displayName}:</span>
                                    <span className="text-blue-900">
                                      {discount.aiDiscount}% AI discount = {discount.finalDiscount}% total
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <span className="text-blue-600">Original: ₹{discount.original.toLocaleString()}</span>
                                    <span className="text-blue-800 font-medium">Final: ₹{discount.discounted.toLocaleString()}</span>
                                  </div>
                                </div>
                              );
                            })}
                            
                            <div className="grid grid-cols-2 gap-2 border-t pt-2">
                              <span className="text-blue-700 font-bold">Total Discounted (Meals):</span>
                              <span className="text-blue-900 font-bold">₹{formData.aiSuggestedPrice.toLocaleString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 border-t pt-2">
                              <span className="text-blue-700 font-bold">Final Total (with Fee):</span>
                              <span className="text-blue-900 font-bold">₹{(formData.aiSuggestedPrice + (invoice?.convenienceFee || 0)).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-1">Calculation Formula (Per Meal):</p>
                            <p className="text-xs text-blue-500 font-mono">
                              1. Apply only AI discount: 1% + random(1%)<br/>
                              2. discountedPrice = originalPrice × (1 - aiDiscount)<br/>
                              3. minProfitableMeal = originalMealPrice × 0.9<br/>
                              4. finalMealPrice = max(discountedPrice, minProfitableMeal)<br/>
                              5. totalDiscounted = sum of all finalMealPrices<br/>
                              6. finalTotal = totalDiscounted + convenienceFee
                      </p>
                    </div>
                          
                          <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-xs text-yellow-700">
                              <strong>Note:</strong> AI applies only its own discount (1-2%) directly to original prices, ignoring vendor's pre-set discounts. This ensures vendor profitability with at least 10% margin per meal.
                            </p>
                          </div>
                          {/* Renegotiate inline button under debug */}
                          <div className="mt-2">
                            {formData.isFinalOffer ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleApplyFinalOffer}
                                className="w-full bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                              >
                                🏁 Final Offer
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRenegotiate}
                                className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              >
                                {formData.renegotiationCount === 0 ? '🔄 Renegotiate' : '🔄 Renegotiate Again'}
                              </Button>
                            )}
                          </div>
                          
                          {/* Comparison: First vs Current Offer */}
                          {typeof formData.firstOfferPrice === 'number' && (
                            <div className="mt-3 p-2 bg-white rounded border">
                              <p className="text-xs font-semibold text-gray-800 mb-2">Comparison</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-gray-600">First Negotiation:</div>
                                <div className="text-gray-900 font-medium">₹{(formData.firstOfferPrice || 0).toLocaleString()}</div>
                                <div className="text-gray-600">Current Offer:</div>
                                <div className="text-green-700 font-semibold">₹{(formData.aiSuggestedPrice || 0).toLocaleString()}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-gray-200 bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      No Packages Selected
                    </h3>
                    <p className="text-sm text-gray-500">
                      Select packages from the left to see your invoice here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
