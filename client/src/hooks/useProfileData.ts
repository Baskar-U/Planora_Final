import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

// User Profile Hooks
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    },
    enabled: !!userId,
  });
};

export const useVendorProfile = (userId: string) => {
  return useQuery({
    queryKey: ["vendorProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const vendorsRef = collection(db, "vendors");
      const q = query(vendorsRef, where("vendorid", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    enabled: !!userId,
  });
};

// Customer-specific hooks
export const useCustomerOrders = (customerId: string) => {
  return useQuery({
    queryKey: ["customerOrders", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("customerId", "==", customerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!customerId,
  });
};

export const useCustomerBookings = (customerId: string) => {
  return useQuery({
    queryKey: ["customerBookings", customerId],
    queryFn: async () => {
      if (!customerId) {
        console.log('🔍 useCustomerBookings: No customerId provided');
        return [];
      }
      
      console.log('🔍 useCustomerBookings: Fetching bookings for customerId:', customerId);
      
      // Get current user email for fallback search
      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email;
      
      console.log('🔍 useCustomerBookings: User email:', userEmail);
      
      const bookingsRef = collection(db, "bookings");
      
      // Try to find bookings by customerId first
      let q = query(bookingsRef, where("customerId", "==", customerId));
      let snapshot = await getDocs(q);
      let bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log('📊 useCustomerBookings: Found bookings by customerId:', bookings.length);
      
      // If no bookings found by customerId, try by email
      if (bookings.length === 0 && userEmail) {
        console.log('🔍 useCustomerBookings: Trying to find bookings by email:', userEmail);
        q = query(bookingsRef, where("customerEmail", "==", userEmail));
        snapshot = await getDocs(q);
        bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        console.log('📊 useCustomerBookings: Found bookings by email:', bookings.length);
      }
      
      console.log('📋 useCustomerBookings: Final bookings data:', bookings);
      
      return bookings;
    },
    enabled: !!customerId,
  });
};

export const useCustomerLikedVendors = (customerId: string) => {
  return useQuery({
    queryKey: ["customerLikedVendors", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      // Get liked vendor IDs from localStorage (or could be stored in user profile)
      const likedVendorIds = JSON.parse(localStorage.getItem('likedVendors') || '[]');
      if (likedVendorIds.length === 0) return [];

      const vendorsRef = collection(db, "vendors");
      const likedVendors = [];
      
      for (const vendorId of likedVendorIds) {
        const q = query(vendorsRef, where("id", "==", vendorId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          likedVendors.push({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      }
      
      return likedVendors;
    },
    enabled: !!customerId,
  });
};

// Vendor-specific hooks
export const useVendorServices = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorServices", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      
      console.log("🔍 useVendorServices: Fetching services for vendorId:", vendorId);
      
      // Try multiple field combinations to find services
      const servicesQuery1 = query(
        collection(db, "postorder"),
        where("vendorId", "==", vendorId)
      );
      const servicesQuery2 = query(
        collection(db, "postorder"),
        where("vendorid", "==", vendorId)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(servicesQuery1),
        getDocs(servicesQuery2)
      ]);
      
      // Combine results and remove duplicates
      const allDocs = [...snapshot1.docs, ...snapshot2.docs];
      const uniqueDocs = allDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      );
      
      console.log("📊 useVendorServices: Services found with vendorId:", snapshot1.docs.length);
      console.log("📊 useVendorServices: Services found with vendorid:", snapshot2.docs.length);
      console.log("📊 useVendorServices: Total unique services:", uniqueDocs.length);
      
      return uniqueDocs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!vendorId,
  });
};

export const useVendorOrders = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorOrders", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("vendorId", "==", vendorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!vendorId,
  });
};

export const useVendorBookings = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorBookings", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("vendorId", "==", vendorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!vendorId,
  });
};

export const useVendorAvailability = (vendorId: string, year: number, month: number) => {
  return useQuery({
    queryKey: ["vendorAvailability", vendorId, year, month],
    queryFn: async () => {
      if (!vendorId) return null;
      const availabilityRef = collection(db, "vendorAvailability");
      const q = query(
        availabilityRef,
        where("vendorId", "==", vendorId),
        where("year", "==", year),
        where("month", "==", month)
      );
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    enabled: !!vendorId,
  });
};

export const useVendorCalendarSettings = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorCalendarSettings", vendorId],
    queryFn: async () => {
      if (!vendorId) return null;
      const settingsRef = collection(db, "vendorCalendarSettings");
      const q = query(settingsRef, where("vendorId", "==", vendorId));
      const snapshot = await getDocs(q);
      return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    enabled: !!vendorId,
  });
};

export const useVendorReviews = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorReviews", vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("vendorId", "==", vendorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!vendorId,
  });
};

// Profile update mutations
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ vendorId, updates }: { vendorId: string; updates: any }) => {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        ...updates,
        updatedAt: new Date()
      });
    },
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ["vendorProfile", vendorId] });
    },
  });
};

