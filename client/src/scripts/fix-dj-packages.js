// Script to fix DJ vendor packages structure
// Run this in the browser console after logging in

console.log('🎧 Fixing DJ Vendor Package Structure...');

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
          console.log('\n📊 Current Package Structure:');
          
          if (data.packages && data.packages.length > 0) {
            const updatedPackages = data.packages.map((pkg, index) => {
              console.log(`\nPackage ${index + 1}: "${pkg.name}"`);
              console.log('Current structure:', {
                category: pkg.category,
                hasDj: !!pkg.dj,
                hasDjDetails: !!pkg.djDetails,
                hasDecoration: !!pkg.decoration,
                originalPrice: pkg.originalPrice,
                discountedPrice: pkg.discountedPrice,
                discount: pkg.discount
              });
              
              // Create DJ structure from existing data
              const djStructure = {
                perEvent: {
                  originalPrice: pkg.originalPrice || 0,
                  price: pkg.discountedPrice || pkg.originalPrice || 0,
                  discount: pkg.discount || 0
                },
                perHour: {
                  originalPrice: Math.round((pkg.originalPrice || 0) / 8), // Assuming 8 hours per event
                  price: Math.round((pkg.discountedPrice || pkg.originalPrice || 0) / 8),
                  discount: pkg.discount || 0
                }
              };
              
              console.log('Creating DJ structure:', djStructure);
              
              return {
                ...pkg,
                category: 'DJ', // Fix category
                dj: djStructure, // Add DJ structure
                djDetails: djStructure, // Add DJ details structure
                // Remove decoration data if it exists
                decoration: undefined
              };
            });
            
            console.log('\n🚀 Updating packages...');
            
            // Update the document
            db.collection('postorder').doc(doc.id).update({
              packages: updatedPackages,
              updatedAt: new Date()
            }).then(() => {
              console.log('✅ Successfully updated DJ vendor packages!');
              console.log('📊 Updated package structure:');
              updatedPackages.forEach((pkg, index) => {
                console.log(`Package ${index + 1}: "${pkg.name}"`);
                console.log('  - Category:', pkg.category);
                console.log('  - Per Event:', pkg.dj.perEvent);
                console.log('  - Per Hour:', pkg.dj.perHour);
              });
              console.log('\n🎉 DJ packages should now display correctly!');
            }).catch((error) => {
              console.error('❌ Failed to update packages:', error);
            });
          }
        });
      }
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}



