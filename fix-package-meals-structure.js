// Fix package meals structure for Catering packages
// Run this in your browser console while logged into your app

(function () {
  async function fixPackageMealsStructure() {
    if (!window.db || !window.auth) {
      throw new Error('window.db/window.auth not found. Make sure you exposed Firebase in main.tsx and reloaded.');
    }
    const user = window.auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated. Please sign in first in the app, then run again.');
    }

    const { collection, getDocs, query, where, updateDoc, doc } = window;
    console.log('🔧 Fixing package meals structure...');

    // Query only your services
    const postorderRef = collection(window.db, 'postorder');
    const snaps = await Promise.all([
      getDocs(query(postorderRef, where('vendorid', '==', user.uid))),
      getDocs(query(postorderRef, where('vendorId', '==', user.uid))),
    ]);

    // Merge unique docs by id
    const byId = new Map();
    for (const s of snaps) {
      s.docs.forEach(d => byId.set(d.id, d));
    }

    if (byId.size === 0) {
      console.warn('No services found for your vendor account.');
      return { updated: 0, total: 0 };
    }

    let updatedCount = 0;
    let total = 0;

    for (const d of byId.values()) {
      const data = d.data();
      total++;
      
      // Only process Catering services
      const category = data.category || data.eventname || '';
      if (!category.toLowerCase().includes('catering')) {
        console.log(`⏭️ Skip (not catering): ${d.id} - ${category}`);
        continue;
      }
      
      if (!Array.isArray(data.packages) || data.packages.length === 0) {
        console.log(`⏭️ Skip (no packages): ${d.id}`);
        continue;
      }

      let changed = false;
      const nextPackages = data.packages.map((pkg) => {
        // If package doesn't have meals structure, create it
        if (!pkg.meals) {
          console.log(`📦 Adding meals structure to package: ${pkg.name || pkg.id}`);
          changed = true;
          
          // Create meals structure with default values
          const meals = {
            breakfast: {
              originalPrice: pkg.originalPrice || 0,
              price: pkg.price || pkg.originalPrice || 0,
              discount: pkg.discount || 0
            },
            lunch: {
              originalPrice: pkg.originalPrice || 0,
              price: pkg.price || pkg.originalPrice || 0,
              discount: pkg.discount || 0
            },
            dinner: {
              originalPrice: pkg.originalPrice || 0,
              price: pkg.price || pkg.originalPrice || 0,
              discount: pkg.discount || 0
            }
          };
          
          return { ...pkg, meals };
        }
        
        // If meals structure exists but is incomplete, fill missing fields
        if (pkg.meals) {
          let mealsChanged = false;
          const updatedMeals = { ...pkg.meals };
          
          ['breakfast', 'lunch', 'dinner'].forEach(meal => {
            if (!updatedMeals[meal]) {
              updatedMeals[meal] = {
                originalPrice: pkg.originalPrice || 0,
                price: pkg.price || pkg.originalPrice || 0,
                discount: pkg.discount || 0
              };
              mealsChanged = true;
            } else {
              // Ensure all required fields exist
              if (updatedMeals[meal].originalPrice === undefined) {
                updatedMeals[meal].originalPrice = pkg.originalPrice || 0;
                mealsChanged = true;
              }
              if (updatedMeals[meal].price === undefined) {
                updatedMeals[meal].price = pkg.price || pkg.originalPrice || 0;
                mealsChanged = true;
              }
              if (updatedMeals[meal].discount === undefined) {
                updatedMeals[meal].discount = pkg.discount || 0;
                mealsChanged = true;
              }
            }
          });
          
          if (mealsChanged) {
            console.log(`📦 Updating meals structure for package: ${pkg.name || pkg.id}`);
            changed = true;
            return { ...pkg, meals: updatedMeals };
          }
        }
        
        return pkg;
      });

      if (changed) {
        try {
          await updateDoc(doc(window.db, 'postorder', d.id), {
            packages: nextPackages,
            updatedAt: new Date()
          });
          updatedCount++;
          console.log(`✅ Updated ${d.id}`);
        } catch (err) {
          console.error(`❌ Failed ${d.id}`, err);
        }
      } else {
        console.log(`⏭️ No changes needed for ${d.id}`);
      }
    }

    console.log(`🎉 Done. Updated: ${updatedCount}/${total} services`);
    return { updated: updatedCount, total };
  }

  window.fixPackageMealsStructure = fixPackageMealsStructure;
  console.log('ℹ️ fixPackageMealsStructure available. Run: await fixPackageMealsStructure()');
})();




