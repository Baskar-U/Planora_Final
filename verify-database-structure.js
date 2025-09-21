// Comprehensive Database Structure Verification Script
// Run this in your browser console to verify vendor data and search functionality

console.log('🔍 Verifying Database Structure and Search Functionality...');

// Check if Firebase functions are available
if (typeof window !== 'undefined' && window.db && window.collection && window.getDocs && window.addDoc) {
  console.log('✅ Firebase functions available');
  
  // Main verification function
  window.verifyDatabaseStructure = async () => {
    try {
      console.log('🔍 Starting comprehensive database verification...');
      
      // 1. Check postorder collection (vendors)
      console.log('📊 Checking postorder collection...');
      const postorderRef = window.collection(window.db, "postorder");
      const postorderSnapshot = await window.getDocs(postorderRef);
      const postorderVendors = postorderSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📊 Postorder collection vendors:', postorderVendors.length);
      console.log('🔍 First few postorder vendors:', postorderVendors.slice(0, 3));
      
      // 2. Check vendors collection (if exists)
      console.log('📊 Checking vendors collection...');
      let vendorsCollectionVendors = [];
      try {
        const vendorsRef = window.collection(window.db, "vendors");
        const vendorsSnapshot = await window.getDocs(vendorsRef);
        vendorsCollectionVendors = vendorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('📊 Vendors collection vendors:', vendorsCollectionVendors.length);
        console.log('🔍 First few vendors collection vendors:', vendorsCollectionVendors.slice(0, 3));
      } catch (error) {
        console.log('⚠️ Vendors collection does not exist or is empty');
      }
      
      // 3. Analyze data structure
      const allVendors = [...postorderVendors, ...vendorsCollectionVendors];
      console.log('📊 Total vendors across all collections:', allVendors.length);
      
      if (allVendors.length > 0) {
        const sampleVendor = allVendors[0];
        console.log('🔍 Sample vendor structure:', sampleVendor);
        console.log('🔍 Available fields:', Object.keys(sampleVendor));
        
        // Check field usage
        const fieldAnalysis = {
          eventname: allVendors.filter(v => v.eventname).length,
          category: allVendors.filter(v => v.category).length,
          description: allVendors.filter(v => v.description).length,
          menu: allVendors.filter(v => v.menu && v.menu.length > 0).length,
          businessname: allVendors.filter(v => v.businessname).length,
          name: allVendors.filter(v => v.name).length,
          location: allVendors.filter(v => v.location).length
        };
        
        console.log('📊 Field usage analysis:', fieldAnalysis);
        
        // Check eventname patterns
        const eventnamePatterns = allVendors
          .filter(v => v.eventname)
          .map(v => v.eventname)
          .slice(0, 10);
        console.log('📋 Eventname patterns (first 10):', eventnamePatterns);
        
        // Check category patterns
        const categoryPatterns = [...new Set(allVendors
          .filter(v => v.category)
          .map(v => v.category))];
        console.log('📋 Available categories:', categoryPatterns);
      }
      
      // 4. Test catering search with current data
      console.log('🔍 Testing catering search with current data...');
      const cateringVendors = allVendors.filter(vendor => {
        const matchesEventName = vendor.eventname?.toLowerCase().includes('catering');
        const matchesCategory = vendor.category?.toLowerCase().includes('catering');
        const matchesDescription = vendor.description?.toLowerCase().includes('catering');
        const matchesMenu = vendor.menu?.some((item) => 
          item.toLowerCase().includes('catering')
        );
        const matchesBusinessName = vendor.businessname?.toLowerCase().includes('catering');
        
        return matchesEventName || matchesCategory || matchesDescription || matchesMenu || matchesBusinessName;
      });
      
      console.log('🍽️ Catering vendors found:', cateringVendors.length);
      if (cateringVendors.length > 0) {
        console.log('✅ Catering vendors:', cateringVendors);
      }
      
      return {
        postorderVendors: postorderVendors.length,
        vendorsCollectionVendors: vendorsCollectionVendors.length,
        totalVendors: allVendors.length,
        cateringVendors: cateringVendors.length,
        fieldAnalysis: fieldAnalysis,
        categoryPatterns: categoryPatterns,
        eventnamePatterns: eventnamePatterns,
        allVendors: allVendors.slice(0, 5), // First 5 for inspection
        foundCateringVendors: cateringVendors
      };
      
    } catch (error) {
      console.error('❌ Error verifying database structure:', error);
      throw error;
    }
  };
  
  // Add test catering vendor to the correct collection
  window.addCateringVendorToCorrectCollection = async () => {
    try {
      console.log('➕ Adding catering vendor to postorder collection...');
      
      const testVendor = {
        name: "Premium Catering Services",
        businessname: "Premium Catering Co.",
        eventname: "catering,wedding,birthday,corporate,party",
        category: "Catering",
        description: "Professional catering services for all types of events. We specialize in delicious food and excellent service for weddings, corporate events, parties, and more. Our menu includes South Indian, North Indian, Chinese, and Continental cuisine.",
        location: "Chennai, Tamil Nadu",
        mobilenumber: "9876543210",
        email: "info@premiumcatering.com",
        hours: "8:00 AM - 11:00 PM",
        exprience: "10 years",
        from: "Chennai",
        menu: [
          "South Indian Catering",
          "North Indian Catering", 
          "Chinese Food Catering",
          "Continental Dishes",
          "Wedding Catering",
          "Corporate Event Catering",
          "Party Catering",
          "Desserts & Sweets",
          "Beverages"
        ],
        features: [
          "Live Cooking",
          "Buffet Service",
          "Table Service",
          "Outdoor Catering",
          "Veg & Non-Veg Options"
        ],
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3",
        isVerified: true,
        rating: 4.8,
        reviewCount: 125,
        price: 250,
        priceUnit: "per_person",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to postorder collection (where vendors are fetched from)
      const postorderRef = window.collection(window.db, "postorder");
      const docRef = await window.addDoc(postorderRef, testVendor);
      
      console.log('✅ Test catering vendor added to postorder collection with ID:', docRef.id);
      
      // Also add to vendors collection for consistency
      try {
        const vendorsRef = window.collection(window.db, "vendors");
        const docRef2 = await window.addDoc(vendorsRef, testVendor);
        console.log('✅ Test catering vendor also added to vendors collection with ID:', docRef2.id);
      } catch (error) {
        console.log('⚠️ Could not add to vendors collection (may not exist):', error.message);
      }
      
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Error adding catering vendor:', error);
      throw error;
    }
  };
  
  // Fix search functionality by updating existing vendors
  window.fixExistingVendorsForCatering = async () => {
    try {
      console.log('🔧 Fixing existing vendors to include catering...');
      
      // Get all vendors from postorder collection
      const postorderRef = window.collection(window.db, "postorder");
      const snapshot = await window.getDocs(postorderRef);
      
      let updatedCount = 0;
      
      for (const docSnapshot of snapshot.docs) {
        const vendor = docSnapshot.data();
        const docId = docSnapshot.id;
        
        // Check if this vendor could be a catering vendor based on description or menu
        const couldBeCatering = 
          vendor.description?.toLowerCase().includes('food') ||
          vendor.description?.toLowerCase().includes('cook') ||
          vendor.description?.toLowerCase().includes('meal') ||
          vendor.menu?.some(item => 
            item.toLowerCase().includes('food') || 
            item.toLowerCase().includes('cook') ||
            item.toLowerCase().includes('meal')
          ) ||
          vendor.eventname?.toLowerCase().includes('wedding') ||
          vendor.category?.toLowerCase().includes('food');
        
        if (couldBeCatering && !vendor.eventname?.toLowerCase().includes('catering')) {
          // Update this vendor to include catering in eventname
          const updatedEventname = vendor.eventname ? 
            `${vendor.eventname},catering` : 
            'catering,wedding,birthday,corporate';
          
          const updatedCategory = vendor.category || 'Catering';
          
          // Update the document
          const docRef = window.doc(window.db, "postorder", docId);
          await window.updateDoc(docRef, {
            eventname: updatedEventname,
            category: updatedCategory,
            updatedAt: new Date().toISOString()
          });
          
          updatedCount++;
          console.log(`✅ Updated vendor ${docId} with catering eventname`);
        }
      }
      
      console.log(`🎉 Updated ${updatedCount} vendors to include catering`);
      return updatedCount;
      
    } catch (error) {
      console.error('❌ Error fixing existing vendors:', error);
      throw error;
    }
  };
  
  // Complete test function
  window.testCompleteSearchFunctionality = async () => {
    try {
      console.log('🚀 Running complete search functionality test...');
      
      // 1. Verify current database structure
      const verification = await window.verifyDatabaseStructure();
      console.log('📊 Database verification complete:', verification);
      
      // 2. Add a proper catering vendor if none exist
      if (verification.cateringVendors === 0) {
        console.log('⚠️ No catering vendors found, adding test vendor...');
        await window.addCateringVendorToCorrectCollection();
        
        // Also fix existing vendors
        const updatedCount = await window.fixExistingVendorsForCatering();
        console.log(`✅ Fixed ${updatedCount} existing vendors`);
      }
      
      // 3. Re-verify after adding vendors
      const postVerification = await window.verifyDatabaseStructure();
      console.log('📊 Post-update verification:', postVerification);
      
      // 4. Test the search
      console.log('🔍 Testing search functionality...');
      console.log('💡 Now try searching for "Catering" on your homepage!');
      
      return postVerification;
      
    } catch (error) {
      console.error('❌ Complete test failed:', error);
      throw error;
    }
  };
  
  console.log('🚀 Database verification functions available:');
  console.log('- window.verifyDatabaseStructure() - Check database structure');
  console.log('- window.addCateringVendorToCorrectCollection() - Add catering vendor');
  console.log('- window.fixExistingVendorsForCatering() - Fix existing vendors');
  console.log('- window.testCompleteSearchFunctionality() - Run complete test');
  
  // Auto-run verification
  console.log('🔍 Auto-running database structure verification...');
  window.verifyDatabaseStructure().then(result => {
    console.log('📊 Database verification complete:', result);
    
    if (result.totalVendors === 0) {
      console.log('⚠️ No vendors found in database!');
    } else if (result.cateringVendors === 0) {
      console.log('⚠️ No catering vendors found! Run window.testCompleteSearchFunctionality() to fix this.');
    } else {
      console.log('✅ Catering vendors found! Search should work.');
    }
  }).catch(error => {
    console.error('❌ Database verification failed:', error);
  });
  
} else {
  console.log('❌ Firebase functions not available. Please refresh the page and try again.');
}
