// Simple Browser Console Script to Update Postorder Collection
// Copy and paste this into your browser console

(async () => {
  try {
    console.log('🚀 Starting postorder collection update...');
    
    // Check if Firebase is available
    if (typeof window.firebase === 'undefined') {
      console.error('❌ Firebase not found. Make sure you are on a page with Firebase initialized.');
      return;
    }
    
    const db = window.firebase.firestore();
    const { collection, getDocs, doc, updateDoc } = window.firebase.firestore;
    
    // Get all documents from postorder collection
    const postorderRef = collection(db, 'postorder');
    const snapshot = await getDocs(postorderRef);
    
    console.log(`📊 Found ${snapshot.size} documents to update`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each document
    for (const docSnapshot of snapshot.docs) {
      try {
        const docId = docSnapshot.id;
        const docData = docSnapshot.data();
        
        console.log(`\n🔄 Processing document: ${docId}`);
        console.log('Business Name:', docData.businessname);
        
        // Prepare update object with new fields
        const updateData = {
          // Map existing fields to new structure
          serviceName: docData.serviceName || docData.eventname || docData.businessname || 'Service Name',
          category: docData.category || 'General',
          subcategory: docData.subcategory || '',
          serviceFeatures: docData.serviceFeatures || docData.features || [],
          packages: docData.packages || [],
          collections: docData.collections || [],
          coverImage: docData.coverImage || docData.image || '',
          workingHours: docData.workingHours || docData.hours || '9 AM - 6 PM',
          serviceableCities: docData.serviceableCities || docData.from || [docData.location || 'Chennai'],
          isVerified: docData.isVerified !== undefined ? docData.isVerified : false,
          updatedAt: new Date()
        };
        
        // Check if document needs updates
        const needsUpdate = Object.keys(updateData).some(key => {
          if (key === 'updatedAt') return true; // Always update timestamp
          return docData[key] === undefined || docData[key] === null || docData[key] === '';
        });
        
        if (needsUpdate) {
          // Update the document
          const docRef = doc(db, 'postorder', docId);
          await updateDoc(docRef, updateData);
          
          console.log(`✅ Updated document: ${docId}`);
          console.log('Added fields:', Object.keys(updateData).filter(key => 
            docData[key] === undefined || docData[key] === null || docData[key] === ''
          ));
          updatedCount++;
        } else {
          console.log(`⏭️  Document ${docId} already has all required fields`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating document ${docSnapshot.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Update completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} documents`);
    console.log(`❌ Errors: ${errorCount} documents`);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
})();

