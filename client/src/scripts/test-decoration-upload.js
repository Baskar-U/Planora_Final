// Test Decoration Image Upload
// Run this in the browser console to test the decoration image upload functionality

console.log('🧪 Testing Decoration Image Upload...');

// Check if Firebase is available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase available');
}

// Test function to check storage permissions
window.testDecorationUpload = async () => {
  try {
    console.log('🔍 Testing Firebase Storage access...');
    
    // Check if user is authenticated
    if (!window.auth?.currentUser) {
      console.error('❌ User not authenticated. Please sign in first.');
      return;
    }
    
    console.log('✅ User authenticated:', window.auth.currentUser.uid);
    
    // Test creating a reference
    const { ref } = await import('firebase/storage');
    const { storage } = await import('@/lib/firebase');
    
    const testRef = ref(storage, `decoration-images/${window.auth.currentUser.uid}/test-${Date.now()}.txt`);
    console.log('✅ Storage reference created:', testRef.fullPath);
    
    // Test uploading a small text file
    const { uploadBytes, getDownloadURL } = await import('firebase/storage');
    const testContent = new Blob(['Test content'], { type: 'text/plain' });
    
    console.log('📤 Uploading test file...');
    const snapshot = await uploadBytes(testRef, testContent);
    console.log('✅ Upload successful:', snapshot.metadata.name);
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Download URL generated:', downloadURL);
    
    console.log('🎉 Decoration upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  }
};

console.log('📋 Available test function:');
console.log('- window.testDecorationUpload()');
console.log('');
console.log('💡 Run: window.testDecorationUpload()');




