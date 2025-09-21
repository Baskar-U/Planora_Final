// Setup Vendor Services Script
// Run this in the browser console to add sample services for vendors

console.log('🚀 Setting up Sample Vendor Services...');

// Check if Firebase is available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase available');
}

// Sample services data for vendors
const sampleVendorServices = [
  // Services for sample-vendor-1 (Royal Catering Services)
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
    features: ["5-Course Meal", "Appetizers", "Desserts", "Beverages", "Service Staff", "Setup & Cleanup"]
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
    features: ["Themed Decorations", "Birthday Cake", "Party Favors", "Fun Menu", "Entertainment"]
  },

  // Services for sample-vendor-2 (Capture Moments Photography)
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
    features: ["Pre-wedding Shoot", "Wedding Day Coverage", "Post-wedding Shoot", "Digital Albums", "Printed Photos", "Video Coverage"]
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
    features: ["Event Coverage", "Group Photos", "Product Shots", "Quick Delivery", "Professional Editing"]
  },

  // Services for sample-vendor-3 (Elegant Decorations)
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
    features: ["Mandap Decoration", "Stage Setup", "Entrance Decoration", "Premium Flowers", "Lighting Effects", "Setup & Cleanup"]
  },

  // Services for sample-vendor-4 (Sound & Light Entertainment)
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
    features: ["Professional DJ", "Sound System", "Lighting Effects", "Music Library", "MC Services", "Equipment Setup"]
  }
];

// Functions to setup data
window.setupVendorServices = {
  // Add sample vendor services
  async addSampleVendorServices() {
    console.log('🎯 Adding sample vendor services...');
    try {
      for (const service of sampleVendorServices) {
        await window.addDoc(window.collection(window.db, "vendorServices"), {
          ...service,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Added service: ${service.name} for vendor ${service.vendorId}`);
      }
      console.log('🎉 All sample vendor services added successfully!');
    } catch (error) {
      console.error('❌ Error adding vendor services:', error);
    }
  },

  // Check existing vendor services
  async checkExistingVendorServices() {
    console.log('🔍 Checking existing vendor services...');
    try {
      const querySnapshot = await window.getDocs(window.collection(window.db, "vendorServices"));
      console.log(`📊 Found ${querySnapshot.size} existing vendor services`);
      
      if (querySnapshot.size > 0) {
        console.log('📋 Existing vendor services:');
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.name} (${data.category}) - Vendor: ${data.vendorId}`);
        });
      }
    } catch (error) {
      console.error('❌ Error checking vendor services:', error);
    }
  },

  // Setup everything
  async setupAll() {
    console.log('🚀 Starting complete vendor services setup...');
    console.log('==============================================');
    
    await this.checkExistingVendorServices();
    await this.addSampleVendorServices();
    
    console.log('==============================================');
    console.log('🎉 Complete vendor services setup finished!');
    console.log('📊 You can now view services on vendor profiles');
    console.log('💡 Try visiting: /vendor/sample-vendor-1');
  },

  // Show available functions
  showHelp() {
    console.log('📋 Available functions:');
    console.log('- window.setupVendorServices.addSampleVendorServices()');
    console.log('- window.setupVendorServices.checkExistingVendorServices()');
    console.log('- window.setupVendorServices.setupAll()');
    console.log('- window.setupVendorServices.showHelp()');
  }
};

console.log('📋 Setup functions available:');
console.log('- window.setupVendorServices.addSampleVendorServices()');
console.log('- window.setupVendorServices.checkExistingVendorServices()');
console.log('- window.setupVendorServices.setupAll()');
console.log('- window.setupVendorServices.showHelp()');

console.log('');
console.log('💡 Quick setup: window.setupVendorServices.setupAll()');










