// Debug script to check DJ vendor package structure
// Run this in the browser console after logging in

console.log('🔍 Debugging DJ Vendor Package Structure...');

if (typeof firebase === 'undefined') {
  console.error('❌ Firebase is not available. Make sure you are on the Planora website.');
} else {
  const auth = firebase.auth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No user is logged in. Please log in first.');
  } else {
    console.log('✅ User is logged in:', currentUser.email);
    
    const db = firebase.firestore();
    const testRef = db.collection('postorder');
    
    // Find the DJ vendor "MM Events Chennai"
    testRef.where('businessname', '==', 'MM Events Chennai').get().then((snapshot) => {
      if (snapshot.empty) {
        console.log('❌ DJ vendor "MM Events Chennai" not found');
      } else {
        console.log('✅ Found DJ vendor "MM Events Chennai"');
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log('\n📊 Vendor Data Structure:');
          console.log('Vendor ID:', doc.id);
          console.log('Business Name:', data.businessname);
          console.log('Category:', data.category);
          console.log('Packages Count:', data.packages ? data.packages.length : 0);
          
          if (data.packages && data.packages.length > 0) {
            console.log('\n📦 Package Details:');
            data.packages.forEach((pkg, index) => {
              console.log(`\nPackage ${index + 1}:`, {
                id: pkg.id,
                name: pkg.name,
                category: pkg.category, // This is the key field!
                description: pkg.description,
                originalPrice: pkg.originalPrice,
                discountedPrice: pkg.discountedPrice,
                // Check for DJ-specific fields
                hasDj: !!pkg.dj,
                hasDjDetails: !!pkg.djDetails,
                // Check for other category fields
                hasMeals: !!pkg.meals,
                hasMealDetails: !!pkg.mealDetails,
                hasPhotography: !!pkg.photography,
                hasPhotographyDetails: !!pkg.photographyDetails,
                hasTravel: !!pkg.travel,
                hasTravelDetails: !!pkg.travelDetails,
                hasDecoration: !!pkg.decoration,
                hasCakes: !!pkg.cakes
              });
              
              // Show the actual pricing structure
              if (pkg.dj || pkg.djDetails) {
                const djData = pkg.djDetails || pkg.dj;
                console.log('  🎧 DJ Pricing Structure:', {
                  perEvent: djData.perEvent,
                  perHour: djData.perHour
                });
              }
              
              // Show if it has decoration data (which might be wrong)
              if (pkg.decoration) {
                console.log('  🎨 Decoration Data (WRONG!):', pkg.decoration);
              }
            });
          }
        });
      }
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}



