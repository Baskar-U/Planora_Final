// Browser Console Script to Update Postorder Collection Fields
// Run this in your browser console on your Firebase project

// First, make sure you have Firebase initialized in your browser console
// If not, you can initialize it with your config

const updatePostorderFields = async () => {
  try {
    console.log('🚀 Starting postorder collection update...');
    
    // Import Firebase functions (V9)
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
    const { getFirestore, collection, getDocs, doc, updateDoc, query, where } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
    
    // Initialize Firebase (replace with your config)
    const firebaseConfig = {
      // Add your Firebase config here
      apiKey: "your-api-key",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
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
        console.log('Current data:', docData);
        
        // Prepare update object with new fields
        const updateData = {
          // Add new fields that might be missing
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
          createdAt: docData.createdAt || new Date(),
          updatedAt: new Date()
        };
        
        // Only update if there are actual changes needed
        const needsUpdate = Object.keys(updateData).some(key => {
          if (key === 'updatedAt') return true; // Always update timestamp
          return docData[key] === undefined || docData[key] === null || docData[key] === '';
        });
        
        if (needsUpdate) {
          // Update the document
          const docRef = doc(db, 'postorder', docId);
          await updateDoc(docRef, updateData);
          
          console.log(`✅ Updated document: ${docId}`);
          console.log('New fields added:', updateData);
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
};

// Alternative version if you already have Firebase initialized in your app
const updatePostorderFieldsWithExistingFirebase = async () => {
  try {
    console.log('🚀 Starting postorder collection update with existing Firebase...');
    
    // Use existing Firebase instance from your app
    const { collection, getDocs, doc, updateDoc } = window.firebase.firestore();
    const db = window.firebase.firestore();
    
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
        
        // Prepare update object with new fields
        const updateData = {
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
        
        // Only update if there are actual changes needed
        const needsUpdate = Object.keys(updateData).some(key => {
          if (key === 'updatedAt') return true;
          return docData[key] === undefined || docData[key] === null || docData[key] === '';
        });
        
        if (needsUpdate) {
          await docSnapshot.ref.update(updateData);
          console.log(`✅ Updated document: ${docId}`);
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
};

// Run the appropriate function based on your setup
console.log('Choose the appropriate function to run:');
console.log('1. updatePostorderFields() - If you need to initialize Firebase');
console.log('2. updatePostorderFieldsWithExistingFirebase() - If Firebase is already initialized in your app');

// Uncomment the line you want to run:
// updatePostorderFields();
// updatePostorderFieldsWithExistingFirebase();

