import { db } from "./firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  startAfter,
  arrayUnion
} from "firebase/firestore";
import { auth } from "./firebase";

// Types for Firestore collections
export interface VendorService {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: 'fixed' | 'per_person' | 'per_hour' | 'per_day' | 'per_event';
  category: string;
  subcategory?: string;
  features: string[];
  images: string[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  packages?: ServicePackage[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Vendor {
  id?: string;
  name: string;
  businessname: string;
  business_name?: string; // Alternative field name
  companyName?: string; // Alternative field name
  company_name?: string; // Alternative field name
  description: string;
  eventname: string; // category/event type
  exprience: string;
  experience?: string; // Alternative field name
  from: string;
  hours: string;
  image: string;
  location: string;
  menu: string[]; // Legacy field - keep for backward compatibility
  mobilenumber: string;
  vendorid: string;
  
  // Enhanced services array with full details
  services?: VendorService[];
  
  // Optional fields for compatibility
  email?: string;
  phone?: string;
  category?: string;
  city?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  profileImage?: string;
  coverImage?: string;
  isVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
  
  // New vendor registration fields
  packages?: any[]; // Package data from vendor registration
  samplePhotos?: string[]; // Sample photos from vendor registration
  website?: string; // Website URL
  instagram?: string; // Instagram handle
  portfolio?: string; // Portfolio URL
  gstNumber?: string; // GST number
  paymentMethods?: string[]; // Accepted payment methods
  isVendorRegistration?: boolean; // Flag to identify vendor registration data
}

export interface Postorder {
  id?: string;
  vendorid: string;
  businessname: string;
  name: string;
  mobilenumber: string;
  email: string;
  eventname: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  priceUnit: string;
  location: string;
  from: string;
  exprience: string;
  hours: string;
  features?: string[];
  menu?: string[];
  image?: string;
  coverImage?: string;
  upiQrImage?: string;
  collections?: string[];
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Order {
  id?: string;
  userId: string;
  orderId: string;
  eventType: string;
  customerName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budget: number;
  eventDescription: string;
  additionalRequirements?: string;
  status: "pending" | "vendor_accepted" | "payment_pending" | "in_progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  vendorQuotes: any[];
  selectedVendor: any;
  timeline: OrderTrackingEvent[];
  createdAt?: any;
  updatedAt?: any;
  // Enhanced tracking fields
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  vendorNotes?: string;
  customerNotes?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  contactPerson?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export interface OrderTrackingEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  description: string;
  location?: string;
  updatedBy: 'customer' | 'vendor' | 'admin' | 'system';
  metadata?: {
    vendorId?: string;
    vendorName?: string;
    amount?: number;
    paymentMethod?: string;
    trackingNumber?: string;
    notes?: string;
  };
}

export interface Application {
  id?: string;
  userId: string;
  orderId: string;
  vendorId: string;
  vendorName: string;
  status: ApplicationStatus;
  phase: ApplicationPhase;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  budget: number;
  eventDescription: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  timeline: ApplicationTrackingEvent[];
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount?: number;
  paymentMethod?: string;
  vendorNotes?: string;
  customerNotes?: string;
  additionalRequirements?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ApplicationTrackingEvent {
  id: string;
  phase: ApplicationPhase;
  timestamp: string;
  description: string;
  updatedBy: 'customer' | 'vendor' | 'admin' | 'system';
  metadata?: {
    vendorId?: string;
    vendorName?: string;
    amount?: number;
    paymentMethod?: string;
    notes?: string;
  };
}

export type ApplicationStatus = 
  | "browsing_vendors"     // Customer is browsing vendors
  | "order_initiated"      // Order has been initiated
  | "order_confirmed"      // Order confirmed by vendor
  | "payment_done"         // Payment completed
  | "order_completed"      // Order completed
  | "cancelled"            // Application cancelled
  | "refunded";            // Application refunded

export type ApplicationPhase = 
  | "browsing_vendors"     // Phase 1: Browsing vendors
  | "order_initiated"      // Phase 2: Order initiated
  | "order_confirmed"      // Phase 3: Order confirmed
  | "payment_done"         // Phase 4: Payment done
  | "order_completed";     // Phase 5: Order completed

export type OrderStatus = 
  | "order_placed"           // Order placed by customer
  | "order_confirmed"        // Order confirmed by system
  | "vendor_notified"        // Vendor notified about order
  | "vendor_accepted"        // Vendor accepted the order
  | "vendor_declined"        // Vendor declined the order
  | "quotation_sent"         // Vendor sent quotation
  | "quotation_accepted"     // Customer accepted quotation
  | "quotation_rejected"     // Customer rejected quotation
  | "payment_pending"        // Payment pending
  | "payment_received"       // Payment received
  | "preparation_started"    // Vendor started preparation
  | "in_progress"           // Order in progress
  | "ready_for_delivery"    // Order ready for delivery
  | "out_for_delivery"      // Order out for delivery
  | "delivered"             // Order delivered
  | "completed"             // Order completed
  | "cancelled"             // Order cancelled
  | "refund_initiated"      // Refund initiated
  | "refunded";             // Order refunded

export interface Service {
  id?: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  priceUnit: 'fixed' | 'per_hour' | 'per_day' | 'per_person';
  city: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  features: string[];
  packages?: ServicePackage[];
  createdAt?: any;
  updatedAt?: any;
  vendorName?: string;
  vendorCompany?: string;
  vendorImage?: string;
  vendorLocation?: string;
  vendorRating?: number;
  vendorExperience?: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface Review {
  id?: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

// Firebase service functions
export const firebaseService = {
  // Vendor functions
  async getVendors(): Promise<Vendor[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
    } catch (error) {
      console.error("Error fetching vendors:", error);
      throw error;
    }
  },

  async getVendorsCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      return querySnapshot.size;
    } catch (error) {
      console.error("Error fetching vendors count:", error);
      throw error;
    }
  },

  async getVendor(id: string): Promise<Vendor | null> {
    try {
      // First try to find vendor in the "vendors" collection
      let docRef = doc(db, "vendors", id);
      let docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Vendor;
      }
      
      // If not found in "vendors", try "postorder" collection
      docRef = doc(db, "postorder", id);
      docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Vendor;
      }
      
      // If not found in "postorder", try "vendorregistration" collection
      docRef = doc(db, "vendorregistration", id);
      docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Transform vendor registration data to match Vendor interface
        return {
          id: docSnap.id,
          name: data.contactPersonName,
          businessname: data.vendorName,
          description: data.description || 'Professional vendor services',
          eventname: data.businessCategory,
          exprience: data.yearsOfExperience?.toString() || '0',
          from: data.businessAddress?.split(',')[0] || 'Unknown',
          hours: data.availabilityCalendar || 'Contact for availability',
          image: data.logo || data.samplePhotos?.[0] || '',
          location: data.businessAddress?.split(',')[1]?.trim() || 'Unknown',
          mobilenumber: data.phoneNumber,
          email: data.email,
          vendorid: data.userId || docSnap.id,
          rating: 4.5, // Default rating for new registrations
          reviewCount: 0,
          isVerified: data.approvalStatus === 'approved',
          packages: data.packages || [],
          samplePhotos: data.samplePhotos || [],
          website: data.website,
          instagram: data.instagram,
          portfolio: data.portfolio,
          gstNumber: data.gstNumber,
          paymentMethods: data.paymentMethods || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isVendorRegistration: true
        } as Vendor;
      }
      
      // If not found in any collection, return null
      return null;
    } catch (error) {
      console.error("Error fetching vendor:", error);
      throw error;
    }
  },

  async getVendorsByCategory(category: string): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, "postorder"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
    } catch (error) {
      console.error("Error fetching vendors by category:", error);
      throw error;
    }
  },

  async getVendorsByLocation(location: string): Promise<Vendor[]> {
    try {
      const q = query(
        collection(db, "postorder"),
        where("location", "==", location)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
    } catch (error) {
      console.error("Error fetching vendors by location:", error);
      throw error;
    }
  },

  async searchVendors(query: string): Promise<Vendor[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      const vendors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vendor[];
      
      const lowerQuery = query.toLowerCase();
      return vendors.filter(vendor => 
        vendor.businessname?.toLowerCase().includes(lowerQuery) ||
        vendor.description?.toLowerCase().includes(lowerQuery) ||
        vendor.category?.toLowerCase().includes(lowerQuery) ||
        vendor.eventname?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("Error searching vendors:", error);
      throw error;
    }
  },

  async createVendor(vendorData: Omit<Vendor, 'id'>): Promise<Vendor> {
    try {
      const docRef = await addDoc(collection(db, "postorder"), {
        ...vendorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...vendorData
      } as Vendor;
    } catch (error) {
      console.error("Error creating vendor:", error);
      throw error;
    }
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
    try {
      const docRef = doc(db, "postorder", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating vendor:", error);
      throw error;
    }
  },

  // Postorder functions (for the new API)
  async getPostorders(): Promise<Postorder[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Postorder[];
    } catch (error) {
      console.error("Error fetching postorders:", error);
      throw error;
    }
  },

  async getPostorder(id: string): Promise<Postorder | null> {
    try {
      const docRef = doc(db, "postorder", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Postorder;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching postorder:", error);
      throw error;
    }
  },

  async getPostordersByVendor(vendorId: string): Promise<Postorder[]> {
    try {
      const q = query(
        collection(db, "postorder"),
        where("vendorid", "==", vendorId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Postorder[];
    } catch (error) {
      console.error("Error fetching postorders by vendor:", error);
      throw error;
    }
  },

  async getPostordersByCategory(category: string): Promise<Postorder[]> {
    try {
      const q = query(
        collection(db, "postorder"),
        where("category", "==", category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Postorder[];
    } catch (error) {
      console.error("Error fetching postorders by category:", error);
      throw error;
    }
  },

  async getPostordersByLocation(location: string): Promise<Postorder[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      const postorders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Postorder[];
      
      const lowerLocation = location.toLowerCase();
      return postorders.filter(postorder => 
        postorder.location?.toLowerCase().includes(lowerLocation) ||
        postorder.from?.toLowerCase().includes(lowerLocation)
      );
    } catch (error) {
      console.error("Error fetching postorders by location:", error);
      throw error;
    }
  },

  async searchPostorders(query: string): Promise<Postorder[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "postorder"));
      const postorders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Postorder[];
      
      const lowerQuery = query.toLowerCase();
      return postorders.filter(postorder => 
        postorder.businessname?.toLowerCase().includes(lowerQuery) ||
        postorder.description?.toLowerCase().includes(lowerQuery) ||
        postorder.category?.toLowerCase().includes(lowerQuery) ||
        postorder.eventname?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("Error searching postorders:", error);
      throw error;
    }
  },

  async createPostorder(postorderData: Omit<Postorder, 'id'>): Promise<Postorder> {
    try {
      const docRef = await addDoc(collection(db, "postorder"), {
        ...postorderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...postorderData
      } as Postorder;
    } catch (error) {
      console.error("Error creating postorder:", error);
      throw error;
    }
  },

  async updatePostorder(id: string, updates: Partial<Postorder>): Promise<void> {
    try {
      const docRef = doc(db, "postorder", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating postorder:", error);
      throw error;
    }
  },

  // Service functions
  async getServices(): Promise<Service[]> {
    try {
      // Fetch all services from vendorServices collection
      const querySnapshot = await getDocs(collection(db, "vendorServices"));
      const services = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];

      // Fetch vendor information for each service
      const servicesWithVendors = await Promise.all(
        services.map(async (service) => {
          try {
            if (service.vendorId) {
              const vendorDoc = await getDoc(doc(db, "vendors", service.vendorId));
              if (vendorDoc.exists()) {
                const vendorData = vendorDoc.data();
                return {
                  ...service,
                  vendorName: vendorData.name || vendorData.companyName || "Unknown Vendor",
                  vendorCompany: vendorData.companyName || vendorData.name || "Unknown Company",
                  vendorImage: vendorData.profileImage || vendorData.image || "",
                  vendorLocation: vendorData.city || vendorData.location || "",
                  vendorRating: vendorData.rating || 0,
                  vendorExperience: vendorData.experience || 0
                };
              }
            }
            return {
              ...service,
              vendorName: "Unknown Vendor",
              vendorCompany: "Unknown Company",
              vendorImage: "",
              vendorLocation: "",
              vendorRating: 0,
              vendorExperience: 0
            };
          } catch (error) {
            console.error(`Error fetching vendor for service ${service.id}:`, error);
            return {
              ...service,
              vendorName: "Unknown Vendor",
              vendorCompany: "Unknown Company",
              vendorImage: "",
              vendorLocation: "",
              vendorRating: 0,
              vendorExperience: 0
            };
          }
        })
      );

      return servicesWithVendors;
    } catch (error) {
      console.error("Error fetching services:", error);
      throw error;
    }
  },

  async getService(id: string): Promise<Service | null> {
    try {
      const docRef = doc(db, "services", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Service;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      throw error;
    }
  },

  async getServicesByVendor(vendorId: string): Promise<Service[]> {
    try {
      const q = query(
        collection(db, "vendorServices"),
        where("vendorId", "==", vendorId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
    } catch (error) {
      console.error("Error fetching services by vendor:", error);
      throw error;
    }
  },

  async createService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    try {
      const docRef = await addDoc(collection(db, "vendorServices"), {
        ...serviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...serviceData
      } as Service;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  },

  // Order functions
  async createOrder(orderData: Order): Promise<Order> {
    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      return {
        id: docRef.id,
        ...orderData
      } as Order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const q = query(collection(db, "orders"), where("orderId", "==", orderId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Order;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },


  async getVendorOrders(vendorId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, "orders"), where("acceptedVendor", "==", vendorId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error getting vendor orders:", error);
      throw error;
    }
  },

  async getPendingOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, "orders"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error getting pending orders:", error);
      throw error;
    }
  },

  async getIndividualEventRequests(): Promise<any[]> {
    try {
      const q = query(collection(db, "individualEventsRequests"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting individual event requests:", error);
      throw error;
    }
  },

  async acceptOrder(orderId: string, vendorId: string): Promise<void> {
    try {
      // First try to find in individualEventsRequests collection
      let q = query(collection(db, "individualEventsRequests"), where("requestId", "==", orderId));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // If not found, try the orders collection as fallback
        q = query(collection(db, "orders"), where("orderId", "==", orderId));
        querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error("Order not found");
        
        // Update in orders collection
        const docRef = doc(db, "orders", querySnapshot.docs[0].id);
        const timelineEntry = {
          status: "vendor_accepted",
          timestamp: new Date().toISOString(),
          description: `Order accepted by vendor ${vendorId}`
        };
        
        await updateDoc(docRef, {
          status: "vendor_accepted",
          acceptedVendor: vendorId,
          timeline: arrayUnion(timelineEntry),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update in individualEventsRequests collection
        const docRef = doc(db, "individualEventsRequests", querySnapshot.docs[0].id);
        const timelineEntry = {
          status: "vendor_accepted",
          timestamp: new Date().toISOString(),
          description: `Order accepted by vendor ${vendorId}`
        };
        
        await updateDoc(docRef, {
          status: "vendor_accepted",
          acceptedVendor: vendorId,
          timeline: arrayUnion(timelineEntry),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      throw error;
    }
  },

  // Message interfaces
  async createMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    try {
      const messagesRef = collection(db, "messages");
      const newMessage = {
        ...messageData,
        timestamp: serverTimestamp(), // Use serverTimestamp for consistent timing
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(messagesRef, newMessage);
      return {
        id: docRef.id,
        ...newMessage
      } as Message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  },

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      // First try with ordering
      const q = query(
        collection(db, "messages"), 
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (error: any) {
      // If index error, try without ordering and sort in memory
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log("Index not found, fetching without ordering and sorting in memory...");
        const q = query(
          collection(db, "messages"), 
          where("conversationId", "==", conversationId)
        );
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        
        // Sort by timestamp in memory
        return messages.sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
          return timeA - timeB;
        });
      }
      console.error("Error getting messages:", error);
      throw error;
    }
  },

  async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void> {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        status: status,
        isRead: status === 'read',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating message status:", error);
      throw error;
    }
  },

  async getConversation(participant1Id: string, participant2Id: string): Promise<Conversation | null> {
    try {
      const q = query(
        collection(db, "conversations"),
        where("participant1Id", "in", [participant1Id, participant2Id]),
        where("participant2Id", "in", [participant1Id, participant2Id])
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Conversation;
    } catch (error) {
      console.error("Error getting conversation:", error);
      throw error;
    }
  },

  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    try {
      const conversationsRef = collection(db, "conversations");
      const newConversation = {
        ...conversationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(conversationsRef, newConversation);
      return {
        id: docRef.id,
        ...newConversation
      } as Conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  },

  // Vendor Service functions
  async createVendorService(serviceData: any): Promise<any> {
    try {
      const docRef = await addDoc(collection(db, "vendorServices"), {
        ...serviceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...serviceData
      };
    } catch (error) {
      console.error("Error creating vendor service:", error);
      throw error;
    }
  },



  async updateCustomerOrder(orderId: string, updateData: any): Promise<void> {
    try {
      const docRef = doc(db, "vendorBookings", orderId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating customer order:", error);
      throw error;
    }
  },

  async getCustomerOrders(): Promise<any[]> {
    try {
      const user = auth.currentUser;
      const userEmail = user?.email || (globalThis?.localStorage?.getItem?.('customerEmail') || undefined);
      if (!user && !userEmail) {
        throw new Error("User not authenticated");
      }

      // Helper to compute total from selectedPackages
      const getBookingTotal = (packages: any[], selectedMeals?: any) => {
        if (!packages || !Array.isArray(packages)) return 0;
        return packages.reduce((sum, pkg) => {
          // For catering packages with meals
          if (pkg.meals && selectedMeals && selectedMeals[pkg.id]) {
            const selection = selectedMeals[pkg.id];
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
          const base = pkg.originalPrice || pkg.price || 0;
          const discount = pkg.discount || 0;
          return sum + (base - base * discount / 100);
        }, 0);
      };

      // Only bookings from "bookings" collection filtered by customerEmail
      const q2 = query(
        collection(db, "bookings"),
        where("customerEmail", "==", userEmail!)
      );
      const snap2 = await getDocs(q2);
      const orders = snap2.docs.map(d => {
        const data: any = d.data();
        
        // Use actual totalAmount from booking data, or calculate from packages
        const totalAmount = data.totalAmount || getBookingTotal(data.selectedPackages || [], data.selectedMeals);
        
        return {
          id: d.id,
          orderId: d.id,
          serviceName: data.vendorBusiness,
          vendorName: data.vendorName || data.vendorBusiness,
          vendorId: data.vendorId,
          vendorImage: "",
          status: data.status === 'accepted' ? 'confirmed' : data.status || 'pending',
          totalAmount,
          paidAmount: data.paidAmount || 0,
          remainingAmount: data.remainingAmount !== undefined ? data.remainingAmount : totalAmount,
          paymentStatus: data.paymentStatus || 'unpaid',
          lastPayment: data.lastPayment || null,
          paymentVerified: data.paymentVerified || false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          eventDescription: data.eventDescription,
          selectedTimeSlot: data.selectedTimeSlot,
          numberOfGuests: data.numberOfGuests,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress,
          selectedPackages: data.selectedPackages || [],
          selectedMeals: data.selectedMeals,
          originalPrice: data.originalPrice,
          negotiatedPrice: data.negotiatedPrice,
          userBudget: data.userBudget,
          convenienceFee: data.convenienceFee,
          isNegotiated: data.isNegotiated,
          finalSource: data.finalSource,
          serviceCategory: data.eventType || data.eventname || 'Service',
          notes: data.vendorNotes || undefined,
        };
      });

      // Sort desc by createdAt
      return orders.sort((a: any, b: any) => {
        const aTime = a.createdAt?.toDate?.()?.getTime?.() || new Date(a.createdAt || 0).getTime();
        const bTime = b.createdAt?.toDate?.()?.getTime?.() || new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },

  async getCustomerAnalytics(): Promise<any> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const analyticsRef = collection(db, "customerAnalytics");
      const q = query(analyticsRef, where("customerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return querySnapshot.docs[0].data();
    } catch (error) {
      console.error("Error fetching customer analytics:", error);
      throw error;
    }
  },

  // Vendor Registration functions
  async getVendorRegistrations(): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "vendorregistration"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching vendor registrations:", error);
      throw error;
    }
  },

  async getVendorRegistrationCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, "vendorregistration"));
      return querySnapshot.size;
    } catch (error) {
      console.error("Error fetching vendor registration count:", error);
      throw error;
    }
  },

  async getVendorRegistration(id: string): Promise<any | null> {
    try {
      const docRef = doc(db, "vendorregistration", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching vendor registration:", error);
      throw error;
    }
  },

  async getVendorRegistrationsByCategory(category: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, "vendorregistration"),
        where("businessCategory", "==", category)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching vendor registrations by category:", error);
      throw error;
    }
  },

  async getVendorRegistrationsByLocation(location: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, "vendorregistration"),
        where("businessAddress", ">=", location),
        where("businessAddress", "<=", location + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching vendor registrations by location:", error);
      throw error;
    }
  },

  async searchVendorRegistrations(searchTerm: string): Promise<any[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "vendorregistration"));
      const allVendors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return allVendors.filter((vendor: any) =>
        (vendor.vendorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vendor.contactPersonName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vendor.businessCategory?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vendor.businessAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (vendor.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching vendor registrations:", error);
      throw error;
    }
  },

  // Order Tracking functions
  async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    description: string, 
    updatedBy: 'customer' | 'vendor' | 'admin' | 'system',
    metadata?: any
  ): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }

      const orderData = orderSnap.data() as Order;
      const newEvent: OrderTrackingEvent = {
        id: Date.now().toString(),
        status,
        timestamp: new Date().toISOString(),
        description,
        updatedBy,
        metadata
      };

      await updateDoc(orderRef, {
        status,
        timeline: arrayUnion(newEvent),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  async addOrderTrackingEvent(
    orderId: string,
    event: Omit<OrderTrackingEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error("Order not found");
      }

      const newEvent: OrderTrackingEvent = {
        ...event,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };

      await updateDoc(orderRef, {
        timeline: arrayUnion(newEvent),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding tracking event:", error);
      throw error;
    }
  },

  async getOrderTrackingHistory(orderId: string): Promise<OrderTrackingEvent[]> {
    try {
      const order = await this.getOrder(orderId);
      return order?.timeline || [];
    } catch (error) {
      console.error("Error getting order tracking history:", error);
      throw error;
    }
  },

  async searchOrdersByPhone(phone: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, "orders"),
        where("phone", "==", phone)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error searching orders by phone:", error);
      throw error;
    }
  },

  async searchOrdersByEmail(email: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, "orders"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    } catch (error) {
      console.error("Error searching orders by email:", error);
      throw error;
    }
  },

  // Application functions
  async createApplication(applicationData: Omit<Application, 'id'>): Promise<Application> {
    try {
      const docRef = await addDoc(collection(db, "applications"), {
        ...applicationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...applicationData
      } as Application;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  },

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    try {
      // First try with ordering
      const q = query(
        collection(db, "applications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error: any) {
      // If index error, try without ordering and sort in memory
      if (error.message && error.message.includes('index')) {
        console.log("Index not available, fetching without ordering and sorting in memory...");
        try {
          const fallbackQuery = query(
            collection(db, "applications"),
            where("userId", "==", userId)
          );
          const fallbackSnapshot = await getDocs(fallbackQuery);
          const applications = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Application[];
          
          // Sort manually on the client side
          return applications.sort((a: any, b: any) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bTime.getTime() - aTime.getTime();
          });
        } catch (fallbackError) {
          console.error("Fallback query also failed:", fallbackError);
          throw fallbackError;
        }
      }
      console.error("Error fetching user applications:", error);
      throw error;
    }
  },

  async getApplication(applicationId: string): Promise<Application | null> {
    try {
      const docRef = doc(db, "applications", applicationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Application;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      throw error;
    }
  },

  async updateApplicationPhase(
    applicationId: string,
    phase: ApplicationPhase,
    status: ApplicationStatus,
    description: string,
    updatedBy: 'customer' | 'vendor' | 'admin' | 'system',
    metadata?: any
  ): Promise<void> {
    try {
      const applicationRef = doc(db, "applications", applicationId);
      const applicationSnap = await getDoc(applicationRef);
      
      if (!applicationSnap.exists()) {
        throw new Error("Application not found");
      }

      const newEvent: ApplicationTrackingEvent = {
        id: Date.now().toString(),
        phase,
        timestamp: new Date().toISOString(),
        description,
        updatedBy,
        metadata
      };

      await updateDoc(applicationRef, {
        phase,
        status,
        timeline: arrayUnion(newEvent),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating application phase:", error);
      throw error;
    }
  },

  async getApplicationsByVendor(vendorId: string): Promise<Application[]> {
    try {
      const q = query(
        collection(db, "applications"),
        where("vendorId", "==", vendorId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
    } catch (error) {
      console.error("Error fetching vendor applications:", error);
      throw error;
    }
  },

  async updateApplication(applicationId: string, updates: Partial<Application>): Promise<void> {
    try {
      const docRef = doc(db, "applications", applicationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  }
};

// Message interfaces
export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  timestamp: any; // Firebase timestamp
  isRead: boolean;
  createdAt: any; // Firebase timestamp
}

export interface Conversation {
  id?: string;
  participant1Id: string;
  participant2Id: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  orderId?: string;
  createdAt: any; // Firebase timestamp
  updatedAt: any; // Firebase timestamp
}

export interface MessageStatus {
  id?: string;
  messageId: string;
  conversationId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
  updatedBy: string;
}

// Review Services
export const reviewService = {
  // Get reviews for a service
  async getServiceReviews(serviceId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(
        reviewsRef, 
        where("serviceId", "==", serviceId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  // Create new review
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const reviewsRef = collection(db, "reviews");
      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(reviewsRef, newReview);
      return {
        id: docRef.id,
        ...newReview
      } as Review;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }
};
