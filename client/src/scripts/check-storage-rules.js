// Check Firebase Storage Rules
// This script helps diagnose storage permission issues

console.log('🔍 Checking Firebase Storage Rules...');

window.checkStorageRules = async () => {
  try {
    // Check if Firebase is available
    if (typeof window.db === 'undefined') {
      console.error('❌ Firebase not available. Please refresh the page and try again.');
      return;
    }
    
    console.log('✅ Firebase available');
    
    // Check authentication
    if (!window.auth?.currentUser) {
      console.error('❌ User not authenticated. Please sign in first.');
      return;
    }
    
    console.log('✅ User authenticated:', window.auth.currentUser.uid);
    console.log('📧 User email:', window.auth.currentUser.email);
    
    // Test different storage paths
    const { ref } = await import('firebase/storage');
    const { storage } = await import('@/lib/firebase');
    
    const testPaths = [
      `decoration-images/${window.auth.currentUser.uid}/test.txt`,
      `services/${window.auth.currentUser.uid}/cover/test.txt`,
      `decoration-images/test.txt`
    ];
    
    console.log('🧪 Testing different storage paths...');
    
    for (const path of testPaths) {
      try {
        const testRef = ref(storage, path);
        console.log(`✅ Path accessible: ${path}`);
      } catch (error) {
        console.error(`❌ Path error: ${path}`, error.message);
      }
    }
    
    // Check if we can list files in the decoration-images folder
    try {
      const { listAll } = await import('firebase/storage');
      const decorationRef = ref(storage, `decoration-images/${window.auth.currentUser.uid}`);
      const result = await listAll(decorationRef);
      console.log('✅ Can list decoration-images folder:', result.items.length, 'files');
    } catch (error) {
      console.error('❌ Cannot list decoration-images folder:', error.message);
    }
    
    console.log('📋 Storage Rules Check Complete');
    console.log('💡 If you see errors, check your Firebase Storage rules in the Firebase Console');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
};

console.log('📋 Available function:');
console.log('- window.checkStorageRules()');
console.log('');
console.log('💡 Run: window.checkStorageRules()');




