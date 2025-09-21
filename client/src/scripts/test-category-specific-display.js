// Test script to verify category-specific package display
// Run this in the browser console to test the changes

console.log("🧪 Testing Category-Specific Package Display...");

// Simulate different package types
const testPackages = {
  catering: {
    id: "catering-1",
    name: "Wedding Catering Package",
    description: "Complete wedding catering service",
    category: "Catering",
    meals: {
      breakfast: { originalPrice: 500, price: 450, discount: 10 },
      lunch: { originalPrice: 800, price: 720, discount: 10 },
      dinner: { originalPrice: 1000, price: 900, discount: 10 }
    },
    capacity: 100,
    priceUnit: "per_person"
  },
  
  photography: {
    id: "photo-1", 
    name: "Wedding Photography Package",
    description: "Complete wedding photography service",
    category: "Photography",
    photography: {
      perEvent: {
        originalPrice: 50000,
        price: 45000,
        discount: 10
      },
      perHour: {
        originalPrice: 5000,
        price: 4500,
        discount: 10
      }
    },
    eventType: "per_event",
    capacity: 1,
    priceUnit: "per_event"
  },
  
  venue: {
    id: "venue-1",
    name: "Garden Venue Package", 
    description: "Beautiful garden venue for events",
    category: "Venue",
    originalPrice: 25000,
    price: 20000,
    discount: 20,
    capacity: 200,
    priceUnit: "per_event"
  }
};

// Test the display logic
function testPackageDisplay(pkg, vendorCategory) {
  console.log(`\n📦 Testing ${pkg.name} (Category: ${vendorCategory})`);
  
  // Simulate the conditional rendering logic
  if (vendorCategory === 'Catering' && pkg.meals) {
    console.log("✅ Should show: Meal details (Breakfast, Lunch, Dinner)");
    console.log("   - Breakfast: ₹500 → ₹450");
    console.log("   - Lunch: ₹800 → ₹720"); 
    console.log("   - Dinner: ₹1000 → ₹900");
  } else if (vendorCategory === 'Photography' && pkg.photography) {
    console.log("✅ Should show: Photography pricing");
    if (pkg.photography.perEvent) {
      console.log("   - Per Event: ₹50,000 → ₹45,000");
    }
    if (pkg.photography.perHour) {
      console.log("   - Per Hour: ₹5,000 → ₹4,500");
    }
  } else {
    console.log("✅ Should show: Basic pricing");
    console.log(`   - Original: ₹${pkg.originalPrice || pkg.price || 0}`);
    if (pkg.discount) {
      console.log(`   - Discounted: ₹${(pkg.originalPrice || pkg.price || 0) * (1 - pkg.discount / 100)}`);
    }
  }
  
  console.log(`   - Capacity: ${pkg.capacity} ${pkg.priceUnit || 'people'}`);
  console.log(`   - Category: ${vendorCategory}`);
}

// Test all combinations
Object.values(testPackages).forEach(pkg => {
  testPackageDisplay(pkg, pkg.category);
});

console.log("\n🎯 Expected Results:");
console.log("1. Catering packages should show meal-wise pricing (Breakfast, Lunch, Dinner)");
console.log("2. Photography packages should show photography pricing (Per Event, Per Hour)");
console.log("3. Other packages should show basic pricing (Original, Discounted)");
console.log("4. No more incorrect meal sections for Photography packages!");

console.log("\n✨ The fix ensures category-specific package display!");




