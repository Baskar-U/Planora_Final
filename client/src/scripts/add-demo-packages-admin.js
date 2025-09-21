// Script to add demo packages using Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You need to download the service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
// Replace the path below with the actual path to your service account key file
const serviceAccount = require('./path-to-your-service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'planora-ce3a5'
});

const db = admin.firestore();

// Demo packages for each category
const demoPackages = {
  'Birthday': [
    {
      id: 'birthday-basic-' + Date.now(),
      name: 'Basic Birthday Package',
      description: 'Perfect birthday celebration with decorations, cake, and basic entertainment',
      originalPrice: 5000,
      discountedPrice: 4000,
      discount: 20,
      features: ['Balloon Decorations', 'Birthday Cake', 'Party Games', 'Basic Entertainment'],
      isActive: true,
      category: 'Birthday'
    },
    {
      id: 'birthday-premium-' + Date.now(),
      name: 'Premium Birthday Package',
      description: 'Luxury birthday celebration with premium decorations and entertainment',
      originalPrice: 10000,
      discountedPrice: 8000,
      discount: 20,
      features: ['Premium Decorations', 'Custom Cake', 'Professional Entertainment', 'Photo Booth'],
      isActive: true,
      category: 'Birthday'
    },
    {
      id: 'birthday-deluxe-' + Date.now(),
      name: 'Deluxe Birthday Package',
      description: 'Ultimate birthday experience with complete party setup and premium services',
      originalPrice: 15000,
      discountedPrice: 12000,
      discount: 20,
      features: ['Complete Party Setup', 'Multi-Tier Cake', 'Live Entertainment', 'Professional Photography'],
      isActive: true,
      category: 'Birthday'
    }
  ],
  'Wedding': [
    {
      id: 'wedding-basic-' + Date.now(),
      name: 'Basic Wedding Package',
      description: 'Essential wedding services with basic decorations and coordination',
      originalPrice: 25000,
      discountedPrice: 20000,
      discount: 20,
      features: ['Basic Decorations', 'Event Coordination', 'Basic Photography', 'Music Setup'],
      isActive: true,
      category: 'Wedding'
    },
    {
      id: 'wedding-premium-' + Date.now(),
      name: 'Premium Wedding Package',
      description: 'Comprehensive wedding services with premium decorations and professional coordination',
      originalPrice: 50000,
      discountedPrice: 40000,
      discount: 20,
      features: ['Premium Decorations', 'Professional Coordination', 'Professional Photography', 'Live Music'],
      isActive: true,
      category: 'Wedding'
    },
    {
      id: 'wedding-deluxe-' + Date.now(),
      name: 'Deluxe Wedding Package',
      description: 'Luxury wedding experience with complete venue transformation and premium services',
      originalPrice: 100000,
      discountedPrice: 80000,
      discount: 20,
      features: ['Complete Venue Transformation', 'Luxury Decorations', 'Professional Photography & Videography', 'Live Orchestra'],
      isActive: true,
      category: 'Wedding'
    }
  ],
  'Concert': [
    {
      id: 'concert-basic-' + Date.now(),
      name: 'Basic Concert Package',
      description: 'Essential concert services with sound system and basic lighting',
      originalPrice: 15000,
      discountedPrice: 12000,
      discount: 20,
      features: ['Sound System', 'Basic Lighting', 'Stage Setup', 'Security'],
      isActive: true,
      category: 'Concert'
    },
    {
      id: 'concert-premium-' + Date.now(),
      name: 'Premium Concert Package',
      description: 'Professional concert services with advanced sound and lighting systems',
      originalPrice: 30000,
      discountedPrice: 24000,
      discount: 20,
      features: ['Professional Sound System', 'Advanced Lighting', 'Stage Management', 'Security & Crowd Control'],
      isActive: true,
      category: 'Concert'
    },
    {
      id: 'concert-deluxe-' + Date.now(),
      name: 'Deluxe Concert Package',
      description: 'Ultimate concert experience with premium equipment and complete production',
      originalPrice: 60000,
      discountedPrice: 48000,
      discount: 20,
      features: ['Premium Sound & Lighting', 'Complete Production', 'Live Streaming', 'VIP Services'],
      isActive: true,
      category: 'Concert'
    }
  ],
  'Orchestra': [
    {
      id: 'orchestra-basic-' + Date.now(),
      name: 'Basic Orchestra Package',
      description: 'Small orchestra ensemble for intimate events and ceremonies',
      originalPrice: 20000,
      discountedPrice: 16000,
      discount: 20,
      features: ['5-8 Musicians', 'Classical Music', 'Sound System', 'Basic Setup'],
      isActive: true,
      category: 'Orchestra'
    },
    {
      id: 'orchestra-premium-' + Date.now(),
      name: 'Premium Orchestra Package',
      description: 'Medium orchestra ensemble with professional musicians and equipment',
      originalPrice: 40000,
      discountedPrice: 32000,
      discount: 20,
      features: ['10-15 Musicians', 'Professional Equipment', 'Custom Music Arrangements', 'Sound Engineering'],
      isActive: true,
      category: 'Orchestra'
    },
    {
      id: 'orchestra-deluxe-' + Date.now(),
      name: 'Deluxe Orchestra Package',
      description: 'Full orchestra ensemble with premium musicians and complete production',
      originalPrice: 80000,
      discountedPrice: 64000,
      discount: 20,
      features: ['20+ Musicians', 'Premium Equipment', 'Custom Compositions', 'Complete Production'],
      isActive: true,
      category: 'Orchestra'
    }
  ],
  'Catering': [
    {
      id: 'catering-basic-' + Date.now(),
      name: 'Basic Catering Package',
      description: 'Perfect for small gatherings with delicious vegetarian and non-vegetarian options',
      originalPrice: 15000,
      discountedPrice: 12000,
      discount: 20,
      capacity: 50,
      priceUnit: 'per_event',
      features: ['Veg & Non-Veg Options', 'Fresh Ingredients', 'Professional Service', 'Cleanup Included'],
      isActive: true,
      category: 'Catering',
      mealDetails: {
        breakfast: { originalPrice: 200, discountedPrice: 160, discount: 20 },
        lunch: { originalPrice: 300, discountedPrice: 240, discount: 20 },
        dinner: { originalPrice: 400, discountedPrice: 320, discount: 20 }
      }
    },
    {
      id: 'catering-premium-' + Date.now(),
      name: 'Premium Catering Package',
      description: 'Luxury dining experience with gourmet dishes and premium service',
      originalPrice: 25000,
      discountedPrice: 20000,
      discount: 20,
      capacity: 100,
      priceUnit: 'per_event',
      features: ['Gourmet Dishes', 'Premium Service', 'Live Cooking Station', 'Dessert Bar', 'Cleanup Included'],
      isActive: true,
      category: 'Catering',
      mealDetails: {
        breakfast: { originalPrice: 350, discountedPrice: 280, discount: 20 },
        lunch: { originalPrice: 500, discountedPrice: 400, discount: 20 },
        dinner: { originalPrice: 600, discountedPrice: 480, discount: 20 }
      }
    },
    {
      id: 'catering-deluxe-' + Date.now(),
      name: 'Deluxe Catering Package',
      description: 'Ultimate catering experience with multi-cuisine options and personalized service',
      originalPrice: 40000,
      discountedPrice: 32000,
      discount: 20,
      capacity: 200,
      priceUnit: 'per_event',
      features: ['Multi-Cuisine Options', 'Personalized Service', 'Live Counters', 'Premium Beverages', 'Complete Setup & Cleanup'],
      isActive: true,
      category: 'Catering',
      mealDetails: {
        breakfast: { originalPrice: 500, discountedPrice: 400, discount: 20 },
        lunch: { originalPrice: 750, discountedPrice: 600, discount: 20 },
        dinner: { originalPrice: 900, discountedPrice: 720, discount: 20 }
      }
    }
  ],
  'Decoration': [
    {
      id: 'decoration-basic-' + Date.now(),
      name: 'Basic Decoration Package',
      description: 'Simple yet elegant decoration with fresh flowers and basic lighting',
      originalPrice: 8000,
      discountedPrice: 6400,
      discount: 20,
      features: ['Fresh Flowers', 'Basic Lighting', 'Table Decorations', 'Entrance Decoration'],
      isActive: true,
      category: 'Decoration',
      decorationDetails: {
        flowers: 'Fresh Roses & Marigolds',
        lighting: 'LED String Lights',
        theme: 'Classic Elegance'
      }
    },
    {
      id: 'decoration-premium-' + Date.now(),
      name: 'Premium Decoration Package',
      description: 'Luxury decoration with premium flowers, advanced lighting, and custom themes',
      originalPrice: 15000,
      discountedPrice: 12000,
      discount: 20,
      features: ['Premium Flowers', 'Advanced Lighting', 'Custom Themes', 'Stage Decoration', 'Photo Booth Setup'],
      isActive: true,
      category: 'Decoration',
      decorationDetails: {
        flowers: 'Premium Orchids & Roses',
        lighting: 'Professional LED Setup',
        theme: 'Custom Design'
      }
    },
    {
      id: 'decoration-deluxe-' + Date.now(),
      name: 'Deluxe Decoration Package',
      description: 'Ultimate decoration experience with exotic flowers, professional lighting, and complete venue transformation',
      originalPrice: 25000,
      discountedPrice: 20000,
      discount: 20,
      features: ['Exotic Flowers', 'Professional Lighting', 'Complete Venue Transformation', 'Custom Backdrops', 'Luxury Seating'],
      isActive: true,
      category: 'Decoration',
      decorationDetails: {
        flowers: 'Exotic Imported Flowers',
        lighting: 'Professional Stage Lighting',
        theme: 'Luxury Transformation'
      }
    }
  ],
  'Photography': [
    {
      id: 'photography-basic-' + Date.now(),
      name: 'Basic Photography Package',
      description: 'Essential photography coverage for your special moments',
      originalPrice: 8000,
      discountedPrice: 6400,
      discount: 20,
      features: ['4 Hours Coverage', '100+ Edited Photos', 'Online Gallery', 'Basic Editing'],
      isActive: true,
      category: 'Photography',
      photographyDetails: {
        perEvent: { originalPrice: 8000, discountedPrice: 6400, discount: 20 },
        perHour: { originalPrice: 2000, discountedPrice: 1600, discount: 20 }
      }
    },
    {
      id: 'photography-premium-' + Date.now(),
      name: 'Premium Photography Package',
      description: 'Professional photography with extended coverage and premium editing',
      originalPrice: 15000,
      discountedPrice: 12000,
      discount: 20,
      features: ['8 Hours Coverage', '300+ Edited Photos', 'Online Gallery', 'Premium Editing', 'Drone Shots'],
      isActive: true,
      category: 'Photography',
      photographyDetails: {
        perEvent: { originalPrice: 15000, discountedPrice: 12000, discount: 20 },
        perHour: { originalPrice: 2500, discountedPrice: 2000, discount: 20 }
      }
    },
    {
      id: 'photography-deluxe-' + Date.now(),
      name: 'Deluxe Photography Package',
      description: 'Complete photography experience with multiple photographers and cinematic editing',
      originalPrice: 25000,
      discountedPrice: 20000,
      discount: 20,
      features: ['12 Hours Coverage', '500+ Edited Photos', 'Multiple Photographers', 'Cinematic Editing', 'Drone & Ground Shots', 'Same Day Preview'],
      isActive: true,
      category: 'Photography',
      photographyDetails: {
        perEvent: { originalPrice: 25000, discountedPrice: 20000, discount: 20 },
        perHour: { originalPrice: 3000, discountedPrice: 2400, discount: 20 }
      }
    }
  ],
  'DJ': [
    {
      id: 'dj-basic-' + Date.now(),
      name: 'Basic DJ Package',
      description: 'Essential DJ services with quality sound system and music selection',
      originalPrice: 6000,
      discountedPrice: 4800,
      discount: 20,
      features: ['4 Hours Service', 'Quality Sound System', 'Music Selection', 'Basic Lighting'],
      isActive: true,
      category: 'DJ',
      djDetails: {
        perEvent: { originalPrice: 6000, discountedPrice: 4800, discount: 20 },
        perHour: { originalPrice: 1500, discountedPrice: 1200, discount: 20 }
      }
    },
    {
      id: 'dj-premium-' + Date.now(),
      name: 'Premium DJ Package',
      description: 'Professional DJ services with advanced sound system and lighting effects',
      originalPrice: 12000,
      discountedPrice: 9600,
      discount: 20,
      features: ['6 Hours Service', 'Professional Sound System', 'Advanced Lighting', 'Music Requests', 'MC Services'],
      isActive: true,
      category: 'DJ',
      djDetails: {
        perEvent: { originalPrice: 12000, discountedPrice: 9600, discount: 20 },
        perHour: { originalPrice: 2500, discountedPrice: 2000, discount: 20 }
      }
    },
    {
      id: 'dj-deluxe-' + Date.now(),
      name: 'Deluxe DJ Package',
      description: 'Ultimate DJ experience with premium equipment and complete entertainment setup',
      originalPrice: 20000,
      discountedPrice: 16000,
      discount: 20,
      features: ['8 Hours Service', 'Premium Sound System', 'Professional Lighting', 'Live Music', 'Complete Setup'],
      isActive: true,
      category: 'DJ',
      djDetails: {
        perEvent: { originalPrice: 20000, discountedPrice: 16000, discount: 20 },
        perHour: { originalPrice: 3500, discountedPrice: 2800, discount: 20 }
      }
    }
  ],
  'Cakes': [
    {
      id: 'cakes-basic-' + Date.now(),
      name: 'Basic Cake Package',
      description: 'Delicious cakes for your special occasions with simple designs',
      originalPrice: 2000,
      discountedPrice: 1600,
      discount: 20,
      features: ['1 Kg Cake', 'Simple Design', 'Fresh Ingredients', 'Delivery Included'],
      isActive: true,
      category: 'Cakes',
      cakeDetails: {
        flavors: ['Vanilla', 'Chocolate', 'Strawberry'],
        size: '1 Kg',
        design: 'Simple Elegant'
      }
    },
    {
      id: 'cakes-premium-' + Date.now(),
      name: 'Premium Cake Package',
      description: 'Custom designed cakes with premium ingredients and artistic decoration',
      originalPrice: 5000,
      discountedPrice: 4000,
      discount: 20,
      features: ['2 Kg Cake', 'Custom Design', 'Premium Ingredients', 'Artistic Decoration', 'Delivery Included'],
      isActive: true,
      category: 'Cakes',
      cakeDetails: {
        flavors: ['Red Velvet', 'Black Forest', 'Truffle', 'Fruit Cake'],
        size: '2 Kg',
        design: 'Custom Artistic'
      }
    },
    {
      id: 'cakes-deluxe-' + Date.now(),
      name: 'Deluxe Cake Package',
      description: 'Luxury multi-tier cakes with exotic flavors and professional decoration',
      originalPrice: 10000,
      discountedPrice: 8000,
      discount: 20,
      features: ['Multi-Tier Cake', 'Exotic Flavors', 'Professional Decoration', 'Custom Design', 'Premium Delivery'],
      isActive: true,
      category: 'Cakes',
      cakeDetails: {
        flavors: ['Exotic Imported', 'Custom Flavors', 'Premium Chocolate'],
        size: 'Multi-Tier',
        design: 'Luxury Professional'
      }
    }
  ],
  'Travel': [
    {
      id: 'travel-basic-' + Date.now(),
      name: 'Basic Travel Package',
      description: 'Comfortable travel experience with essential amenities and guided tours',
      originalPrice: 5000,
      discountedPrice: 4000,
      discount: 20,
      features: ['AC Vehicle', 'Professional Driver', 'Basic Amenities', 'Guided Tours'],
      isActive: true,
      category: 'Travel',
      travelDetails: {
        source: 'Chennai',
        destination: 'Mahabalipuram',
        days: 1,
        pickupLocation: 'Chennai Central',
        areas: [
          { name: 'Mahabalipuram Beach', specialty: 'Sunset View & Photography' },
          { name: 'Shore Temple', specialty: 'UNESCO World Heritage Site' }
        ],
        personPricing: { originalPrice: 5000, discountedPrice: 4000, discount: 20 },
        groupPricing: { groupSize: 4, originalPrice: 18000, discountedPrice: 14400, discount: 20 }
      }
    },
    {
      id: 'travel-premium-' + Date.now(),
      name: 'Premium Travel Package',
      description: 'Luxury travel experience with premium vehicles and comprehensive tour coverage',
      originalPrice: 12000,
      discountedPrice: 9600,
      discount: 20,
      features: ['Luxury Vehicle', 'Professional Guide', 'Premium Amenities', 'Comprehensive Tours', 'Meals Included'],
      isActive: true,
      category: 'Travel',
      travelDetails: {
        source: 'Chennai',
        destination: 'Pondicherry',
        days: 2,
        pickupLocation: 'Chennai Airport',
        areas: [
          { name: 'Auroville', specialty: 'Spiritual Community & Matrimandir' },
          { name: 'Pondicherry Beach', specialty: 'French Architecture & Beach' },
          { name: 'Aurobindo Ashram', specialty: 'Spiritual Center & Meditation' }
        ],
        personPricing: { originalPrice: 12000, discountedPrice: 9600, discount: 20 },
        groupPricing: { groupSize: 6, originalPrice: 60000, discountedPrice: 48000, discount: 20 }
      }
    },
    {
      id: 'travel-deluxe-' + Date.now(),
      name: 'Deluxe Travel Package',
      description: 'Ultimate travel experience with luxury accommodation and exclusive destinations',
      originalPrice: 25000,
      discountedPrice: 20000,
      discount: 20,
      features: ['Luxury Vehicle', 'Expert Guide', 'Premium Accommodation', 'Exclusive Destinations', 'All Meals Included'],
      isActive: true,
      category: 'Travel',
      travelDetails: {
        source: 'Chennai',
        destination: 'Ooty',
        days: 3,
        pickupLocation: 'Chennai Central',
        areas: [
          { name: 'Ooty Lake', specialty: 'Boat Ride & Scenic Views' },
          { name: 'Botanical Gardens', specialty: 'Exotic Plants & Flower Show' },
          { name: 'Tea Plantations', specialty: 'Tea Tasting & Factory Tour' },
          { name: 'Doddabetta Peak', specialty: 'Highest Point & Panoramic Views' }
        ],
        personPricing: { originalPrice: 25000, discountedPrice: 20000, discount: 20 },
        groupPricing: { groupSize: 8, originalPrice: 180000, discountedPrice: 144000, discount: 20 }
      }
    }
  ]
};

