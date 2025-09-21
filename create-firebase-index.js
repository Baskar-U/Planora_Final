// Create Firebase Index for Applications Collection
// Copy and paste this code into your browser console

console.log('🔧 Creating Firebase index for applications collection...');

// The index URL from the error message
const indexUrl = 'https://console.firebase.google.com/v1/r/project/planora-ce3a5/firestore/indexes?create_composite=ClJwcm9qZWN0cy9wbGFub3JhLWNlM2E1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hcHBsaWNhdGlvbnMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg';

console.log('📋 Index Details:');
console.log('- Collection: applications');
console.log('- Fields: userId (Ascending), createdAt (Descending)');
console.log('- Query scope: Collection');

console.log('\n🎯 To create the index:');
console.log('1. Click this link: ' + indexUrl);
console.log('2. Click "Create Index"');
console.log('3. Wait for the index to build (usually takes a few minutes)');
console.log('4. The floating tracker will work better with proper ordering');

console.log('\n💡 Alternative: The app will work without the index, but sorting will be done in memory');

// Open the index creation page
if (confirm('Open Firebase Console to create the index?')) {
  window.open(indexUrl, '_blank');
}








