// Firebase Index Setup for My Orders Page
// Run this in the browser console to create the required composite index

console.log('🚀 Setting up Firebase Index for My Orders...');

// Function to create the composite index
function createOrdersIndex() {
  console.log('📋 Creating composite index for vendorBookings collection...');
  
  // The direct link to create the index
  const indexUrl = 'https://console.firebase.google.com/v1/r/project/planora-ce3a5/firestore/indexes?create_composite=ClRwcm9qZWN0cy9wbGFub3JhLWNlM2E1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy92ZW5kb3JCb29raW5ncy9pbmRleGVzL18QARoOCgpjdXN0b21lcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg';
  
  console.log('🔗 Click this link to create the index:');
  console.log(indexUrl);
  
  // Open the link in a new tab
  window.open(indexUrl, '_blank');
  
  console.log('✅ Index creation link opened in new tab');
  console.log('📝 Instructions:');
  console.log('1. Click the link above (opens in new tab)');
  console.log('2. Sign in to Firebase Console if needed');
  console.log('3. Click "Create Index" button');
  console.log('4. Wait for the index to build (may take a few minutes)');
  console.log('5. Return to this page and refresh');
}

// Function to check if Firebase functions are available
function checkFirebaseFunctions() {
  if (typeof window !== 'undefined' && window.db) {
    console.log('✅ Firebase functions available');
    return true;
  } else {
    console.log('❌ Firebase functions not available. Please refresh the page and try again.');
    return false;
  }
}

// Function to test the query after index is created
function testOrdersQuery() {
  if (!checkFirebaseFunctions()) return;
  
  console.log('🧪 Testing orders query...');
  
  const { collection, query, where, orderBy, getDocs } = window;
  
  // Get current user
  const currentUser = window.auth?.currentUser;
  if (!currentUser) {
    console.log('❌ No user logged in');
    return;
  }
  
  const customerId = currentUser.uid;
  console.log('👤 Customer ID:', customerId);
  
  // Test the query that was failing
  const vendorBookingsRef = collection(window.db, 'vendorBookings');
  const ordersQuery = query(
    vendorBookingsRef,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  
  getDocs(ordersQuery)
    .then((snapshot) => {
      console.log('✅ Query successful!');
      console.log('📊 Orders found:', snapshot.size);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📋 Order:', {
          id: doc.id,
          bookingId: data.bookingId,
          vendorName: data.vendorName,
          eventType: data.eventType,
          status: data.status,
          createdAt: data.createdAt
        });
      });
    })
    .catch((error) => {
      console.log('❌ Query failed:', error.message);
      if (error.message.includes('index')) {
        console.log('🔧 Index still building or not created yet');
        console.log('⏳ Please wait a few minutes and try again');
      }
    });
}

// Function to add test orders for the current user
function addTestOrders() {
  if (!checkFirebaseFunctions()) return;
  
  const currentUser = window.auth?.currentUser;
  if (!currentUser) {
    console.log('❌ No user logged in');
    return;
  }
  
  console.log('➕ Adding test orders for user:', currentUser.uid);
  
  const { collection, addDoc, serverTimestamp } = window;
  const vendorBookingsRef = collection(window.db, 'vendorBookings');
  
  const testOrders = [
    {
      bookingId: 'VB-TEST-001',
      customerId: currentUser.uid,
      customerName: currentUser.displayName || 'Test Customer',
      customerEmail: currentUser.email || 'test@example.com',
      vendorId: 'vendor1',
      vendorName: 'Test Photography Studio',
      eventType: 'Wedding',
      eventDate: '2024-12-25',
      eventTime: '10:00 AM',
      location: 'Chennai',
      budget: 50000,
      requirements: 'Professional wedding photography services',
      status: 'pending',
      createdAt: serverTimestamp()
    },
    {
      bookingId: 'VB-TEST-002',
      customerId: currentUser.uid,
      customerName: currentUser.displayName || 'Test Customer',
      customerEmail: currentUser.email || 'test@example.com',
      vendorId: 'vendor2',
      vendorName: 'Elite Catering Services',
      eventType: 'Birthday Party',
      eventDate: '2024-11-15',
      eventTime: '7:00 PM',
      location: 'Chennai',
      budget: 25000,
      requirements: 'Catering for 50 people',
      status: 'confirmed',
      createdAt: serverTimestamp()
    }
  ];
  
  Promise.all(testOrders.map(order => addDoc(vendorBookingsRef, order)))
    .then(() => {
      console.log('✅ Test orders added successfully!');
      console.log('🔄 Now test the query...');
      testOrdersQuery();
    })
    .catch((error) => {
      console.log('❌ Error adding test orders:', error.message);
    });
}

// Main execution
console.log('🚀 Firebase Index Setup for My Orders');
console.log('📋 Available functions:');
console.log('- createOrdersIndex() - Create the required composite index');
console.log('- testOrdersQuery() - Test the orders query after index is created');
console.log('- addTestOrders() - Add test orders for the current user');

// Auto-run the index creation
createOrdersIndex();

