// Create Application for Current User
// Copy and paste this code into your browser console

console.log('🔍 Creating application for current user...');

// Get current user ID
const userId = window.auth.currentUser?.uid;
if (userId) {
  console.log('✅ User logged in:', userId);
  console.log('📧 Email:', window.auth.currentUser.email);
  
  const application = {
    userId: userId,
    orderId: 'ORD-' + Date.now(),
    vendorId: 'demo-vendor-1',
    vendorName: 'Demo Catering Services',
    status: 'browsing_vendors',
    phase: 'browsing_vendors',
    eventType: 'Wedding',
    eventDate: '2024-06-15',
    eventLocation: 'Mumbai, Maharashtra',
    guestCount: 100,
    budget: 50000,
    eventDescription: 'Beautiful wedding celebration with traditional and modern elements',
    customerName: window.auth.currentUser.displayName || 'Test User',
    customerEmail: window.auth.currentUser.email,
    customerPhone: '+91 98765 43210',
    timeline: [{
      id: '1',
      phase: 'browsing_vendors',
      timestamp: new Date().toISOString(),
      description: 'Application created - browsing vendors',
      updatedBy: 'customer',
      metadata: {}
    }],
    paymentStatus: 'pending',
    paymentAmount: 0,
    paymentMethod: '',
    vendorNotes: '',
    customerNotes: '',
    additionalRequirements: 'Need vegetarian options',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('📝 Creating application...');
  
  window.addDoc(window.collection(window.db, 'applications'), application)
    .then(docRef => {
      console.log('✅ Application created successfully!');
      console.log('🆔 Application ID:', docRef.id);
      console.log('🎯 The floating tracker should now appear');
      console.log('🔄 Refresh the page to see the tracker');
    })
    .catch(error => {
      console.error('❌ Error creating application:', error);
    });
} else {
  console.log('❌ No user logged in');
  console.log('💡 Please log in first, then run this script again');
}








