// Script to fix package categories to match vendor categories
// Run this in the browser console after logging in

console.log('🔧 Fixing Package Categories...');

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
    
    // Get all vendors
    testRef.get().then((snapshot) => {
      console.log(`📊 Found ${snapshot.size} vendors`);
      
      const updates = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const vendorCategory = data.category;
        
        if (data.packages && data.packages.length > 0) {
          let needsUpdate = false;
          const updatedPackages = data.packages.map((pkg) => {
            if (pkg.category && pkg.category !== vendorCategory) {
              console.log(`🔄 Fixing package "${pkg.name}" category from "${pkg.category}" to "${vendorCategory}"`);
              needsUpdate = true;
              return {
                ...pkg,
                category: vendorCategory
              };
            }
            return pkg;
          });
          
          if (needsUpdate) {
            updates.push({
              id: doc.id,
              businessname: data.businessname,
              category: vendorCategory,
              packages: updatedPackages
            });
          }
        }
      });
      
      console.log(`\n📝 Found ${updates.length} vendors that need package category updates:`);
      updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.businessname} (${update.category}) - ${update.packages.length} packages`);
      });
      
      if (updates.length > 0) {
        console.log('\n🚀 Starting updates...');
        
        // Process updates in batches
        const batchSize = 5;
        const batches = [];
        for (let i = 0; i < updates.length; i += batchSize) {
          batches.push(updates.slice(i, i + batchSize));
        }
        
        let completedBatches = 0;
        
        batches.forEach((batch, batchIndex) => {
          console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length}...`);
          
          const batchPromises = batch.map((update) => {
            return db.collection('postorder').doc(update.id).update({
              packages: update.packages,
              updatedAt: new Date()
            }).then(() => {
              console.log(`✅ Updated ${update.businessname} (${update.category})`);
              return update;
            }).catch((error) => {
              console.error(`❌ Failed to update ${update.businessname}:`, error);
              return null;
            });
          });
          
          Promise.all(batchPromises).then((results) => {
            completedBatches++;
            const successCount = results.filter(r => r !== null).length;
            console.log(`✅ Batch ${batchIndex + 1} completed: ${successCount}/${batch.length} successful`);
            
            if (completedBatches === batches.length) {
              console.log('\n🎉 All package category updates completed!');
              console.log('📊 Summary:');
              console.log(`- Total vendors processed: ${updates.length}`);
              console.log(`- Total batches: ${batches.length}`);
              console.log('✅ Package categories should now match vendor categories');
            }
          });
        });
      } else {
        console.log('✅ No package category updates needed - all packages already have correct categories');
      }
      
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
    });
  }
}



