// Debug Console Script for Floating Tracker
// Copy and paste this code into your browser console

console.log('🔍 Debugging Floating Tracker...');

// Check if user is logged in
if (window.auth && window.auth.currentUser) {
  console.log('✅ User is logged in:', window.auth.currentUser.uid);
  console.log('📧 Email:', window.auth.currentUser.email);
} else {
  console.log('❌ No user logged in');
  console.log('💡 Please log in to see the floating tracker');
}

// Check applications collection
if (window.db) {
  console.log('✅ Firebase database available');
  
  // Try to fetch applications
  window.getDocs(window.collection(window.db, 'applications'))
    .then((snapshot) => {
      console.log('📊 Applications found:', snapshot.size);
      snapshot.forEach((doc) => {
        console.log('📄 Application:', doc.id, doc.data().status, doc.data().phase);
      });
    })
    .catch((error) => {
      console.error('❌ Error fetching applications:', error);
    });
} else {
  console.log('❌ Firebase database not available');
}

// Check if React Query is working
if (window.ReactQueryDevtools) {
  console.log('✅ React Query DevTools available');
} else {
  console.log('⚠️ React Query DevTools not found');
}

console.log('\n🎯 Next steps:');
console.log('1. Make sure you are logged in');
console.log('2. Check if the debug tracker appears (yellow debug box)');
console.log('3. Visit /order-tracking-demo to create test applications');
console.log('4. The floating tracker should appear on all pages');








