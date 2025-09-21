// Enhance Customer CRM - Comprehensive CRM System
console.log('🚀 Enhancing Customer CRM System...');

if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Refresh page and try again.');
} else {
  console.log('✅ Firebase available');
  
  // Enhanced CRM data structure
  const enhancedCRMStructure = {
    // Customer Profile Enhancement
    customerProfile: {
      id: "customer_uid",
      name: "Customer Name",
      email: "customer@email.com",
      phone: "+91 98765 43210",
      avatar: "avatar_url",
      
      // CRM Specific Fields
      customerType: "premium", // basic, premium, enterprise
      totalSpent: 150000,
      totalOrders: 25,
      averageOrderValue: 6000,
      lastOrderDate: new Date(),
      preferredCategories: ["Catering", "Photography"],
      preferredVendors: ["vendor1", "vendor2"],
      
      // Communication Preferences
      communicationPreferences: {
        email: true,
        sms: false,
        pushNotifications: true,
        marketingEmails: false
      },
      
      // Addresses
      addresses: [
        {
          id: "addr1",
          type: "home",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          isDefault: true
        }
      ],
      
      // Payment Methods
      paymentMethods: [
        {
          id: "pm1",
          type: "card",
          last4: "1234",
          brand: "Visa",
          isDefault: true
        }
      ],
      
      // CRM Analytics
      analytics: {
        totalSpent: 150000,
        averageOrderValue: 6000,
        orderFrequency: "monthly",
        preferredTimeSlots: ["evening", "afternoon"],
        preferredEventTypes: ["wedding", "corporate"],
        customerLifetimeValue: 200000,
        retentionScore: 85
      },
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date()
    },

    // Enhanced Order Structure
    enhancedOrder: {
      id: "order_id",
      orderId: "CUST-ORDER-001",
      customerId: "customer_uid",
      customerName: "Customer Name",
      customerEmail: "customer@email.com",
      customerPhone: "+91 98765 43210",
      
      // Service Details
      serviceId: "service_id",
      serviceName: "Wedding Photography Package",
      serviceCategory: "Photography",
      serviceSubcategory: "Wedding",
      vendorId: "vendor_id",
      vendorName: "Elite Photography Studio",
      vendorEmail: "vendor@email.com",
      vendorPhone: "+91 98765 43211",
      
      // Event Details
      eventType: "wedding",
      eventDate: new Date(),
      eventTime: "18:00-23:00",
      eventDuration: "5 hours",
      guestCount: 200,
      eventLocation: "Taj Palace, Mumbai",
      eventAddress: "123 Palace Road, Mumbai",
      
      // Order Details
      orderAmount: 25000,
      originalAmount: 30000,
      discountAmount: 5000,
      discountPercentage: 17,
      taxAmount: 2500,
      totalAmount: 27500,
      currency: "INR",
      
      // Payment Details
      paymentStatus: "paid", // pending, paid, failed, refunded
      paymentMethod: "card",
      paymentDate: new Date(),
      paymentTransactionId: "txn_123456",
      
      // Order Status
      status: "confirmed", // pending, confirmed, in_progress, completed, cancelled
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed"
        },
        {
          status: "confirmed",
          timestamp: new Date(),
          note: "Vendor confirmed booking"
        }
      ],
      
      // Requirements & Preferences
      requirements: [
        "Professional setup",
        "High-quality photos",
        "Album included"
      ],
      specialInstructions: "Please arrive 30 minutes early for setup",
      dietaryRestrictions: [],
      
      // Communication
      messages: [
        {
          id: "msg1",
          sender: "customer",
          senderName: "Customer Name",
          message: "Hi, can you confirm the timing?",
          timestamp: new Date(),
          attachments: []
        }
      ],
      
      // Files & Documents
      attachments: [
        {
          id: "att1",
          name: "Event Schedule.pdf",
          url: "https://example.com/file.pdf",
          type: "document",
          uploadedBy: "customer",
          uploadedAt: new Date()
        }
      ],
      
      // Timeline & Milestones
      timeline: [
        {
          id: "milestone1",
          title: "Order Placed",
          description: "Customer placed the order",
          timestamp: new Date(),
          type: "order_placed",
          completed: true
        },
        {
          id: "milestone2",
          title: "Vendor Confirmed",
          description: "Vendor confirmed the booking",
          timestamp: new Date(),
          type: "vendor_confirmed",
          completed: true
        },
        {
          id: "milestone3",
          title: "Event Day",
          description: "Event scheduled",
          timestamp: new Date(),
          type: "event_day",
          completed: false
        }
      ],
      
      // Reviews & Ratings
      review: {
        rating: 5,
        comment: "Excellent service!",
        reviewDate: new Date(),
        vendorResponse: "Thank you for your feedback!",
        responseDate: new Date()
      },
      
      // CRM Fields
      priority: "high", // low, medium, high, urgent
      tags: ["wedding", "premium", "photography"],
      notes: "VIP customer - handle with care",
      followUpDate: new Date(),
      followUpStatus: "pending",
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      confirmedAt: new Date(),
      completedAt: null
    },

    // Communication System
    communication: {
      id: "conv_id",
      orderId: "order_id",
      customerId: "customer_uid",
      vendorId: "vendor_id",
      
      messages: [
        {
          id: "msg1",
          sender: "customer",
          senderName: "Customer Name",
          message: "Hi, can you confirm the timing?",
          timestamp: new Date(),
          readAt: new Date(),
          attachments: []
        }
      ],
      
      status: "active", // active, archived, resolved
      lastMessageAt: new Date(),
      unreadCount: {
        customer: 0,
        vendor: 1
      }
    },

    // Customer Analytics
    customerAnalytics: {
      customerId: "customer_uid",
      
      // Order Analytics
      orderStats: {
        totalOrders: 25,
        pendingOrders: 2,
        confirmedOrders: 5,
        completedOrders: 18,
        cancelledOrders: 0,
        averageOrderValue: 6000,
        totalSpent: 150000
      },
      
      // Category Preferences
      categoryPreferences: [
        {
          category: "Catering",
          orderCount: 10,
          totalSpent: 80000,
          averageRating: 4.5
        },
        {
          category: "Photography",
          orderCount: 8,
          totalSpent: 45000,
          averageRating: 4.8
        }
      ],
      
      // Vendor Preferences
      vendorPreferences: [
        {
          vendorId: "vendor1",
          vendorName: "Elite Catering",
          orderCount: 5,
          totalSpent: 40000,
          averageRating: 4.6
        }
      ],
      
      // Time Patterns
      timePatterns: {
        preferredDays: ["saturday", "sunday"],
        preferredTimeSlots: ["evening", "afternoon"],
        averageAdvanceBooking: 30 // days
      },
      
      // Event Patterns
      eventPatterns: {
        preferredEventTypes: ["wedding", "corporate"],
        averageGuestCount: 150,
        seasonalPreferences: ["winter", "spring"]
      },
      
      // Communication Patterns
      communicationPatterns: {
        averageResponseTime: 2, // hours
        preferredContactMethod: "email",
        messageFrequency: "medium"
      },
      
      // Financial Patterns
      financialPatterns: {
        averageOrderValue: 6000,
        paymentMethodPreference: "card",
        discountUtilization: 80 // percentage
      },
      
      // Loyalty & Retention
      loyaltyMetrics: {
        customerLifetimeValue: 200000,
        retentionScore: 85,
        repeatOrderRate: 75,
        referralCount: 3
      },
      
      updatedAt: new Date()
    }
  };

  // Sample enhanced data
  const sampleCRMData = {
    // Enhanced customer profile
    enhancedCustomer: {
      id: "BSRYqif4yEV3iK89RP23UgHfZnE3",
      name: "Rahul Kumar",
      email: "rahul.kumar@email.com",
      phone: "+91 98765 43210",
      avatar: "https://example.com/avatar.jpg",
      customerType: "premium",
      totalSpent: 150000,
      totalOrders: 25,
      averageOrderValue: 6000,
      lastOrderDate: new Date(),
      preferredCategories: ["Catering", "Photography", "Decoration"],
      preferredVendors: ["vendor1", "vendor2", "vendor3"],
      communicationPreferences: {
        email: true,
        sms: false,
        pushNotifications: true,
        marketingEmails: false
      },
      addresses: [
        {
          id: "addr1",
          type: "home",
          address: "123 Main Street, Andheri West",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400058",
          isDefault: true
        },
        {
          id: "addr2",
          type: "office",
          address: "456 Business Park, Bandra East",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400051",
          isDefault: false
        }
      ],
      paymentMethods: [
        {
          id: "pm1",
          type: "card",
          last4: "1234",
          brand: "Visa",
          isDefault: true
        },
        {
          id: "pm2",
          type: "card",
          last4: "5678",
          brand: "Mastercard",
          isDefault: false
        }
      ],
      analytics: {
        totalSpent: 150000,
        averageOrderValue: 6000,
        orderFrequency: "monthly",
        preferredTimeSlots: ["evening", "afternoon"],
        preferredEventTypes: ["wedding", "corporate"],
        customerLifetimeValue: 200000,
        retentionScore: 85
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date()
    },

    // Enhanced orders
    enhancedOrders: [
      {
        id: "order1",
        orderId: "CUST-ORDER-001",
        customerId: "BSRYqif4yEV3iK89RP23UgHfZnE3",
        customerName: "Rahul Kumar",
        customerEmail: "rahul.kumar@email.com",
        customerPhone: "+91 98765 43210",
        serviceId: "service1",
        serviceName: "Wedding Photography Package",
        serviceCategory: "Photography",
        serviceSubcategory: "Wedding",
        vendorId: "vendor1",
        vendorName: "Elite Photography Studio",
        vendorEmail: "elite@photography.com",
        vendorPhone: "+91 98765 43211",
        eventType: "wedding",
        eventDate: new Date("2024-06-15"),
        eventTime: "18:00-23:00",
        eventDuration: "5 hours",
        guestCount: 200,
        eventLocation: "Taj Palace, Mumbai",
        eventAddress: "123 Palace Road, Mumbai",
        orderAmount: 25000,
        originalAmount: 30000,
        discountAmount: 5000,
        discountPercentage: 17,
        taxAmount: 2500,
        totalAmount: 27500,
        currency: "INR",
        paymentStatus: "paid",
        paymentMethod: "card",
        paymentDate: new Date(),
        paymentTransactionId: "txn_123456",
        status: "confirmed",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date("2024-05-01"),
            note: "Order placed"
          },
          {
            status: "confirmed",
            timestamp: new Date("2024-05-02"),
            note: "Vendor confirmed booking"
          }
        ],
        requirements: [
          "Professional setup",
          "High-quality photos",
          "Album included",
          "Drone photography"
        ],
        specialInstructions: "Please arrive 30 minutes early for setup. Need both indoor and outdoor shots.",
        messages: [
          {
            id: "msg1",
            sender: "customer",
            senderName: "Rahul Kumar",
            message: "Hi, can you confirm the timing and also let me know if drone photography is included?",
            timestamp: new Date("2024-05-01T10:00:00"),
            attachments: []
          },
          {
            id: "msg2",
            sender: "vendor",
            senderName: "Elite Photography Studio",
            message: "Yes, drone photography is included in the package. We'll arrive at 5:30 PM for setup.",
            timestamp: new Date("2024-05-01T11:30:00"),
            attachments: []
          }
        ],
        attachments: [
          {
            id: "att1",
            name: "Wedding Schedule.pdf",
            url: "https://example.com/wedding-schedule.pdf",
            type: "document",
            uploadedBy: "customer",
            uploadedAt: new Date("2024-05-01")
          }
        ],
        timeline: [
          {
            id: "milestone1",
            title: "Order Placed",
            description: "Customer placed the order",
            timestamp: new Date("2024-05-01"),
            type: "order_placed",
            completed: true
          },
          {
            id: "milestone2",
            title: "Vendor Confirmed",
            description: "Vendor confirmed the booking",
            timestamp: new Date("2024-05-02"),
            type: "vendor_confirmed",
            completed: true
          },
          {
            id: "milestone3",
            title: "Event Day",
            description: "Wedding photography scheduled",
            timestamp: new Date("2024-06-15"),
            type: "event_day",
            completed: false
          }
        ],
        priority: "high",
        tags: ["wedding", "premium", "photography", "drone"],
        notes: "VIP customer - handle with care. Wedding is at a premium venue.",
        followUpDate: new Date("2024-06-10"),
        followUpStatus: "pending",
        createdAt: new Date("2024-05-01"),
        updatedAt: new Date(),
        confirmedAt: new Date("2024-05-02"),
        completedAt: null
      },
      {
        id: "order2",
        orderId: "CUST-ORDER-002",
        customerId: "BSRYqif4yEV3iK89RP23UgHfZnE3",
        customerName: "Rahul Kumar",
        customerEmail: "rahul.kumar@email.com",
        customerPhone: "+91 98765 43210",
        serviceId: "service2",
        serviceName: "Birthday Party Catering",
        serviceCategory: "Catering",
        serviceSubcategory: "Buffet",
        vendorId: "vendor2",
        vendorName: "Elite Catering Services",
        vendorEmail: "elite@catering.com",
        vendorPhone: "+91 98765 43212",
        eventType: "birthday",
        eventDate: new Date("2024-05-20"),
        eventTime: "19:00-22:00",
        eventDuration: "3 hours",
        guestCount: 50,
        eventLocation: "Home, Mumbai",
        eventAddress: "123 Main Street, Andheri West, Mumbai",
        orderAmount: 15000,
        originalAmount: 15000,
        discountAmount: 0,
        discountPercentage: 0,
        taxAmount: 1500,
        totalAmount: 16500,
        currency: "INR",
        paymentStatus: "paid",
        paymentMethod: "card",
        paymentDate: new Date(),
        paymentTransactionId: "txn_123457",
        status: "confirmed",
        statusHistory: [
          {
            status: "pending",
            timestamp: new Date("2024-04-15"),
            note: "Order placed"
          },
          {
            status: "confirmed",
            timestamp: new Date("2024-04-16"),
            note: "Vendor confirmed booking"
          }
        ],
        requirements: [
          "Vegetarian menu",
          "Birthday cake included",
          "Professional serving staff"
        ],
        specialInstructions: "Vegetarian menu preferred. Need birthday cake with 'Happy Birthday Rahul' written on it.",
        messages: [
          {
            id: "msg1",
            sender: "customer",
            senderName: "Rahul Kumar",
            message: "Can you customize the birthday cake with my name?",
            timestamp: new Date("2024-04-15T14:00:00"),
            attachments: []
          }
        ],
        attachments: [],
        timeline: [
          {
            id: "milestone1",
            title: "Order Placed",
            description: "Customer placed the order",
            timestamp: new Date("2024-04-15"),
            type: "order_placed",
            completed: true
          },
          {
            id: "milestone2",
            title: "Vendor Confirmed",
            description: "Vendor confirmed the booking",
            timestamp: new Date("2024-04-16"),
            type: "vendor_confirmed",
            completed: true
          },
          {
            id: "milestone3",
            title: "Event Day",
            description: "Birthday party catering",
            timestamp: new Date("2024-05-20"),
            type: "event_day",
            completed: false
          }
        ],
        priority: "medium",
        tags: ["birthday", "catering", "vegetarian"],
        notes: "Birthday party for 50 guests. Vegetarian menu required.",
        followUpDate: new Date("2024-05-18"),
        followUpStatus: "pending",
        createdAt: new Date("2024-04-15"),
        updatedAt: new Date(),
        confirmedAt: new Date("2024-04-16"),
        completedAt: null
      }
    ],

    // Customer analytics
    customerAnalytics: {
      customerId: "BSRYqif4yEV3iK89RP23UgHfZnE3",
      orderStats: {
        totalOrders: 25,
        pendingOrders: 2,
        confirmedOrders: 5,
        completedOrders: 18,
        cancelledOrders: 0,
        averageOrderValue: 6000,
        totalSpent: 150000
      },
      categoryPreferences: [
        {
          category: "Catering",
          orderCount: 10,
          totalSpent: 80000,
          averageRating: 4.5
        },
        {
          category: "Photography",
          orderCount: 8,
          totalSpent: 45000,
          averageRating: 4.8
        },
        {
          category: "Decoration",
          orderCount: 5,
          totalSpent: 20000,
          averageRating: 4.3
        }
      ],
      vendorPreferences: [
        {
          vendorId: "vendor1",
          vendorName: "Elite Photography Studio",
          orderCount: 5,
          totalSpent: 40000,
          averageRating: 4.6
        },
        {
          vendorId: "vendor2",
          vendorName: "Elite Catering Services",
          orderCount: 3,
          totalSpent: 35000,
          averageRating: 4.4
        }
      ],
      timePatterns: {
        preferredDays: ["saturday", "sunday"],
        preferredTimeSlots: ["evening", "afternoon"],
        averageAdvanceBooking: 30
      },
      eventPatterns: {
        preferredEventTypes: ["wedding", "corporate", "birthday"],
        averageGuestCount: 150,
        seasonalPreferences: ["winter", "spring"]
      },
      communicationPatterns: {
        averageResponseTime: 2,
        preferredContactMethod: "email",
        messageFrequency: "medium"
      },
      financialPatterns: {
        averageOrderValue: 6000,
        paymentMethodPreference: "card",
        discountUtilization: 80
      },
      loyaltyMetrics: {
        customerLifetimeValue: 200000,
        retentionScore: 85,
        repeatOrderRate: 75,
        referralCount: 3
      },
      updatedAt: new Date()
    }
  };

  // Functions
  window.enhanceCustomerCRM = {
    // Check current customer data
    checkCurrentData: async () => {
      try {
        console.log('🔍 Checking current customer data...');
        
        // Check customer profile
        const user = window.auth.currentUser;
        if (!user) {
          console.log('❌ No user logged in');
          return;
        }

        const customerProfileRef = window.doc(window.db, "users", user.uid);
        const customerProfile = await window.getDoc(customerProfileRef);
        
        // Check orders
        const ordersRef = window.collection(window.db, "vendorBookings");
        const ordersQuery = window.query(ordersRef, window.where("customerId", "==", user.uid));
        const ordersSnapshot = await window.getDocs(ordersQuery);
        
        console.log(`📊 Found ${ordersSnapshot.size} orders for customer`);
        
        return {
          customerProfile: customerProfile.exists() ? customerProfile.data() : null,
          orders: ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        };
      } catch (error) {
        console.error('Error checking customer data:', error);
      }
    },

    // Enhance customer profile
    enhanceCustomerProfile: async () => {
      try {
        const user = window.auth.currentUser;
        if (!user) {
          console.log('❌ No user logged in');
          return;
        }

        console.log('🚀 Enhancing customer profile...');
        
        const customerProfileRef = window.doc(window.db, "users", user.uid);
        await window.updateDoc(customerProfileRef, {
          ...sampleCRMData.enhancedCustomer,
          updatedAt: new Date()
        });
        
        console.log('✅ Customer profile enhanced!');
      } catch (error) {
        console.error('Error enhancing customer profile:', error);
      }
    },

    // Add enhanced orders
    addEnhancedOrders: async () => {
      try {
        const user = window.auth.currentUser;
        if (!user) {
          console.log('❌ No user logged in');
          return;
        }

        console.log('🚀 Adding enhanced orders...');
        
        const ordersRef = window.collection(window.db, "vendorBookings");
        
        for (const order of sampleCRMData.enhancedOrders) {
          // Update customer ID to current user
          order.customerId = user.uid;
          order.customerName = user.displayName || "Customer";
          order.customerEmail = user.email || "";
          
          await window.addDoc(ordersRef, {
            ...order,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        console.log('✅ Enhanced orders added!');
      } catch (error) {
        console.error('Error adding enhanced orders:', error);
      }
    },

    // Add customer analytics
    addCustomerAnalytics: async () => {
      try {
        const user = window.auth.currentUser;
        if (!user) {
          console.log('❌ No user logged in');
          return;
        }

        console.log('🚀 Adding customer analytics...');
        
        const analyticsRef = window.collection(window.db, "customerAnalytics");
        await window.addDoc(analyticsRef, {
          ...sampleCRMData.customerAnalytics,
          customerId: user.uid,
          updatedAt: new Date()
        });
        
        console.log('✅ Customer analytics added!');
      } catch (error) {
        console.error('Error adding customer analytics:', error);
      }
    },

    // Complete CRM setup
    setupCompleteCRM: async () => {
      console.log('🚀 Setting up complete CRM system...');
      
      await window.enhanceCustomerCRM.enhanceCustomerProfile();
      await window.enhanceCustomerCRM.addEnhancedOrders();
      await window.enhanceCustomerCRM.addCustomerAnalytics();
      
      console.log('✅ Complete CRM setup finished!');
    },

    // Show CRM structure
    showStructure: () => {
      console.log('📋 Enhanced CRM Structure:');
      console.log(enhancedCRMStructure);
    },

    // Show sample data
    showSamples: () => {
      console.log('📋 Sample CRM Data:');
      console.log(sampleCRMData);
    }
  };

  console.log('🚀 CRM Enhancement functions available:');
  console.log('- window.enhanceCustomerCRM.checkCurrentData()');
  console.log('- window.enhanceCustomerCRM.enhanceCustomerProfile()');
  console.log('- window.enhanceCustomerCRM.addEnhancedOrders()');
  console.log('- window.enhanceCustomerCRM.addCustomerAnalytics()');
  console.log('- window.enhanceCustomerCRM.setupCompleteCRM()');
  console.log('- window.enhanceCustomerCRM.showStructure()');
  console.log('- window.enhanceCustomerCRM.showSamples()');
  
  console.log('');
  console.log('💡 Quick start: window.enhanceCustomerCRM.setupCompleteCRM()');
  console.log('💡 View structure: window.enhanceCustomerCRM.showStructure()');
}

// Auto-check
setTimeout(async () => {
  if (window.enhanceCustomerCRM) {
    await window.enhanceCustomerCRM.checkCurrentData();
  }
}, 1000);
