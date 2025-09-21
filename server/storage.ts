import { 
  type User, 
  type InsertUser,
  type Service,
  type InsertService,
  type Postorder,
  type InsertPostorder,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServicesByCategory(category: string): Promise<Service[]>;
  getServicesByCity(city: string): Promise<Service[]>;
  searchServices(query: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Postorder (Vendor Services)
  getPostorders(): Promise<Postorder[]>;
  getPostorder(id: string): Promise<Postorder | undefined>;
  getPostordersByVendor(vendorId: string): Promise<Postorder[]>;
  getPostordersByCategory(category: string): Promise<Postorder[]>;
  getPostordersByLocation(location: string): Promise<Postorder[]>;
  searchPostorders(query: string): Promise<Postorder[]>;
  createPostorder(postorder: InsertPostorder): Promise<Postorder>;
  updatePostorder(id: string, updates: Partial<InsertPostorder>): Promise<Postorder | undefined>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Cart
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: string, serviceId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Messages
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private services: Map<string, Service> = new Map();
  private postorders: Map<string, Postorder> = new Map();
  private orders: Map<string, Order> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private messages: Map<string, Message> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Sample services data
    const sampleServices: Service[] = [
      {
        id: "1",
        name: "Grand Palace Wedding Hall",
        description: "Luxurious wedding venue with premium amenities and beautiful decor",
        category: "Venue",
        city: "Chennai",
        price: 25000,
        priceUnit: "fixed",
        rating: 48,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "Royal Feast Catering",
        description: "Traditional and modern cuisine for all types of events",
        category: "Catering",
        city: "Chennai",
        price: 450,
        priceUnit: "person",
        rating: 49,
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      },
      {
        id: "3",
        name: "Magical Moments Decor",
        description: "Creative themes and stunning decorations for memorable events",
        category: "Decoration",
        city: "Madurai",
        price: 15000,
        priceUnit: "fixed",
        rating: 47,
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      },
      {
        id: "4",
        name: "Beat Masters DJ",
        description: "High-energy music and professional sound systems",
        category: "DJ",
        city: "Coimbatore",
        price: 8000,
        priceUnit: "fixed",
        rating: 48,
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      },
      {
        id: "5",
        name: "Sweet Dreams Bakery",
        description: "Custom wedding cakes and delicious desserts",
        category: "Cakes",
        city: "Trichy",
        price: 5500,
        priceUnit: "fixed",
        rating: 49,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      },
      {
        id: "6",
        name: "Memorable Gifts Co.",
        description: "Unique and personalized gifts for your guests",
        category: "Return Gift",
        city: "Kodaikanal",
        price: 150,
        priceUnit: "piece",
        rating: 46,
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3",
        vendorId: null,
        createdAt: new Date(),
      }
    ];

    sampleServices.forEach(service => {
      this.services.set(service.id, service);
    });

    // Sample postorders data
    const samplePostorders: Postorder[] = [
      {
        id: "1",
        vendorid: "vendor1",
        businessname: "Royal Wedding Services",
        name: "Rajesh Kumar",
        mobilenumber: "+91 98765 43210",
        email: "rajesh@royalwedding.com",
        eventname: "Wedding",
        description: "Complete wedding planning and coordination services with premium vendors and personalized attention to detail",
        category: "Wedding",
        subcategory: "Full Planning",
        price: 50000,
        priceUnit: "per_event",
        location: "Mumbai, Maharashtra",
        from: "Mumbai, Pune, Thane, Navi Mumbai",
        exprience: "8 years",
        hours: "9 AM - 8 PM, Monday to Sunday",
        features: ["Venue Selection", "Catering", "Decoration", "Photography", "Transport"],
        menu: ["Wedding Planning", "Reception Planning", "Engagement Planning"],
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3",
        collections: [
          "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3"
        ],
        rating: 48,
        reviewCount: 25,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        vendorid: "vendor2",
        businessname: "Delicious Catering Co.",
        name: "Priya Sharma",
        mobilenumber: "+91 87654 32109",
        email: "priya@deliciouscatering.com",
        eventname: "Corporate Event",
        description: "Professional catering services for corporate events, meetings, and conferences with diverse menu options",
        category: "Catering",
        subcategory: "Corporate",
        price: 450,
        priceUnit: "per_person",
        location: "Delhi, NCR",
        from: "Delhi, Gurgaon, Noida, Faridabad",
        exprience: "12 years",
        hours: "7 AM - 11 PM, Monday to Saturday",
        features: ["Multi-cuisine", "Dietary Restrictions", "Professional Staff", "Equipment"],
        menu: ["North Indian", "South Indian", "Chinese", "Continental", "Desserts"],
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3",
        coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3",
        collections: [
          "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3"
        ],
        rating: 49,
        reviewCount: 42,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    samplePostorders.forEach(postorder => {
      this.postorders.set(postorder.id, postorder);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => 
      service.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getServicesByCity(city: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => 
      service.city.toLowerCase() === city.toLowerCase()
    );
  }

  async searchServices(query: string): Promise<Service[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.services.values()).filter(service =>
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery) ||
      service.category.toLowerCase().includes(lowerQuery)
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = {
      ...insertService,
      id,
      rating: 0,
      createdAt: new Date()
    };
    this.services.set(id, service);
    return service;
  }

  // Postorder (Vendor Services)
  async getPostorders(): Promise<Postorder[]> {
    return Array.from(this.postorders.values());
  }

  async getPostorder(id: string): Promise<Postorder | undefined> {
    return this.postorders.get(id);
  }

  async getPostordersByVendor(vendorId: string): Promise<Postorder[]> {
    return Array.from(this.postorders.values()).filter(postorder => 
      postorder.vendorid === vendorId
    );
  }

  async getPostordersByCategory(category: string): Promise<Postorder[]> {
    return Array.from(this.postorders.values()).filter(postorder => 
      postorder.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getPostordersByLocation(location: string): Promise<Postorder[]> {
    const lowerLocation = location.toLowerCase();
    return Array.from(this.postorders.values()).filter(postorder => 
      postorder.location.toLowerCase().includes(lowerLocation) ||
      postorder.from.toLowerCase().includes(lowerLocation)
    );
  }

  async searchPostorders(query: string): Promise<Postorder[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.postorders.values()).filter(postorder =>
      postorder.businessname.toLowerCase().includes(lowerQuery) ||
      postorder.description.toLowerCase().includes(lowerQuery) ||
      postorder.category.toLowerCase().includes(lowerQuery) ||
      postorder.eventname.toLowerCase().includes(lowerQuery)
    );
  }

  async createPostorder(insertPostorder: InsertPostorder): Promise<Postorder> {
    const id = randomUUID();
    const postorder: Postorder = {
      ...insertPostorder,
      id,
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.postorders.set(id, postorder);
    return postorder;
  }

  async updatePostorder(id: string, updates: Partial<InsertPostorder>): Promise<Postorder | undefined> {
    const postorder = this.postorders.get(id);
    if (!postorder) return undefined;
    
    const updatedPostorder = { ...postorder, ...updates, updatedAt: new Date() };
    this.postorders.set(id, updatedPostorder);
    return updatedPostorder;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertItem.userId && item.serviceId === insertItem.serviceId
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (insertItem.quantity || 1);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertItem,
      id,
      createdAt: new Date()
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(userId: string, serviceId: string): Promise<boolean> {
    const item = Array.from(this.cartItems.values()).find(
      item => item.userId === userId && item.serviceId === serviceId
    );
    
    if (item) {
      this.cartItems.delete(item.id);
      return true;
    }
    return false;
  }

  async clearCart(userId: string): Promise<boolean> {
    const userItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    userItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // Messages
  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message =>
      (message.senderId === userId1 && message.receiverId === userId2) ||
      (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (message) {
      message.isRead = true;
      this.messages.set(id, message);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
