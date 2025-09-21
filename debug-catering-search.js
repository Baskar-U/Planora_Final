// Debug Catering Search - Console Script
// Run this in your browser console to check catering vendors

console.log('🔍 Debugging Catering Search...');

// Check if Firebase functions are available
if (typeof window !== 'undefined' && window.db && window.collection && window.getDocs && window.addDoc) {
  console.log('✅ Firebase functions available');
  
  // Debug catering vendors
  window.debugCateringVendors = async () => {
    try {
      console.log('🔍 Checking catering vendors...');
      
      // Get all vendors
      const vendorsRef = window.collection(window.db, "vendors");
      const vendorsSnapshot = await window.getDocs(vendorsRef);
      const allVendors = vendorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📊 Total vendors:', allVendors.length);
      
      // Filter vendors that match "Catering"
      const cateringVendors = allVendors.filter(vendor => {
        const matchesEventName = vendor.eventname?.toLowerCase().includes('catering');
        const matchesDescription = vendor.description?.toLowerCase().includes('catering');
        const matchesMenu = vendor.menu?.some((item) => 
          item.toLowerCase().includes('catering')
        );
        
        return matchesEventName || matchesDescription || matchesMenu;
      });
      
      console.log('🍽️ Catering vendors found:', cateringVendors.length);
      console.log('🔍 Catering vendors:', cateringVendors);
      
      // Check eventname fields specifically
      const eventNames = allVendors.map(vendor => ({
        id: vendor.id,
        eventname: vendor.eventname,
        description: vendor.description?.substring(0, 50) + '...'
      }));
      
      console.log('📋 All vendor event names:', eventNames);
      
      // Check for exact matches
      const exactCateringMatch = allVendors.filter(vendor => 
        vendor.eventname?.toLowerCase() === 'catering'
      );
      
      const partialCateringMatch = allVendors.filter(vendor => 
        vendor.eventname?.toLowerCase().includes('catering')
      );
      
      console.log('🎯 Exact "catering" matches:', exactCateringMatch.length);
      console.log('🔍 Partial "catering" matches:', partialCateringMatch.length);
      
      if (exactCateringMatch.length > 0) {
        console.log('✅ Exact catering vendors:', exactCateringMatch);
      }
      
      if (partialCateringMatch.length > 0) {
        console.log('✅ Partial catering vendors:', partialCateringMatch);
      }
      
      // Check what event names are available
      const uniqueEventNames = [...new Set(allVendors.map(v => v.eventname).filter(Boolean))];
      console.log('📋 Unique event names in database:', uniqueEventNames);
      
      return {
        totalVendors: allVendors.length,
        cateringVendors: cateringVendors.length,
        exactMatches: exactCateringMatch.length,
        partialMatches: partialCateringMatch.length,
        uniqueEventNames,
        allVendors,
        cateringVendors
      };
      
    } catch (error) {
      console.error('❌ Error debugging catering vendors:', error);
      throw error;
    }
  };
  
  // Add a catering vendor for testing with proper eventname format
  window.addTestCateringVendor = async () => {
    try {
      console.log('➕ Adding test catering vendor...');
      
      const testVendor = {
        name: "Delicious Catering Services",
        businessname: "Delicious Catering Co.",
        eventname: "catering,wedding,birthday,corporate", // Using comma-separated format like existing vendors
        description: "Professional catering services for all types of events. We provide delicious food and excellent service for weddings, corporate events, parties, and more.",
        location: "Chennai, Tamil Nadu",
        mobilenumber: "9876543210",
        email: "info@deliciouscatering.com",
        hours: "9:00 AM - 10:00 PM",
        exprience: 8,
        menu: [
          "South Indian Cuisine",
          "North Indian Cuisine", 
          "Chinese Food",
          "Continental Dishes",
          "Desserts & Sweets",
          "Beverages"
        ],
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3",
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const vendorsRef = window.collection(window.db, "vendors");
      const docRef = await window.addDoc(vendorsRef, testVendor);
      
      console.log('✅ Test catering vendor added with ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Error adding test catering vendor:', error);
      throw error;
    }
  };
  
  // Test the search functionality
  window.testCateringSearch = async () => {
    try {
      console.log('🔍 Testing catering search functionality...');
      
      // First, add a test catering vendor
      const vendorId = await window.addTestCateringVendor();
      console.log('✅ Added test vendor with ID:', vendorId);
      
      // Wait a moment for the data to be available
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Now test the search
      const result = await window.debugCateringVendors();
      
      if (result.cateringVendors > 0) {
        console.log('✅ Search test successful! Found catering vendors.');
        console.log('💡 Now try searching for "Catering" on the homepage.');
      } else {
        console.log('❌ Search test failed. No catering vendors found.');
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error testing catering search:', error);
      throw error;
    }
  };
  
  console.log('🚀 Debug functions available:');
  console.log('- window.debugCateringVendors() - Check catering vendors');
  console.log('- window.addTestCateringVendor() - Add test catering vendor');
  console.log('- window.testCateringSearch() - Add vendor and test search');
  
  // Auto-run debug
  console.log('🔍 Auto-running catering debug...');
  window.debugCateringVendors().then(result => {
    console.log('📊 Catering debug complete:', result);
    
    if (result.cateringVendors === 0) {
      console.log('⚠️ No catering vendors found! This is why search returns no results.');
      console.log('💡 You can add a test catering vendor by running: window.addTestCateringVendor()');
      console.log('💡 Or run the full test: window.testCateringSearch()');
    } else {
      console.log('✅ Found catering vendors! Search should work.');
      console.log('💡 If search still doesn\'t work, there might be an issue with the SearchResults component.');
    }
  }).catch(error => {
    console.error('❌ Catering debug failed:', error);
  });
  
} else {
  console.log('❌ Firebase functions not available. Please refresh the page and try again.');
}
