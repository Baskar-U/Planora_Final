// Enhance Vendor Services Data Structure
// Run this in the browser console to update existing services with better fields

console.log('🚀 Enhancing Vendor Services Data Structure...');

// Check if Firebase functions are available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase functions not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase functions available');
  
  // Enhanced service structure with better fields
  const enhancedServiceStructure = {
    // Basic Information
    id: "unique_id",
    name: "Service Name",
    description: "Detailed service description",
    shortDescription: "Brief description for cards",
    
    // Pricing
    price: 500,
    priceUnit: "per_person", // per_person, fixed, hourly, daily
    currency: "INR",
    originalPrice: 600, // for showing discounts
    discountPercentage: 15, // if applicable
    
    // Categories and Tags
    category: "Catering", // Photography, Catering, Entertainment, etc.
    subcategory: "Buffet", // Wedding, Corporate, Birthday, etc.
    tags: ["vegetarian", "buffet", "wedding"],
    
    // Media
    image: "service_image.jpg",
    gallery: ["image1.jpg", "image2.jpg", "image3.jpg"],
    videoUrl: "https://youtube.com/watch?v=...",
    
    // Service Details
    duration: "4 hours", // How long the service takes
    capacity: {
      minGuests: 50,
      maxGuests: 500,
      unit: "guests"
    },
    
    // Features and Inclusions
    features: [
      "3 starters",
      "6 main courses", 
      "2 desserts",
      "Professional servers",
      "Setup and cleanup"
    ],
    
    // Availability
    availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    availableTimeSlots: [
      { start: "09:00", end: "12:00", label: "Morning" },
      { start: "12:00", end: "16:00", label: "Afternoon" },
      { start: "18:00", end: "23:00", label: "Evening" }
    ],
    
    // Requirements
    requirements: [
      "Kitchen access required",
      "Power supply needed",
      "Minimum 24 hours notice"
    ],
    
    // Vendor Information
    vendorId: "vendor_uid",
    vendorName: "Vendor Business Name",
    vendorLocation: "City, State",
    
    // Status and Visibility
    isActive: true,
    isFeatured: false,
    isPopular: false,
    
    // Ratings and Reviews
    averageRating: 4.5,
    totalReviews: 25,
    totalBookings: 150,
    
    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
    lastBookedAt: new Date(),
    
    // SEO and Search
    searchKeywords: ["catering", "buffet", "vegetarian", "wedding"],
    slug: "vegetarian-buffet-catering"
  };

  // Sample enhanced services data
  const sampleEnhancedServices = [
    {
      id: "1",
      name: "Vegetarian Buffet",
      description: "Pure vegetarian buffet with 3 starters, 6 main courses, 2 desserts. Perfect for weddings, corporate events, and family gatherings.",
      shortDescription: "Pure vegetarian buffet with variety",
      price: 350,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 400,
      discountPercentage: 12,
      category: "Catering",
      subcategory: "Buffet",
      tags: ["vegetarian", "buffet", "wedding", "corporate"],
      image: "veg_buffet.jpg",
      gallery: ["veg_buffet_1.jpg", "veg_buffet_2.jpg", "veg_buffet_3.jpg"],
      videoUrl: "",
      duration: "4 hours",
      capacity: {
        minGuests: 50,
        maxGuests: 500,
        unit: "guests"
      },
      features: [
        "3 vegetarian starters",
        "6 main course dishes",
        "2 dessert options",
        "Professional serving staff",
        "Setup and cleanup included",
        "Customizable menu options",
        "Fresh ingredients only"
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
        "Minimum 24 hours notice",
        "Access to water supply"
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
      lastBookedAt: new Date(),
      searchKeywords: ["vegetarian", "catering", "buffet", "wedding", "corporate"],
      slug: "vegetarian-buffet-catering"
    },
    {
      id: "2",
      name: "Non-Veg Buffet",
      description: "Includes chicken, mutton, and fish dishes with desserts. Perfect for non-vegetarian events and celebrations.",
      shortDescription: "Non-vegetarian buffet with meat dishes",
      price: 500,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 550,
      discountPercentage: 9,
      category: "Catering",
      subcategory: "Buffet",
      tags: ["non-vegetarian", "buffet", "chicken", "mutton", "fish"],
      image: "nonveg_buffet.jpg",
      gallery: ["nonveg_buffet_1.jpg", "nonveg_buffet_2.jpg", "nonveg_buffet_3.jpg"],
      videoUrl: "",
      duration: "4 hours",
      capacity: {
        minGuests: 50,
        maxGuests: 400,
        unit: "guests"
      },
      features: [
        "2 chicken dishes",
        "1 mutton dish",
        "1 fish dish",
        "3 vegetarian sides",
        "2 dessert options",
        "Professional serving staff",
        "Setup and cleanup included"
      ],
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      availableTimeSlots: [
        { start: "12:00", end: "16:00", label: "Afternoon" },
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Kitchen access required",
        "Power supply needed",
        "Minimum 48 hours notice",
        "Refrigeration facilities"
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
      lastBookedAt: new Date(),
      searchKeywords: ["non-vegetarian", "catering", "buffet", "chicken", "mutton", "fish"],
      slug: "non-vegetarian-buffet-catering"
    },
    {
      id: "3",
      name: "Live Counters",
      description: "Live dosa, chaat, pasta, and BBQ counters. Interactive food stations for engaging dining experience.",
      shortDescription: "Interactive live food counters",
      price: 600,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 700,
      discountPercentage: 14,
      category: "Catering",
      subcategory: "Live Counters",
      tags: ["live counters", "interactive", "dosa", "chaat", "pasta", "bbq"],
      image: "live_counter.jpg",
      gallery: ["live_counter_1.jpg", "live_counter_2.jpg", "live_counter_3.jpg"],
      videoUrl: "",
      duration: "5 hours",
      capacity: {
        minGuests: 30,
        maxGuests: 300,
        unit: "guests"
      },
      features: [
        "Live dosa counter",
        "Chaat counter",
        "Pasta counter",
        "BBQ counter",
        "Professional chefs",
        "Interactive experience",
        "Setup and cleanup included"
      ],
      availableDays: ["friday", "saturday", "sunday"],
      availableTimeSlots: [
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Outdoor space preferred",
        "Power supply needed",
        "Minimum 72 hours notice",
        "Ventilation required"
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
      lastBookedAt: new Date(),
      searchKeywords: ["live counters", "interactive", "catering", "dosa", "chaat", "pasta", "bbq"],
      slug: "live-counters-interactive-catering"
    },
    {
      id: "4",
      name: "Premium Wedding Package",
      description: "Full-course meals with customized menus, decorations, and servers. Complete wedding catering solution.",
      shortDescription: "Complete wedding catering package",
      price: 1000,
      priceUnit: "per_person",
      currency: "INR",
      originalPrice: 1200,
      discountPercentage: 17,
      category: "Catering",
      subcategory: "Wedding Package",
      tags: ["wedding", "premium", "full-course", "customized"],
      image: "wedding_package.jpg",
      gallery: ["wedding_package_1.jpg", "wedding_package_2.jpg", "wedding_package_3.jpg"],
      videoUrl: "",
      duration: "8 hours",
      capacity: {
        minGuests: 100,
        maxGuests: 1000,
        unit: "guests"
      },
      features: [
        "Customized menu planning",
        "6-course meal",
        "Professional serving staff",
        "Table decorations",
        "Setup and cleanup",
        "Menu consultation",
        "Tasting session included"
      ],
      availableDays: ["saturday", "sunday"],
      availableTimeSlots: [
        { start: "12:00", end: "16:00", label: "Afternoon" },
        { start: "18:00", end: "23:00", label: "Evening" }
      ],
      requirements: [
        "Kitchen access required",
        "Power supply needed",
        "Minimum 1 week notice",
        "Venue coordination required"
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
      lastBookedAt: new Date(),
      searchKeywords: ["wedding", "premium", "catering", "full-course", "customized"],
      slug: "premium-wedding-catering-package"
    }
  ];

  // Functions to enhance existing services
  window.enhanceVendorServices = {
    // Check current services structure
    checkCurrentServices: async () => {
      try {
        console.log('🔍 Checking current services structure...');
        const servicesRef = window.collection(window.db, "vendorServices");
        const snapshot = await window.getDocs(servicesRef);
        
        console.log(`📊 Found ${snapshot.size} services in database`);
        
        const services = [];
        snapshot.forEach(doc => {
          services.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📋 Current services:', services);
        return services;
      } catch (error) {
        console.error('Error checking services:', error);
      }
    },

    // Update a single service with enhanced structure
    updateService: async (serviceId, enhancedData) => {
      try {
        const serviceRef = window.doc(window.db, "vendorServices", serviceId);
        await window.updateDoc(serviceRef, {
          ...enhancedData,
          updatedAt: new Date()
        });
        console.log(`✅ Service ${serviceId} updated successfully`);
      } catch (error) {
        console.error(`Error updating service ${serviceId}:`, error);
      }
    },

    // Add new enhanced service
    addEnhancedService: async (serviceData) => {
      try {
        const servicesRef = window.collection(window.db, "vendorServices");
        const docRef = await window.addDoc(servicesRef, {
          ...serviceData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Enhanced service added with ID: ${docRef.id}`);
        return docRef.id;
      } catch (error) {
        console.error('Error adding enhanced service:', error);
      }
    },

    // Enhance all existing services
    enhanceAllServices: async () => {
      try {
        console.log('🚀 Starting to enhance all services...');
        const services = await window.enhanceVendorServices.checkCurrentServices();
        
        for (const service of services) {
          // Create enhanced version of the service
          const enhancedService = {
            ...service,
            shortDescription: service.description?.substring(0, 100) + "...",
            priceUnit: service.priceUnit || "per_person",
            currency: "INR",
            originalPrice: service.price,
            discountPercentage: 0,
            subcategory: service.category || "General",
            tags: [service.category?.toLowerCase() || "general"],
            gallery: service.image ? [service.image] : [],
            videoUrl: "",
            duration: "4 hours",
            capacity: {
              minGuests: 50,
              maxGuests: 500,
              unit: "guests"
            },
            features: [
              "Professional service",
              "Quality ingredients",
              "Setup and cleanup"
            ],
            availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            availableTimeSlots: [
              { start: "09:00", end: "12:00", label: "Morning" },
              { start: "12:00", end: "16:00", label: "Afternoon" },
              { start: "18:00", end: "23:00", label: "Evening" }
            ],
            requirements: [
              "Minimum 24 hours notice",
              "Power supply needed"
            ],
            isActive: true,
            isFeatured: false,
            isPopular: false,
            averageRating: 4.5,
            totalReviews: 0,
            totalBookings: 0,
            searchKeywords: [service.category?.toLowerCase() || "general", service.name?.toLowerCase() || "service"],
            slug: (service.name || "service").toLowerCase().replace(/\s+/g, "-")
          };
          
          await window.enhanceVendorServices.updateService(service.id, enhancedService);
        }
        
        console.log('✅ All services enhanced successfully!');
      } catch (error) {
        console.error('Error enhancing services:', error);
      }
    },

    // Add sample enhanced services
    addSampleEnhancedServices: async () => {
      try {
        console.log('🚀 Adding sample enhanced services...');
        
        for (const service of sampleEnhancedServices) {
          await window.enhanceVendorServices.addEnhancedService(service);
        }
        
        console.log('✅ Sample enhanced services added successfully!');
      } catch (error) {
        console.error('Error adding sample services:', error);
      }
    },

    // Show enhanced structure template
    showStructure: () => {
      console.log('📋 Enhanced Service Structure Template:');
      console.log(enhancedServiceStructure);
    },

    // Show sample services
    showSamples: () => {
      console.log('📋 Sample Enhanced Services:');
      console.log(sampleEnhancedServices);
    }
  };

  console.log('🚀 Enhancement functions available:');
  console.log('- window.enhanceVendorServices.checkCurrentServices()');
  console.log('- window.enhanceVendorServices.updateService(serviceId, data)');
  console.log('- window.enhanceVendorServices.addEnhancedService(data)');
  console.log('- window.enhanceVendorServices.enhanceAllServices()');
  console.log('- window.enhanceVendorServices.addSampleEnhancedServices()');
  console.log('- window.enhanceVendorServices.showStructure()');
  console.log('- window.enhanceVendorServices.showSamples()');
  
  console.log('');
  console.log('💡 Quick start: Run window.enhanceVendorServices.showStructure() to see the template');
  console.log('💡 Add samples: Run window.enhanceVendorServices.addSampleEnhancedServices()');
  console.log('💡 Enhance existing: Run window.enhanceVendorServices.enhanceAllServices()');
}

// Auto-run the check
setTimeout(async () => {
  if (window.enhanceVendorServices) {
    await window.enhanceVendorServices.checkCurrentServices();
  }
}, 1000);
