// Browser Console Script to Set Up Orders Collection
// Run this in your browser console on the Planora application

console.log("🚀 Setting up Orders collection structure...");

// Function to create sample order document structure
function createSampleOrder() {
  const sampleOrder = {
    // Customer Information
    fullName: "John Doe",
    phoneNumber: "+91 9876543210",
    email: "john.doe@example.com",
    address: "123 Main Street, Chennai, Tamil Nadu 600001",
    
    // Event Information
    eventDate: "2025-10-15",
    numberOfGuests: 100,
    eventLocation: "Taj Coromandel, Chennai",
    eventDescription: "Wedding reception for 100 guests with vegetarian catering",
    
    // Selected Package
    selectedPackage: {
      id: "pkg_001",
      name: "Premium Veg Package",
      packageName: "Premium Veg Package",
      originalPrice: 50000,
      discount: 5,
      finalPrice: 47500,
      capacity: 100,
      priceUnit: "per event",
      packageFeatures: ["Fresh vegetables", "Premium rice", "Desserts", "Beverages"]
    },
    
    // Quick Invoice Details
    quickInvoice: {
      packageName: "Premium Veg Package",
      originalPrice: 50000,
      discount: 3, // Progressive discount applied
      discountedPrice: 48500,
      convenienceFee: 500, // 1% of original price
      totalAmount: 49000,
      orderId: "ORD" + Date.now()
    },
    
    // Vendor Details
    vendorDetails: {
      businessName: "GrowMore Event Planner",
      vendorName: "Kadhir",
      email: "kadhir@growmore.com",
      phone: "7200212745",
      location: "Chennai"
    },
    
    // System Fields
    customerId: "customer_uid_here",
    vendorId: "vendor_uid_here",
    status: "initiated", // initiated, confirmed, in_progress, completed, cancelled
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Additional Fields
    paymentStatus: "pending", // pending, paid, refunded
    notes: "Customer requested extra desserts",
    timeline: [
      {
        status: "initiated",
        timestamp: new Date(),
        message: "Order initiated by customer"
      }
    ]
  };
  
  return sampleOrder;
}

// Function to create the orders collection with proper structure
async function setupOrdersCollection() {
  try {
    console.log("📊 Creating orders collection structure...");
    
    // Check if Firebase is available
    if (typeof window === 'undefined' || !window.db) {
      console.error("❌ Firebase not available. Make sure you're running this in the browser console on the Planora app.");
      return;
    }
    
    // Create a sample order to establish the collection structure
    const sampleOrder = createSampleOrder();
    
    // Add the sample order to the orders collection
    const docRef = await window.addDoc(window.collection(window.db, "orders"), sampleOrder);
    console.log("✅ Sample order created with ID:", docRef.id);
    
    // Create indexes for better query performance
    console.log("📈 Orders collection structure created successfully!");
    console.log("📋 Collection fields:");
    console.log("   - Customer Info: fullName, phoneNumber, email, address");
    console.log("   - Event Info: eventDate, numberOfGuests, eventLocation, eventDescription");
    console.log("   - Package: selectedPackage (object with package details)");
    console.log("   - Invoice: quickInvoice (object with pricing breakdown)");
    console.log("   - Vendor: vendorDetails (object with vendor info)");
    console.log("   - System: customerId, vendorId, status, createdAt, updatedAt");
    console.log("   - Additional: paymentStatus, notes, timeline");
    
    console.log("🎉 Orders collection is ready to use!");
    
  } catch (error) {
    console.error("❌ Error setting up orders collection:", error);
  }
}

// Function to create additional sample orders for testing
async function createTestOrders() {
  try {
    console.log("🧪 Creating test orders...");
    
    const testOrders = [
      {
        fullName: "Sarah Johnson",
        phoneNumber: "+91 9876543211",
        email: "sarah.johnson@example.com",
        address: "456 Park Avenue, Mumbai, Maharashtra 400001",
        eventDate: "2025-11-20",
        numberOfGuests: 50,
        eventLocation: "The Leela, Mumbai",
        eventDescription: "Corporate event for 50 people",
        selectedPackage: {
          id: "pkg_002",
          name: "Corporate Package",
          originalPrice: 25000,
          discount: 2,
          finalPrice: 24500,
          capacity: 50,
          priceUnit: "per event"
        },
        quickInvoice: {
          packageName: "Corporate Package",
          originalPrice: 25000,
          discount: 2,
          discountedPrice: 24500,
          convenienceFee: 250,
          totalAmount: 24750,
          orderId: "ORD" + (Date.now() + 1)
        },
        vendorDetails: {
          businessName: "Tutoapp",
          vendorName: "Baskar U",
          email: "baskar@tutoapp.com",
          phone: "9876543210",
          location: "Chennai"
        },
        customerId: "customer_uid_2",
        vendorId: "vendor_uid_2",
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentStatus: "paid"
      },
      {
        fullName: "Michael Chen",
        phoneNumber: "+91 9876543212",
        email: "michael.chen@example.com",
        address: "789 Garden Road, Bangalore, Karnataka 560001",
        eventDate: "2025-12-10",
        numberOfGuests: 200,
        eventLocation: "ITC Gardenia, Bangalore",
        eventDescription: "Wedding ceremony and reception",
        selectedPackage: {
          id: "pkg_003",
          name: "Royal Wedding Package",
          originalPrice: 100000,
          discount: 5,
          finalPrice: 95000,
          capacity: 200,
          priceUnit: "per event"
        },
        quickInvoice: {
          packageName: "Royal Wedding Package",
          originalPrice: 100000,
          discount: 5,
          discountedPrice: 95000,
          convenienceFee: 1000,
          totalAmount: 96000,
          orderId: "ORD" + (Date.now() + 2)
        },
        vendorDetails: {
          businessName: "GrowMore Event Planner",
          vendorName: "Kadhir",
          email: "kadhir@growmore.com",
          phone: "7200212745",
          location: "Chennai"
        },
        customerId: "customer_uid_3",
        vendorId: "vendor_uid_1",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentStatus: "pending"
      }
    ];
    
    for (const order of testOrders) {
      const docRef = await window.addDoc(window.collection(window.db, "orders"), order);
      console.log("✅ Test order created with ID:", docRef.id);
    }
    
    console.log("🎉 Test orders created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating test orders:", error);
  }
}

// Main execution
console.log("Choose an option:");
console.log("1. setupOrdersCollection() - Create the orders collection structure");
console.log("2. createTestOrders() - Create sample test orders");
console.log("3. Both - Run both functions");

// Auto-run the setup
setupOrdersCollection();

