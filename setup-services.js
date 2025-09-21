// Setup Services Script
// Run this in the browser console to add sample services

console.log('🚀 Setting up Sample Services...');

// Check if Firebase is available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase available');
}

// Sample services data
const sampleServices = [
  {
    name: "Premium Wedding Catering",
    description: "Complete wedding catering service with 5-course meal, appetizers, and dessert. Perfect for 100-500 guests.",
    category: "Catering",
    price: 1500,
    priceUnit: "person",
    vendorId: "sample-vendor-1",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"],
    rating: 4.8,
    totalReviews: 45,
    isActive: true,
    isFeatured: true,
    shortDescription: "Luxury wedding catering with gourmet menu",
    tags: ["wedding", "catering", "premium", "gourmet"],
    currency: "INR",
    originalPrice: 1800,
    discountPercentage: 17,
    duration: "6-8 hours",
    capacity: "500 guests",
    requirements: "Kitchen access, power supply, water connection",
    availableTimeSlots: ["09:00-17:00", "18:00-02:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Professional Wedding Photography",
    description: "Complete wedding photography package including pre-wedding, wedding day, and post-wedding shoots. High-quality prints and digital albums included.",
    category: "Photography",
    price: 25000,
    priceUnit: "package",
    vendorId: "sample-vendor-2",
    images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500"],
    rating: 4.9,
    totalReviews: 78,
    isActive: true,
    isFeatured: true,
    shortDescription: "Professional wedding photography with complete coverage",
    tags: ["wedding", "photography", "professional", "albums"],
    currency: "INR",
    originalPrice: 30000,
    discountPercentage: 17,
    duration: "Full day",
    capacity: "Unlimited photos",
    requirements: "Good lighting, access to all venues",
    availableTimeSlots: ["06:00-24:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Luxury Wedding Decoration",
    description: "Complete wedding decoration service including mandap, stage, entrance, and reception area. Premium flowers and lighting included.",
    category: "Decoration",
    price: 35000,
    priceUnit: "package",
    vendorId: "sample-vendor-3",
    images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500"],
    rating: 4.7,
    totalReviews: 32,
    isActive: true,
    isFeatured: true,
    shortDescription: "Luxury wedding decoration with premium flowers",
    tags: ["wedding", "decoration", "luxury", "flowers"],
    currency: "INR",
    originalPrice: 42000,
    discountPercentage: 17,
    duration: "8-10 hours",
    capacity: "Large venues",
    requirements: "Venue access 6 hours before event",
    availableTimeSlots: ["06:00-18:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Birthday Party Catering",
    description: "Fun and delicious birthday party catering with themed decorations, cake, and party favors. Perfect for kids and adults.",
    category: "Catering",
    price: 800,
    priceUnit: "person",
    vendorId: "sample-vendor-1",
    images: ["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500"],
    rating: 4.6,
    totalReviews: 23,
    isActive: true,
    isFeatured: false,
    shortDescription: "Fun birthday party catering with themes",
    tags: ["birthday", "catering", "themed", "fun"],
    currency: "INR",
    originalPrice: 1000,
    discountPercentage: 20,
    duration: "4-6 hours",
    capacity: "100 guests",
    requirements: "Kitchen access, power supply",
    availableTimeSlots: ["10:00-16:00", "16:00-22:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Corporate Event Photography",
    description: "Professional corporate event photography for conferences, seminars, product launches, and team events. Quick turnaround time.",
    category: "Photography",
    price: 15000,
    priceUnit: "package",
    vendorId: "sample-vendor-2",
    images: ["https://images.unsplash.com/photo-1511578314322-379afb476865?w=500"],
    rating: 4.5,
    totalReviews: 15,
    isActive: true,
    isFeatured: false,
    shortDescription: "Professional corporate event photography",
    tags: ["corporate", "photography", "events", "professional"],
    currency: "INR",
    originalPrice: 18000,
    discountPercentage: 17,
    duration: "4-8 hours",
    capacity: "Large events",
    requirements: "Good lighting, access to all areas",
    availableTimeSlots: ["09:00-18:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "DJ & Music Entertainment",
    description: "Professional DJ service with high-quality sound system, lighting effects, and extensive music library. Perfect for weddings and parties.",
    category: "DJ",
    price: 12000,
    priceUnit: "package",
    vendorId: "sample-vendor-4",
    images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"],
    rating: 4.8,
    totalReviews: 67,
    isActive: true,
    isFeatured: true,
    shortDescription: "Professional DJ with sound and lighting",
    tags: ["dj", "music", "entertainment", "sound"],
    currency: "INR",
    originalPrice: 15000,
    discountPercentage: 20,
    duration: "6-8 hours",
    capacity: "Any venue size",
    requirements: "Power supply, space for setup",
    availableTimeSlots: ["18:00-02:00"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample vendors data
const sampleVendors = [
  {
    id: "sample-vendor-1",
    name: "Chef Rajesh Kumar",
    companyName: "Royal Catering Services",
    city: "Mumbai",
    rating: 4.8,
    experience: 15,
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    category: "Catering"
  },
  {
    id: "sample-vendor-2",
    name: "Priya Sharma",
    companyName: "Capture Moments Photography",
    city: "Delhi",
    rating: 4.9,
    experience: 12,
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
    category: "Photography"
  },
  {
    id: "sample-vendor-3",
    name: "Amit Patel",
    companyName: "Elegant Decorations",
    city: "Bangalore",
    rating: 4.7,
    experience: 8,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    category: "Decoration"
  },
  {
    id: "sample-vendor-4",
    name: "DJ Mike",
    companyName: "Sound & Light Entertainment",
    city: "Pune",
    rating: 4.8,
    experience: 10,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    category: "DJ"
  }
];

// Functions to setup data
window.setupServices = {
  // Add sample vendors
  async addSampleVendors() {
    console.log('👥 Adding sample vendors...');
    try {
      for (const vendor of sampleVendors) {
        await window.setDoc(window.doc(window.db, "vendors", vendor.id), {
          ...vendor,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Added vendor: ${vendor.name}`);
      }
      console.log('🎉 All sample vendors added successfully!');
    } catch (error) {
      console.error('❌ Error adding vendors:', error);
    }
  },

  // Add sample services
  async addSampleServices() {
    console.log('🎯 Adding sample services...');
    try {
      for (const service of sampleServices) {
        await window.addDoc(window.collection(window.db, "vendorServices"), {
          ...service,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Added service: ${service.name}`);
      }
      console.log('🎉 All sample services added successfully!');
    } catch (error) {
      console.error('❌ Error adding services:', error);
    }
  },

  // Setup everything
  async setupAll() {
    console.log('🚀 Starting complete services setup...');
    console.log('==============================================');
    
    await this.addSampleVendors();
    await this.addSampleServices();
    
    console.log('==============================================');
    console.log('🎉 Complete services setup finished!');
    console.log('📊 You can now view services on the Services page');
    console.log('💡 Refresh the page to see the new services');
  },

  // Show available functions
  showHelp() {
    console.log('📋 Available functions:');
    console.log('- window.setupServices.addSampleVendors()');
    console.log('- window.setupServices.addSampleServices()');
    console.log('- window.setupServices.setupAll()');
    console.log('- window.setupServices.showHelp()');
  }
};

console.log('📋 Setup functions available:');
console.log('- window.setupServices.addSampleVendors()');
console.log('- window.setupServices.addSampleServices()');
console.log('- window.setupServices.setupAll()');
console.log('- window.setupServices.showHelp()');

console.log('');
console.log('💡 Quick setup: window.setupServices.setupAll()');