// Statistics calculation helpers
export const useCustomerStats = (customerId: string) => {
  const { data: bookings = [], isLoading: bookingsLoading } = useCustomerBookings(customerId);
  const { data: likedVendors = [] } = useCustomerLikedVendors(customerId);

  console.log('🔍 useCustomerStats: customerId:', customerId);
  console.log('🔍 useCustomerStats: bookings:', bookings.length);
  console.log('🔍 useCustomerStats: bookingsLoading:', bookingsLoading);

  // Calculate comprehensive stats from bookings
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((booking: any) => booking.status === 'confirmed').length;
  const pendingBookings = bookings.filter((booking: any) => booking.status === 'pending').length;
  const completedBookings = bookings.filter((booking: any) => booking.status === 'completed').length;
  const cancelledBookings = bookings.filter((booking: any) => booking.status === 'cancelled').length;

  // Calculate total spent based on paid amounts
  const totalSpent = bookings.reduce((total: number, booking: any) => {
    return total + (booking.paidAmount || 0);
  }, 0);

  // Calculate total amount (including unpaid)
  const totalAmount = bookings.reduce((total: number, booking: any) => {
    return total + (booking.totalAmount || 0);
  }, 0);

  // Calculate remaining amount
  const remainingAmount = bookings.reduce((total: number, booking: any) => {
    return total + (booking.remainingAmount || 0);
  }, 0);

  // Get unique vendors
  const uniqueVendors = new Set(bookings.map((booking: any) => booking.vendorId).filter(Boolean));
  const vendorCount = uniqueVendors.size;

  // Get favorite categories from bookings
  const favoriteCategories = Array.from(new Set(
    bookings.map((booking: any) => booking.eventType || booking.serviceName).filter(Boolean)
  ));

  // Recent bookings (last 5)
  const recentBookings = bookings
    .sort((a: any, b: any) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  const stats = {
    // Order/Booking counts
    totalOrders: totalBookings, // Using bookings as orders
    totalBookings: totalBookings,
    completedOrders: completedBookings,
    pendingOrders: pendingBookings,
    confirmedBookings: confirmedBookings,
    cancelledBookings: cancelledBookings,
    
    // Financial stats
    totalSpent: totalSpent,
    totalAmount: totalAmount,
    remainingAmount: remainingAmount,
    
    // Other stats
    likedVendorsCount: likedVendors.length,
    vendorCount: vendorCount,
    favoriteCategories: favoriteCategories,
    recentOrders: recentBookings, // Using recent bookings as recent orders
    recentBookings: recentBookings,
  };

  return { data: stats, isLoading: bookingsLoading };
};

export const useVendorStats = (vendorId: string) => {
  const { data: services = [], isLoading: servicesLoading } = useVendorServices(vendorId);
  const { data: bookings = [], isLoading: bookingsLoading } = useVendorBookings(vendorId);
  const { data: reviews = [] } = useVendorReviews(vendorId);

  console.log('🔍 useVendorStats: vendorId:', vendorId);
  console.log('🔍 useVendorStats: services:', services.length);
  console.log('🔍 useVendorStats: bookings:', bookings.length);
  console.log('🔍 useVendorStats: reviews:', reviews.length);

  // Calculate comprehensive stats from bookings
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((booking: any) => booking.status === 'confirmed').length;
  const pendingBookings = bookings.filter((booking: any) => booking.status === 'pending').length;
  const completedBookings = bookings.filter((booking: any) => booking.status === 'completed').length;
  const cancelledBookings = bookings.filter((booking: any) => booking.status === 'cancelled').length;

  // Calculate revenue from paid amounts (what vendor actually earned)
  const totalRevenue = bookings.reduce((total: number, booking: any) => {
    return total + (booking.paidAmount || 0);
  }, 0);

  // Calculate total amount (including unpaid)
  const totalAmount = bookings.reduce((total: number, booking: any) => {
    return total + (booking.totalAmount || 0);
  }, 0);

  // Calculate remaining amount (unpaid)
  const remainingAmount = bookings.reduce((total: number, booking: any) => {
    return total + (booking.remainingAmount || 0);
  }, 0);

  // Get unique customers
  const uniqueCustomers = new Set(bookings.map((booking: any) => booking.customerId || booking.customerEmail).filter(Boolean));
  const customerCount = uniqueCustomers.size;

  // Get service categories from bookings
  const serviceCategories = Array.from(new Set(
    bookings.map((booking: any) => booking.eventType || booking.serviceName).filter(Boolean)
  ));

  // Recent bookings (last 5)
  const recentBookings = bookings
    .sort((a: any, b: any) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toDate?.()?.getTime() || new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  const stats = {
    // Service counts
    totalServices: services.length,
    activeServices: services.filter((service: any) => service.isActive !== false).length,
    
    // Order/Booking counts
    totalOrders: totalBookings, // Using bookings as orders
    totalBookings: totalBookings,
    completedOrders: completedBookings,
    pendingOrders: pendingBookings,
    confirmedBookings: confirmedBookings,
    cancelledBookings: cancelledBookings,
    
    // Financial stats
    totalRevenue: totalRevenue, // What vendor actually earned
    totalAmount: totalAmount, // Total amount including unpaid
    remainingAmount: remainingAmount, // Unpaid amount
    
    // Customer stats
    customerCount: customerCount,
    
    // Rating stats
    averageRating: reviews.length > 0 
      ? reviews.reduce((total: number, review: any) => total + review.rating, 0) / reviews.length 
      : 0,
    reviewCount: reviews.length,
    
    // Categories and recent data
    serviceCategories: serviceCategories,
    recentOrders: recentBookings, // Using recent bookings as recent orders
    recentBookings: recentBookings,
    recentReviews: reviews.slice(0, 5),
  };

  console.log('📊 useVendorStats: Calculated stats:', stats);

  return { data: stats, isLoading: servicesLoading || bookingsLoading };
};
