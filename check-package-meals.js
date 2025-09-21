// Check and fix package meals structure
// Run this in your browser console while logged into your app

(function () {
  async function checkPackageMeals() {
    if (!window.db || !window.auth) {
      throw new Error('window.db/window.auth not found. Make sure you exposed Firebase in main.tsx and reloaded.');
    }
    const user = window.auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated. Please sign in first in the app, then run again.');
    }

    const { collection, getDocs, query, where, updateDoc, doc } = window;
    console.log('🔍 Checking package meals structure...');

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
      return;
    }

    console.log(`Found ${byId.size} services`);

    for (const d of byId.values()) {
      const data = d.data();
      console.log(`\n📦 Service: ${data.name || d.id}`);
      console.log(`Category: ${data.category || data.eventname || 'Unknown'}`);
      
      if (!Array.isArray(data.packages) || data.packages.length === 0) {
        console.log('  ⏭️ No packages found');
        continue;
      }

      data.packages.forEach((pkg, idx) => {
        console.log(`  Package ${idx + 1}: ${pkg.name || 'Unnamed'}`);
        console.log(`    - Has meals field: ${!!pkg.meals}`);
        console.log(`    - Meals structure:`, pkg.meals);
        console.log(`    - Original price: ${pkg.originalPrice || 'N/A'}`);
        console.log(`    - Price: ${pkg.price || 'N/A'}`);
        console.log(`    - Capacity: ${pkg.capacity || 'N/A'}`);
        console.log(`    - Price unit: ${pkg.priceUnit || 'N/A'}`);
      });
    }
  }

  window.checkPackageMeals = checkPackageMeals;
  console.log('ℹ️ checkPackageMeals available. Run: await checkPackageMeals()');
})();




