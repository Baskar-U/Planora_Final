// Enhance Catering Meal Fields - Browser Console Script (Firebase v9 CDN)
// Usage:
// 1) Open your app (same origin with Firebase config available) OR paste your config below
// 2) Open DevTools Console and paste this entire file, then run:
//    await window.enhanceCateringMealFields.run()
// The script will add packages[].meals.{breakfast,lunch,dinner} if missing.

(function () {
  async function getFirebase() {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
    const { getFirestore, collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');

    let app = undefined;
    if (window.firebaseConfig) {
      app = initializeApp(window.firebaseConfig);
    } else if (window.__FIREBASE_DEFAULTS__ && window.__FIREBASE_DEFAULTS__.config) {
      app = initializeApp(window.__FIREBASE_DEFAULTS__.config);
    } else if (window.__firebase_app && window.__firebase_app.options) {
      app = initializeApp(window.__firebase_app.options);
    } else {
      throw new Error('Firebase config not found on window. Set window.firebaseConfig = { ... } before running.');
    }
    const db = getFirestore(app);
    return { db, collection, getDocs, doc, updateDoc };
  }

  function toMealPricing(originalPrice, price) {
    const o = Number(originalPrice) || 0;
    const p = Number(price) || 0;
    const discount = o > 0 ? Math.max(0, Math.round(((o - p) / o) * 100)) : 0;
    return { originalPrice: o, price: p, discount };
  }

  async function run() {
    console.log('🍽️ Enhancing Catering meal fields in postorder...');
    const { db, collection, getDocs, doc, updateDoc } = await getFirebase();
    const snap = await getDocs(collection(db, 'postorder'));
    let updated = 0;
    let skipped = 0;

    for (const d of snap.docs) {
      const data = d.data();
      if ((data.category || '').toLowerCase() !== 'catering') {
        skipped++; continue;
      }
      const packages = Array.isArray(data.packages) ? data.packages : [];
      let changed = false;

      const nextPackages = packages.map((pkg) => {
        const cp = { ...pkg };
        if (!cp.meals) {
          // Seed with base price if available; vendor can refine later in UI
          cp.meals = {
            breakfast: toMealPricing(cp.originalPrice, cp.price),
            lunch: toMealPricing(cp.originalPrice, cp.price),
            dinner: toMealPricing(cp.originalPrice, cp.price)
          };
          changed = true;
        } else {
          // Ensure all three keys present
          const m = { ...cp.meals };
          if (!m.breakfast) { m.breakfast = toMealPricing(cp.originalPrice, cp.price); changed = true; }
          if (!m.lunch) { m.lunch = toMealPricing(cp.originalPrice, cp.price); changed = true; }
          if (!m.dinner) { m.dinner = toMealPricing(cp.originalPrice, cp.price); changed = true; }
          cp.meals = m;
        }
        return cp;
      });

      if (changed) {
        await updateDoc(doc(db, 'postorder', d.id), {
          packages: nextPackages,
          updatedAt: new Date()
        });
        updated++;
        console.log(`✅ Updated ${d.id}`);
      }
    }
    console.log(`🎉 Done. Updated: ${updated}, Skipped (non-catering/no change): ${skipped}`);
  }

  window.enhanceCateringMealFields = { run };
  console.log('ℹ️ enhanceCateringMealFields available. Run: await enhanceCateringMealFields.run()');
})();






