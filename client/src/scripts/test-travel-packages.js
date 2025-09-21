// Test script to verify Travel packages are working correctly
// Run this in the browser console after logging in

console.log('🚗 Testing Travel Packages Display...');

// Check if Firebase is available
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase is not available. Make sure you are on the Planora website.');
  console.log('Please go to your Planora application and run this script in the browser console.');
} else {
  console.log('✅ Firebase is available');
  
  // Check if user is authenticated
  const auth = firebase.auth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No user is logged in. Please log in first.');
  } else {
    console.log('✅ User is logged in:', currentUser.email);
    
    // Test Firestore access and find Travel vendors
    const db = firebase.firestore();
    const testRef = db.collection('postorder');
    
    testRef.where('category', '==', 'Travel').limit(3).get().then((snapshot) => {
      if (snapshot.empty) {
        console.log('⚠️ No Travel vendors found');
      } else {
        console.log('✅ Found', snapshot.size, 'Travel vendor(s)');
        
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`\n🚗 Travel Vendor ${index + 1}:`, {
            id: doc.id,
            businessname: data.businessname,
            category: data.category,
            packagesCount: data.packages ? data.packages.length : 0
          });
          
          if (data.packages && data.packages.length > 0) {
            console.log('📦 Packages:');
            data.packages.forEach((pkg, pkgIndex) => {
              console.log(`  Package ${pkgIndex + 1}:`, {
                name: pkg.name,
                hasTravel: !!pkg.travel,
                hasTravelDetails: !!pkg.travelDetails,
                source: pkg.travel?.source || pkg.travelDetails?.source || 'N/A',
                destination: pkg.travel?.destination || pkg.travelDetails?.destination || 'N/A',
                days: pkg.travel?.days || pkg.travelDetails?.days || 'N/A',
                personOriginal: pkg.travel?.personPricing?.originalPrice || pkg.travelDetails?.personPricing?.originalPrice || 'N/A',
                groupOriginal: pkg.travel?.groupPricing?.originalPrice || pkg.travelDetails?.groupPricing?.originalPrice || 'N/A'
              });
            });
          }
        });
      }
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}

console.log('🚗 Test completed. Check the results above to verify Travel packages are working.');



