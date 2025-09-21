// Test script to verify Photography package creation works without undefined values
// Run this in the browser console after the fix

console.log("🧪 Testing Photography Package Creation...");

// Simulate a Photography package data structure
const testPackage = {
  id: "test123",
  name: "Wedding Photography Package",
  description: "Complete wedding photography service",
  price: 0,
  originalPrice: 0,
  discount: 0,
  capacity: 1,
  priceUnit: "per_event",
  features: ["HD Photos", "Video", "Drone Shots"],
  isActive: true,
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
  meals: undefined, // This should be cleaned
  // Some other undefined fields that might cause issues
  someOtherField: undefined
};

console.log("📦 Original package:", testPackage);

// Clean the package data (same logic as in the component)
const cleanPackage = { ...testPackage };

// Remove undefined fields that cause Firestore errors
if (cleanPackage.meals === undefined) {
  delete cleanPackage.meals;
}
if (cleanPackage.photography === undefined) {
  delete cleanPackage.photography;
}
if (cleanPackage.eventType === undefined) {
  delete cleanPackage.eventType;
}
if (cleanPackage.someOtherField === undefined) {
  delete cleanPackage.someOtherField;
}

console.log("✨ Cleaned package:", cleanPackage);
console.log("🔍 Undefined fields removed:", Object.keys(testPackage).filter(key => testPackage[key] === undefined));
console.log("✅ Package is ready for Firestore:", !Object.values(cleanPackage).some(val => val === undefined));

// Test the cleaning function
function cleanPackageForFirestore(pkg) {
  const cleanPkg = { ...pkg };
  if (cleanPkg.meals === undefined) delete cleanPkg.meals;
  if (cleanPkg.photography === undefined) delete cleanPkg.photography;
  if (cleanPkg.eventType === undefined) delete cleanPkg.eventType;
  return cleanPkg;
}

const testPackages = [
  { ...testPackage, id: "pkg1" },
  { ...testPackage, id: "pkg2", meals: { breakfast: { originalPrice: 100 } } },
  { ...testPackage, id: "pkg3", photography: undefined }
];

console.log("📋 Testing multiple packages:");
const cleanedPackages = testPackages.map(cleanPackageForFirestore);
console.log("🧹 Cleaned packages:", cleanedPackages);

console.log("🎉 Test completed! The fix should resolve the Firestore undefined field error.");




