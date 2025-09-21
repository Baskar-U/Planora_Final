import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  firebaseService,
  reviewService,
  type Vendor,
  type Service,
  type Review
} from "@/lib/firebaseService";

// Vendor Hooks
export const useVendors = () => {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: firebaseService.getVendors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useVendorCount = () => {
  return useQuery({
    queryKey: ["vendors", "count"],
    queryFn: firebaseService.getVendorsCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVendor = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => firebaseService.getVendor(vendorId),
    enabled: !!vendorId,
  });
};

export const useVendorsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["vendors", "category", category],
    queryFn: () => firebaseService.getVendorsByCategory(category),
    enabled: !!category,
  });
};

export const useVendorsByCity = (city: string) => {
  return useQuery({
    queryKey: ["vendors", "city", city],
    queryFn: () => firebaseService.getVendorsByLocation(city),
    enabled: !!city,
  });
};

// Vendor Registration Hooks
export const useVendorRegistrations = () => {
  return useQuery({
    queryKey: ["vendorRegistrations"],
    queryFn: firebaseService.getVendorRegistrations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useVendorRegistrationCount = () => {
  return useQuery({
    queryKey: ["vendorRegistrations", "count"],
    queryFn: firebaseService.getVendorRegistrationCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVendorRegistration = (vendorId: string) => {
  return useQuery({
    queryKey: ["vendorRegistration", vendorId],
    queryFn: () => firebaseService.getVendorRegistration(vendorId),
    enabled: !!vendorId,
  });
};

export const useVendorRegistrationsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["vendorRegistrations", "category", category],
    queryFn: () => firebaseService.getVendorRegistrationsByCategory(category),
    enabled: !!category,
  });
};

export const useVendorRegistrationsByLocation = (location: string) => {
  return useQuery({
    queryKey: ["vendorRegistrations", "location", location],
    queryFn: () => firebaseService.getVendorRegistrationsByLocation(location),
    enabled: !!location,
  });
};

export const useSearchVendorRegistrations = (searchTerm: string) => {
  return useQuery({
    queryKey: ["vendorRegistrations", "search", searchTerm],
    queryFn: () => firebaseService.searchVendorRegistrations(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
  });
};

// Order Tracking Hooks
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      orderId, 
      status, 
      description, 
      updatedBy, 
      metadata 
    }: { 
      orderId: string; 
      status: any; 
      description: string; 
      updatedBy: 'customer' | 'vendor' | 'admin' | 'system'; 
      metadata?: any; 
    }) =>
      firebaseService.updateOrderStatus(orderId, status, description, updatedBy, metadata),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useAddOrderTrackingEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      orderId, 
      event 
    }: { 
      orderId: string; 
      event: any; 
    }) =>
      firebaseService.addOrderTrackingEvent(orderId, event),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useOrderTrackingHistory = (orderId: string) => {
  return useQuery({
    queryKey: ["orderTrackingHistory", orderId],
    queryFn: () => firebaseService.getOrderTrackingHistory(orderId),
    enabled: !!orderId,
  });
};

export const useSearchOrdersByPhone = (phone: string) => {
  return useQuery({
    queryKey: ["orders", "search", "phone", phone],
    queryFn: () => firebaseService.searchOrdersByPhone(phone),
    enabled: !!phone && phone.length >= 10,
  });
};

export const useSearchOrdersByEmail = (email: string) => {
  return useQuery({
    queryKey: ["orders", "search", "email", email],
    queryFn: () => firebaseService.searchOrdersByEmail(email),
    enabled: !!email && email.includes('@'),
  });
};

export const useSearchVendors = (searchTerm: string) => {
  return useQuery({
    queryKey: ["vendors", "search", searchTerm],
    queryFn: () => firebaseService.searchVendors(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 2,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: firebaseService.createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId, updates }: { vendorId: string; updates: Partial<Vendor> }) =>
      firebaseService.updateVendor(vendorId, updates),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// Service Hooks
export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: firebaseService.getServices,
  });
};

export const useServicesByVendor = (vendorId: string) => {
  return useQuery({
    queryKey: ["services", "vendor", vendorId],
    queryFn: () => firebaseService.getServicesByVendor(vendorId),
    enabled: !!vendorId,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: firebaseService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};

// Postorder hooks
export const useCreatePostorder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: firebaseService.createPostorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
};

// Order hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: firebaseService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useOrdersByUser = (userId: string) => {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => firebaseService.getOrdersByUser(userId),
    enabled: !!userId,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => firebaseService.getOrder(orderId),
    enabled: !!orderId,
  });
};


export const useVendorOrders = (vendorId: string) => {
  return useQuery({
    queryKey: ["orders", "vendor", vendorId],
    queryFn: () => firebaseService.getVendorOrders(vendorId),
    enabled: !!vendorId,
  });
};

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ["orders", "pending"],
    queryFn: () => firebaseService.getPendingOrders(),
  });
};

export const useIndividualEventRequests = () => {
  return useQuery({
    queryKey: ["individualEventRequests", "pending"],
    queryFn: () => firebaseService.getIndividualEventRequests(),
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, vendorId }: { orderId: string; vendorId: string }) =>
      firebaseService.acceptOrder(orderId, vendorId),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "pending"] });
    },
  });
};

// Message hooks
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageData: Omit<Message, 'id' | 'createdAt'>) =>
      firebaseService.createMessage(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useMessagesByConversation = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", "conversation", conversationId],
    queryFn: () => firebaseService.getMessagesByConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, status }: { messageId: string; status: 'sent' | 'delivered' | 'read' }) =>
      firebaseService.updateMessageStatus(messageId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useGetConversation = (participant1Id: string, participant2Id: string) => {
  return useQuery({
    queryKey: ["conversation", participant1Id, participant2Id],
    queryFn: () => firebaseService.getConversation(participant1Id, participant2Id),
    enabled: !!participant1Id && !!participant2Id,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>) =>
      firebaseService.createConversation(conversationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
    },
  });
};

// Review Hooks
export const useServiceReviews = (serviceId: string) => {
  return useQuery({
    queryKey: ["reviews", serviceId],
    queryFn: () => reviewService.getServiceReviews(serviceId),
    enabled: !!serviceId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reviewService.createReview,
    onSuccess: (_, review) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", review.serviceId] });
      // Also invalidate the service to update its rating
      queryClient.invalidateQueries({ queryKey: ["service", review.serviceId] });
    },
  });
};

// Customer Hooks
export const useCustomerOrders = () => {
  return useQuery({
    queryKey: ["customerOrders"],
    queryFn: firebaseService.getCustomerOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCustomerAnalytics = () => {
  return useQuery({
    queryKey: ["customerAnalytics"],
    queryFn: firebaseService.getCustomerAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
