// Setup Vendors Script
// Run this in the browser console to add sample vendors

console.log('🚀 Setting up Sample Vendors...');

// Check if Firebase is available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase available');
}

// Sample vendors data
const sampleVendors = [
  {
    id: "sample-vendor-1",
    name: "Chef Rajesh Kumar",
    businessname: "Royal Catering Services",
    eventname: "Premium Wedding Catering",
    description: "Complete wedding catering service with 5-course meal, appetizers, and dessert. Perfect for 100-500 guests.",
    category: "Catering",
    location: "Mumbai",
    city: "Mumbai",
    rating: 4.8,
    experience: 15,
    profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    phone: "+91 98765 43210",
    email: "rajesh@royalcatering.com",
    website: "https://royalcatering.com",
    price: 1500,
    priceUnit: "person",
    isActive: true,
    isVerified: true,
    totalBookings: 45,
    totalReviews: 45,
    specialties: ["Wedding Catering", "Corporate Events", "Birthday Parties"],
    services: ["Full Catering", "Appetizers", "Desserts", "Beverages"],
    workingHours: {
      start: "09:00",
      end: "22:00"
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  {
    id: "sample-vendor-2",
    name: "Priya Sharma",
    businessname: "Capture Moments Photography",
    eventname: "Professional Wedding Photography",
    description: "Complete wedding photography package including pre-wedding, wedding day, and post-wedding shoots. High-quality prints and digital albums included.",
    category: "Photography",
    location: "Delhi",
    city: "Delhi",
    rating: 4.9,
    experience: 12,
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    phone: "+91 98765 43211",
    email: "priya@capturemoments.com",
    website: "https://capturemoments.com",
    price: 25000,
    priceUnit: "package",
    isActive: true,
    isVerified: true,
    totalBookings: 78,
    totalReviews: 78,
    specialties: ["Wedding Photography", "Portrait Photography", "Event Photography"],
    services: ["Pre-wedding Shoot", "Wedding Day Coverage", "Post-wedding Shoot", "Albums"],
    workingHours: {
      start: "06:00",
      end: "24:00"
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  {
    id: "sample-vendor-3",
    name: "Amit Patel",
    businessname: "Elegant Decorations",
    eventname: "Luxury Wedding Decoration",
    description: "Complete wedding decoration service including mandap, stage, entrance, and reception area. Premium flowers and lighting included.",
    category: "Decoration",
    location: "Bangalore",
    city: "Bangalore",
    rating: 4.7,
    experience: 8,
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    coverImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    phone: "+91 98765 43212",
    email: "amit@elegantdecorations.com",
    website: "https://elegantdecorations.com",
    price: 35000,
    priceUnit: "package",
    isActive: true,
    isVerified: true,
    totalBookings: 32,
    totalReviews: 32,
    specialties: ["Wedding Decoration", "Corporate Events", "Birthday Decorations"],
    services: ["Mandap Decoration", "Stage Setup", "Entrance Decoration", "Lighting"],
    workingHours: {
      start: "06:00",
      end: "18:00"
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  {
    id: "sample-vendor-4",
    name: "DJ Mike",
    businessname: "Sound & Light Entertainment",
    eventname: "DJ & Music Entertainment",
    description: "Professional DJ service with high-quality sound system, lighting effects, and extensive music library. Perfect for weddings and parties.",
    category: "DJ",
    location: "Pune",
    city: "Pune",
    rating: 4.8,
    experience: 10,
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    phone: "+91 98765 43213",
    email: "mike@soundlight.com",
    website: "https://soundlight.com",
    price: 12000,
    priceUnit: "package",
    isActive: true,
    isVerified: true,
    totalBookings: 67,
    totalReviews: 67,
    specialties: ["Wedding DJ", "Party DJ", "Corporate Events"],
    services: ["Music Entertainment", "Sound System", "Lighting Effects", "MC Services"],
    workingHours: {
      start: "18:00",
      end: "02:00"
    },
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  }
];

// Functions to setup data
window.setupVendors = {
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
        console.log(`✅ Added vendor: ${vendor.name} (${vendor.businessname})`);
      }
      console.log('🎉 All sample vendors added successfully!');
    } catch (error) {
      console.error('❌ Error adding vendors:', error);
    }
  },

  // Check existing vendors
  async checkExistingVendors() {
    console.log('🔍 Checking existing vendors...');
    try {
      const querySnapshot = await window.getDocs(window.collection(window.db, "vendors"));
      console.log(`📊 Found ${querySnapshot.size} existing vendors`);
      
      if (querySnapshot.size > 0) {
        console.log('📋 Existing vendors:');
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.name} (${data.businessname}) - ID: ${doc.id}`);
        });
      }
    } catch (error) {
      console.error('❌ Error checking vendors:', error);
    }
  },

  // Setup everything
  async setupAll() {
    console.log('🚀 Starting complete vendors setup...');
    console.log('==============================================');
    
    await this.checkExistingVendors();
    await this.addSampleVendors();
    
    console.log('==============================================');
    console.log('🎉 Complete vendors setup finished!');
    console.log('📊 You can now view vendor profiles');
    console.log('💡 Try visiting: /vendor/sample-vendor-1');
  },

  // Show available functions
  showHelp() {
    console.log('📋 Available functions:');
    console.log('- window.setupVendors.addSampleVendors()');
    console.log('- window.setupVendors.checkExistingVendors()');
    console.log('- window.setupVendors.setupAll()');
    console.log('- window.setupVendors.showHelp()');
  }
};

console.log('📋 Setup functions available:');
console.log('- window.setupVendors.addSampleVendors()');
console.log('- window.setupVendors.checkExistingVendors()');
console.log('- window.setupVendors.setupAll()');
console.log('- window.setupVendors.showHelp()');

console.log('');
console.log('💡 Quick setup: window.setupVendors.setupAll()');










