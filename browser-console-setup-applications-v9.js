// Browser Console Script for Setting up Applications Collection (Firebase v9+)
// Copy and paste this code into your browser console while on your Planora app

// Wait for the app to load and get the Firebase instance
async function setupApplicationsCollection() {
  try {
    console.log('🚀 Starting applications collection setup...');

    // Get the Firebase app instance from your app
    const { getApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Use the existing app instance from your app
    const app = getApp();
    const db = getFirestore(app);

    console.log('✅ Firebase connected successfully');

    // Sample application data
    const sampleApplication1 = {
      userId: 'demo-user-123',
      orderId: 'ORD-DEMO-001',
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
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+91 98765 43210',
      timeline: [
        {
          id: '1',
          phase: 'browsing_vendors',
          timestamp: new Date().toISOString(),
          description: 'Application created - browsing vendors',
          updatedBy: 'customer',
          metadata: {}
        }
      ],
      paymentStatus: 'pending',
      paymentAmount: 0,
      paymentMethod: '',
      vendorNotes: '',
      customerNotes: '',
      additionalRequirements: 'Need vegetarian options',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const sampleApplication2 = {
      userId: 'demo-user-456',
      orderId: 'ORD-DEMO-002',
      vendorId: 'demo-vendor-2',
      vendorName: 'Elite Event Planners',
      status: 'order_confirmed',
      phase: 'order_confirmed',
      eventType: 'Corporate Event',
      eventDate: '2024-07-20',
      eventLocation: 'Delhi, India',
      guestCount: 200,
      budget: 100000,
      eventDescription: 'Annual corporate conference and networking event',
      customerName: 'Jane Smith',
      customerEmail: 'jane@company.com',
      customerPhone: '+91 98765 12345',
      timeline: [
        {
          id: '1',
          phase: 'browsing_vendors',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: 'Application created - browsing vendors',
          updatedBy: 'customer',
          metadata: {}
        },
        {
          id: '2',
          phase: 'order_initiated',
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          description: 'Order initiated and sent to vendors',
          updatedBy: 'customer',
          metadata: {}
        },
        {
          id: '3',
          phase: 'order_confirmed',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          description: 'Vendor confirmed the order',
          updatedBy: 'vendor',
          metadata: {
            vendorId: 'demo-vendor-2',
            vendorName: 'Elite Event Planners'
          }
        }
      ],
      paymentStatus: 'pending',
      paymentAmount: 100000,
      paymentMethod: '',
      vendorNotes: 'Looking forward to working on this event',
      customerNotes: 'Please ensure all AV equipment is tested beforehand',
      additionalRequirements: 'Need parking for 50+ cars',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('📝 Creating sample applications...');

    // Create first application
    const docRef1 = await addDoc(collection(db, 'applications'), sampleApplication1);
    console.log('✅ Sample application 1 created with ID:', docRef1.id);

    // Create second application
    const docRef2 = await addDoc(collection(db, 'applications'), sampleApplication2);
    console.log('✅ Sample application 2 created with ID:', docRef2.id);

    console.log('🎉 Applications collection setup completed successfully!');
    console.log('\n📋 Collection Structure Created:');
    console.log('- Collection: applications');
    console.log('- Required fields: userId, orderId, vendorId, vendorName, status, phase, eventType, eventDate, eventLocation, guestCount, budget, eventDescription, customerName, customerEmail, customerPhone, timeline, paymentStatus');
    console.log('- Optional fields: paymentAmount, paymentMethod, vendorNotes, customerNotes, additionalRequirements, createdAt, updatedAt');
    console.log('\n🔄 Phases: browsing_vendors → order_initiated → order_confirmed → payment_done → order_completed');
    console.log('\n📊 Statuses: browsing_vendors, order_initiated, order_confirmed, payment_done, order_completed, cancelled, refunded');
    console.log('\n🎯 You can now test the order tracking UI by visiting /order-tracking-demo');

  } catch (error) {
    console.error('❌ Error setting up applications collection:', error);
    console.log('\n🔧 Alternative method - try this simpler approach:');
    console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
    console.log('2. Select your project: planora-ce3a5');
    console.log('3. Go to Firestore Database');
    console.log('4. Click "Start collection"');
    console.log('5. Collection ID: applications');
    console.log('6. Add the sample documents manually');
  }
}

// Run the setup
setupApplicationsCollection();