async function addDemoPackages() {
  try {
    console.log('🚀 Starting to add demo packages for all vendors...');
    
    // Vendors to keep existing packages
    const keepExistingPackages = [
      'Tuto Decorations',
      'Cookies Photography', 
      'Tutoapp',
      'Tuto Travels'
    ];
    
    // Get all vendors from postorder collection
    const snapshot = await db.collection('postorder').get();
    
    console.log(`📊 Found ${snapshot.size} vendors in postorder collection`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const vendorData = docSnapshot.data();
      const vendorId = docSnapshot.id;
      const category = vendorData.category;
      const businessName = vendorData.businessname;
      
      console.log(`\n🔍 Processing vendor: ${businessName} (${category})`);
      
      // Check if this vendor should keep existing packages
      const shouldKeepExisting = keepExistingPackages.some(name => 
        businessName.toLowerCase().includes(name.toLowerCase())
      );
      
      if (shouldKeepExisting) {
        console.log(`⏭️  Keeping existing packages for ${businessName} - vendor in keep list`);
        skippedCount++;
        continue;
      }
      
      // Get demo packages for this category
      const categoryPackages = demoPackages[category];
      if (!categoryPackages) {
        console.log(`❌ No demo packages found for category: ${category}`);
        continue;
      }
      
      // Select 2-3 packages randomly for this vendor
      const numPackages = Math.floor(Math.random() * 2) + 2; // 2 or 3 packages
      const selectedPackages = categoryPackages
        .sort(() => 0.5 - Math.random())
        .slice(0, numPackages)
        .map(pkg => ({
          ...pkg,
          id: pkg.id.replace(/\d+$/, Date.now() + Math.random().toString(36).substr(2, 9))
        }));
      
      console.log(`📦 Replacing/Adding ${selectedPackages.length} packages for ${businessName}`);
      
      // Update the vendor document with packages (this will replace existing packages)
      await db.collection('postorder').doc(vendorId).update({
        packages: selectedPackages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Successfully updated packages for ${businessName}`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Demo packages addition completed!`);
    console.log(`📊 Updated vendors: ${updatedCount}`);
    console.log(`📊 Skipped vendors (kept existing): ${skippedCount}`);
    console.log(`📊 Total vendors processed: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error adding demo packages:', error);
  }
}

// Run the script
addDemoPackages();
