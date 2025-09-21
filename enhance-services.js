// Enhance Vendor Services - Better Data Structure
console.log('🚀 Enhancing Vendor Services Data Structure...');

if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Refresh page and try again.');
} else {
  console.log('✅ Firebase available');
  
  // Enhanced service structure
  const enhancedService = {
    // Basic Info
    name: "Service Name",
    description: "Detailed description",
    shortDescription: "Brief description for cards",
    
    // Pricing
    price: 500,
    priceUnit: "per_person", // per_person, fixed, hourly
    currency: "INR",
    originalPrice: 600,
    discountPercentage: 15,
    
    // Categories
    category: "Catering",
    subcategory: "Buffet",
    tags: ["vegetarian", "buffet"],
    
    // Media
    image: "service.jpg",
    gallery: ["img1.jpg", "img2.jpg"],
    
    // Service Details
    duration: "4 hours",
    capacity: { min: 50, max: 500, unit: "guests" },
    
    // Features
    features: ["Feature 1", "Feature 2"],
    
    // Availability
    availableDays: ["monday", "tuesday", "wednesday"],
    availableTimeSlots: [
      { start: "09:00", end: "12:00", label: "Morning" },
      { start: "18:00", end: "23:00", label: "Evening" }
    ],
    
    // Requirements
    requirements: ["Kitchen access", "Power supply"],
    
    // Vendor Info
    vendorId: "vendor_uid",
    vendorName: "Business Name",
    vendorLocation: "City, State",
    
    // Status
    isActive: true,
    isFeatured: false,
    isPopular: false,
    
    // Ratings
    averageRating: 4.5,
    totalReviews: 25,
    totalBookings: 150,
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    
    // Search
    searchKeywords: ["catering", "buffet"],
    slug: "service-name-slug"
  };

  // Sample enhanced services
  const sampleServices = [
    {
      name: "Vegetarian Buffet",
      description: "Pure vegetarian buffet with 3 starters, 6 main courses, 2 desserts.",
      shortDescription: "Pure vegetarian buffet with variety",
      price: 350,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 400,
      discountPercentage: 12,
      category: "Catering",
      subcategory: "Buffet",
      tags: ["vegetarian", "buffet", "wedding"],
      image: "veg_buffet.jpg",
      gallery: ["veg_1.jpg", "veg_2.jpg"],
      duration: "4 hours",
      capacity: { min: 50, max: 500, unit: "guests" },
      features: [
        "3 vegetarian starters",
        "6 main course dishes",
        "2 dessert options",
        "Professional serving staff",
        "Setup and cleanup included"
      ],
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      availableTimeSlots: [
        { start: "09:00", end: "12:00", label: "Morning" },
        { start: "12:00", end: "16:00", label: "Afternoon" },
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Kitchen access required",
        "Power supply needed",
        "Minimum 24 hours notice"
      ],
      vendorId: "vendor1",
      vendorName: "Elite Catering Services",
      vendorLocation: "Mumbai, Maharashtra",
      isActive: true,
      isFeatured: true,
      isPopular: true,
      averageRating: 4.7,
      totalReviews: 45,
      totalBookings: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
      searchKeywords: ["vegetarian", "catering", "buffet", "wedding"],
      slug: "vegetarian-buffet-catering"
    },
    {
      name: "Non-Veg Buffet",
      description: "Includes chicken, mutton, and fish dishes with desserts.",
      shortDescription: "Non-vegetarian buffet with meat dishes",
      price: 500,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 550,
      discountPercentage: 9,
      category: "Catering",
      subcategory: "Buffet",
      tags: ["non-vegetarian", "buffet", "chicken", "mutton"],
      image: "nonveg_buffet.jpg",
      gallery: ["nonveg_1.jpg", "nonveg_2.jpg"],
      duration: "4 hours",
      capacity: { min: 50, max: 400, unit: "guests" },
      features: [
        "2 chicken dishes",
        "1 mutton dish",
        "1 fish dish",
        "3 vegetarian sides",
        "2 dessert options",
        "Professional serving staff"
      ],
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      availableTimeSlots: [
        { start: "12:00", end: "16:00", label: "Afternoon" },
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Kitchen access required",
        "Power supply needed",
        "Minimum 48 hours notice"
      ],
      vendorId: "vendor1",
      vendorName: "Elite Catering Services",
      vendorLocation: "Mumbai, Maharashtra",
      isActive: true,
      isFeatured: false,
      isPopular: true,
      averageRating: 4.5,
      totalReviews: 38,
      totalBookings: 180,
      createdAt: new Date(),
      updatedAt: new Date(),
      searchKeywords: ["non-vegetarian", "catering", "buffet", "chicken"],
      slug: "non-vegetarian-buffet-catering"
    },
    {
      name: "Live Counters",
      description: "Live dosa, chaat, pasta, and BBQ counters.",
      shortDescription: "Interactive live food counters",
      price: 600,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 700,
      discountPercentage: 14,
      category: "Catering",
      subcategory: "Live Counters",
      tags: ["live counters", "interactive", "dosa", "chaat"],
      image: "live_counter.jpg",
      gallery: ["live_1.jpg", "live_2.jpg"],
      duration: "5 hours",
      capacity: { min: 30, max: 300, unit: "guests" },
      features: [
        "Live dosa counter",
        "Chaat counter",
        "Pasta counter",
        "BBQ counter",
        "Professional chefs",
        "Interactive experience"
      ],
      availableDays: ["friday", "saturday", "sunday"],
      availableTimeSlots: [
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Outdoor space preferred",
        "Power supply needed",
        "Minimum 72 hours notice"
      ],
      vendorId: "vendor1",
      vendorName: "Elite Catering Services",
      vendorLocation: "Mumbai, Maharashtra",
      isActive: true,
      isFeatured: true,
      isPopular: false,
      averageRating: 4.8,
      totalReviews: 22,
      totalBookings: 85,
      createdAt: new Date(),
      updatedAt: new Date(),
      searchKeywords: ["live counters", "interactive", "catering"],
      slug: "live-counters-interactive-catering"
    },
    {
      name: "Premium Wedding Package",
      description: "Full-course meals with customized menus, decorations, and servers.",
      shortDescription: "Complete wedding catering package",
      price: 1000,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 1200,
      discountPercentage: 17,
      category: "Catering",
      subcategory: "Wedding Package",
      tags: ["wedding", "premium", "full-course"],
      image: "wedding_package.jpg",
      gallery: ["wedding_1.jpg", "wedding_2.jpg"],
      duration: "8 hours",
      capacity: { min: 100, max: 1000, unit: "guests" },
      features: [
        "Customized menu planning",
        "6-course meal",
        "Professional serving staff",
        "Table decorations",
        "Setup and cleanup",
        "Menu consultation"
      ],
      availableDays: ["saturday", "sunday"],
      availableTimeSlots: [
        { start: "12:00", end: "16:00", label: "Afternoon" },
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Kitchen access required",
        "Power supply needed",
        "Minimum 1 week notice"
      ],
      vendorId: "vendor1",
      vendorName: "Elite Catering Services",
      vendorLocation: "Mumbai, Maharashtra",
      isActive: true,
      isFeatured: true,
      isPopular: true,
      averageRating: 4.9,
      totalReviews: 67,
      totalBookings: 120,
      createdAt: new Date(),
      updatedAt: new Date(),
      searchKeywords: ["wedding", "premium", "catering"],
      slug: "premium-wedding-catering-package"
    }
  ];

  // Functions
  window.enhanceServices = {
    // Check current services
    checkCurrent: async () => {
      try {
        const servicesRef = window.collection(window.db, "vendorServices");
        const snapshot = await window.getDocs(servicesRef);
        console.log(`📊 Found ${snapshot.size} services`);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error checking services:', error);
      }
    },

    // Add enhanced service
    addService: async (serviceData) => {
      try {
        const servicesRef = window.collection(window.db, "vendorServices");
        const docRef = await window.addDoc(servicesRef, {
          ...serviceData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Service added: ${docRef.id}`);
        return docRef.id;
      } catch (error) {
        console.error('Error adding service:', error);
      }
    },

    // Update existing service
    updateService: async (serviceId, updates) => {
      try {
        const serviceRef = window.doc(window.db, "vendorServices", serviceId);
        await window.updateDoc(serviceRef, {
          ...updates,
          updatedAt: new Date()
        });
        console.log(`✅ Service ${serviceId} updated`);
      } catch (error) {
        console.error('Error updating service:', error);
      }
    },

    // Add all sample services
    addSamples: async () => {
      console.log('🚀 Adding sample enhanced services...');
      for (const service of sampleServices) {
        await window.enhanceServices.addService(service);
      }
      console.log('✅ All sample services added!');
    },

    // Show structure template
    showTemplate: () => {
      console.log('📋 Enhanced Service Template:');
      console.log(enhancedService);
    },

    // Show samples
    showSamples: () => {
      console.log('📋 Sample Services:');
      console.log(sampleServices);
    }
  };

  console.log('🚀 Functions available:');
  console.log('- window.enhanceServices.checkCurrent()');
  console.log('- window.enhanceServices.addService(data)');
  console.log('- window.enhanceServices.updateService(id, updates)');
  console.log('- window.enhanceServices.addSamples()');
  console.log('- window.enhanceServices.showTemplate()');
  console.log('- window.enhanceServices.showSamples()');
  
  console.log('');
  console.log('💡 Quick start: window.enhanceServices.addSamples()');
  console.log('💡 View template: window.enhanceServices.showTemplate()');
}

// Auto-check
setTimeout(async () => {
  if (window.enhanceServices) {
    await window.enhanceServices.checkCurrent();
  }
}, 1000);
