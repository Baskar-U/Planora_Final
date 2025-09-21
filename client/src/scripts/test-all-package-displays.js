// Comprehensive test script to verify all package displays are working correctly
// Run this in the browser console after logging in

console.log('🧪 Testing All Package Displays...');

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
    
    // Test Firestore access and find vendors by category
    const db = firebase.firestore();
    const testRef = db.collection('postorder');
    
    const categories = ['Catering', 'Photography', 'DJ', 'Travel', 'Decoration', 'Cakes'];
    
    Promise.all(categories.map(category => 
      testRef.where('category', '==', category).limit(2).get()
    )).then((snapshots) => {
      console.log('\n📊 Testing Package Display for All Categories:');
      
      snapshots.forEach((snapshot, index) => {
        const category = categories[index];
        console.log(`\n🎯 ${category} Category:`);
        
        if (snapshot.empty) {
          console.log(`  ⚠️ No ${category} vendors found`);
        } else {
          console.log(`  ✅ Found ${snapshot.size} ${category} vendor(s)`);
          
          snapshot.docs.forEach((doc, docIndex) => {
            const data = doc.data();
            console.log(`\n  📦 ${category} Vendor ${docIndex + 1}:`, {
              id: doc.id,
              businessname: data.businessname,
              category: data.category,
              packagesCount: data.packages ? data.packages.length : 0
            });
            
            if (data.packages && data.packages.length > 0) {
              console.log(`    📋 Packages:`);
              data.packages.forEach((pkg, pkgIndex) => {
                console.log(`      Package ${pkgIndex + 1}:`, {
                  name: pkg.name,
                  category: pkg.category,
                  // Check for different field structures
                  hasMeals: !!pkg.meals,
                  hasMealDetails: !!pkg.mealDetails,
                  hasPhotography: !!pkg.photography,
                  hasPhotographyDetails: !!pkg.photographyDetails,
                  hasDj: !!pkg.dj,
                  hasDjDetails: !!pkg.djDetails,
                  hasTravel: !!pkg.travel,
                  hasTravelDetails: !!pkg.travelDetails,
                  hasDecoration: !!pkg.decoration,
                  hasCakes: !!pkg.cakes,
                  // Pricing info
                  originalPrice: pkg.originalPrice || 'N/A',
                  discountedPrice: pkg.discountedPrice || pkg.price || 'N/A'
                });
                
                // Test specific category pricing
                if (category === 'Catering') {
                  const mealData = pkg.mealDetails || pkg.meals;
                  if (mealData) {
                    console.log(`        🍽️ Meal Pricing:`, {
                      breakfast: mealData.breakfast?.originalPrice || 'N/A',
                      lunch: mealData.lunch?.originalPrice || 'N/A',
                      dinner: mealData.dinner?.originalPrice || 'N/A'
                    });
                  }
                } else if (category === 'Photography') {
                  const photoData = pkg.photographyDetails || pkg.photography;
                  if (photoData) {
                    console.log(`        📸 Photography Pricing:`, {
                      perEvent: photoData.perEvent?.originalPrice || 'N/A',
                      perHour: photoData.perHour?.originalPrice || 'N/A'
                    });
                  }
                } else if (category === 'DJ') {
                  const djData = pkg.djDetails || pkg.dj;
                  if (djData) {
                    console.log(`        🎧 DJ Pricing:`, {
                      perEvent: djData.perEvent?.originalPrice || 'N/A',
                      perHour: djData.perHour?.originalPrice || 'N/A'
                    });
                  }
                } else if (category === 'Travel') {
                  const travelData = pkg.travelDetails || pkg.travel;
                  if (travelData) {
                    console.log(`        🚗 Travel Pricing:`, {
                      source: travelData.source || 'N/A',
                      destination: travelData.destination || 'N/A',
                      days: travelData.days || 'N/A',
                      personPricing: travelData.personPricing?.originalPrice || 'N/A',
                      groupPricing: travelData.groupPricing?.originalPrice || 'N/A'
                    });
                  }
                } else if (category === 'Decoration') {
                  if (pkg.decoration) {
                    console.log(`        🎨 Decoration Pricing:`, {
                      originalPrice: pkg.decoration.originalPrice || 'N/A',
                      hasImage: !!pkg.decoration.image
                    });
                  }
                } else if (category === 'Cakes') {
                  if (pkg.cakes) {
                    console.log(`        🎂 Cakes Pricing:`, {
                      originalPrice: pkg.cakes.originalPrice || 'N/A',
                      hasImage: !!pkg.cakes.image,
                      hasCakeDetails: !!pkg.cakes.cakeDetails
                    });
                  }
                }
              });
            }
          });
        }
      });
      
      console.log('\n✅ Package display test completed!');
      console.log('📝 Summary:');
      console.log('- Catering: Should show mealDetails or meals');
      console.log('- Photography: Should show photographyDetails or photography');
      console.log('- DJ: Should show djDetails or dj');
      console.log('- Travel: Should show travelDetails or travel');
      console.log('- Decoration: Should show decoration');
      console.log('- Cakes: Should show cakes');
      
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}

console.log('🧪 Test completed. Check the results above to verify all package displays are working.');



