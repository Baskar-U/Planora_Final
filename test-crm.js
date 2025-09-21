// Test CRM Functionality
console.log('🧪 Testing Enhanced Customer CRM...');

if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Refresh page and try again.');
} else {
  console.log('✅ Firebase available');
  
  // Test functions
  window.testCRM = {
    // Test customer orders
    testCustomerOrders: async () => {
      try {
        console.log('🔍 Testing customer orders...');
        const ordersRef = window.collection(window.db, "vendorBookings");
        const snapshot = await window.getDocs(ordersRef);
        console.log(`📊 Found ${snapshot.size} total orders`);
        
        const orders = [];
        snapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📋 Sample orders:', orders.slice(0, 3));
        return orders;
      } catch (error) {
        console.error('Error testing orders:', error);
      }
    },

    // Test customer analytics
    testCustomerAnalytics: async () => {
      try {
        console.log('🔍 Testing customer analytics...');
        const analyticsRef = window.collection(window.db, "customerAnalytics");
        const snapshot = await window.getDocs(analyticsRef);
        console.log(`📊 Found ${snapshot.size} analytics records`);
        
        const analytics = [];
        snapshot.forEach(doc => {
          analytics.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('📋 Analytics data:', analytics);
        return analytics;
      } catch (error) {
        console.error('Error testing analytics:', error);
      }
    },

    // Test user profile
    testUserProfile: async () => {
      try {
        const user = window.auth.currentUser;
        if (!user) {
          console.log('❌ No user logged in');
          return;
        }

        console.log('🔍 Testing user profile...');
        const userRef = window.doc(window.db, "users", user.uid);
        const userDoc = await window.getDoc(userRef);
        
        if (userDoc.exists()) {
          console.log('✅ User profile found:', userDoc.data());
        } else {
          console.log('❌ User profile not found');
        }
      } catch (error) {
        console.error('Error testing user profile:', error);
      }
    },

    // Run all tests
    runAllTests: async () => {
      console.log('🚀 Running all CRM tests...');
      await window.testCRM.testUserProfile();
      await window.testCRM.testCustomerOrders();
      await window.testCRM.testCustomerAnalytics();
      console.log('✅ All tests completed!');
    }
  };

  console.log('🧪 Test functions available:');
  console.log('- window.testCRM.testCustomerOrders()');
  console.log('- window.testCRM.testCustomerAnalytics()');
  console.log('- window.testCRM.testUserProfile()');
  console.log('- window.testCRM.runAllTests()');
  
  console.log('');
  console.log('💡 Quick test: window.testCRM.runAllTests()');
}

// Auto-run basic test
setTimeout(async () => {
  if (window.testCRM) {
    await window.testCRM.runAllTests();
  }
}, 1000);
