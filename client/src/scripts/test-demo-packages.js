// Simple test script to check if demo packages can be added
// Run this in the browser console after logging in

console.log('🧪 Testing Demo Packages Script...');

// Check if Firebase is available
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase is not available. Make sure you are on the Planora website.');
  console.log('Please go to your Planora application and run this script in the browser console.');
} else {
  console.log('✅ Firebase is available');
  
  // Check if user is authenticated
  const auth = firebase.auth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.error('❌ No user is logged in. Please log in first.');
  } else {
    console.log('✅ User is logged in:', currentUser.email);
    
    // Test Firestore access
    const db = firebase.firestore();
    const testRef = db.collection('postorder');
    
    testRef.limit(1).get().then((snapshot) => {
      if (snapshot.empty) {
        console.log('⚠️ No documents found in postorder collection');
      } else {
        console.log('✅ Successfully accessed postorder collection');
        console.log('📊 Found', snapshot.size, 'document(s)');
        
        // Show first document as example
        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        console.log('📋 Example document:', {
          id: firstDoc.id,
          businessname: data.businessname,
          category: data.category,
          packagesCount: data.packages ? data.packages.length : 0
        });
      }
    }).catch((error) => {
      console.error('❌ Error accessing Firestore:', error);
      console.log('This might be a permissions issue. Check your Firebase rules.');
    });
  }
}

console.log('🧪 Test completed. If you see ✅ messages above, the demo packages script should work.');



