// Test script to verify Decoration package display is working correctly
// Run this in the browser console after logging in

console.log('🎨 Testing Decoration Package Display...');

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
    
    // Find the Decoration vendor "The Event Factory"
    testRef.where('businessname', '==', 'The Event Factory').get().then((snapshot) => {
      if (snapshot.empty) {
        console.log('❌ Decoration vendor "The Event Factory" not found');
      } else {
        console.log('✅ Found Decoration vendor "The Event Factory"');
        
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
                category: pkg.category,
                description: pkg.description,
                originalPrice: pkg.originalPrice,
                discountedPrice: pkg.discountedPrice,
                discount: pkg.discount,
                // Check for Decoration-specific fields
                hasDecoration: !!pkg.decoration,
                hasDecorationDetails: !!pkg.decorationDetails,
                // Check for other category fields
                hasMeals: !!pkg.meals,
                hasMealDetails: !!pkg.mealDetails,
                hasPhotography: !!pkg.photography,
                hasPhotographyDetails: !!pkg.photographyDetails,
                hasDj: !!pkg.dj,
                hasDjDetails: !!pkg.djDetails,
                hasTravel: !!pkg.travel,
                hasTravelDetails: !!pkg.travelDetails,
                hasCakes: !!pkg.cakes
              });
              
              // Show the actual decoration structure
              if (pkg.decoration || pkg.decorationDetails) {
                const decorationData = pkg.decorationDetails || pkg.decoration;
                console.log('  🎨 Decoration Structure:', {
                  originalPrice: decorationData.originalPrice,
                  price: decorationData.price,
                  discount: decorationData.discount,
                  features: decorationData.features,
                  image: decorationData.image ? 'EXISTS' : 'NOT FOUND',
                  flowers: decorationData.flowers,
                  lighting: decorationData.lighting,
                  theme: decorationData.theme
                });
              }
            });
            
            console.log('\n✅ Decoration package structure test completed!');
            console.log('📝 Expected Results:');
            console.log('- Package cards should show "Decoration" category');
            console.log('- Pricing should display Original and Discounted prices');
            console.log('- Features should be displayed');
            console.log('- Images should be shown if available');
            console.log('- View Details modal should show complete decoration details');
            
          } else {
            console.log('❌ No packages found for this vendor');
          }
        });
      }
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}

console.log('🎨 Test completed. Check the results above to verify Decoration package display is working.');



