// Browser Console Script for Setting up Applications Collection
// Copy and paste this code into your browser console while on your Planora app

// Make sure Firebase is available (it should be since your app uses it)
if (typeof firebase === 'undefined') {
  console.error('Firebase is not available. Make sure you are on the Planora app page.');
} else {
  console.log('🚀 Starting applications collection setup...');

  // Firebase configuration (using the same config as your app)
  const firebaseConfig = {
    apiKey: "AIzaSyBBHdkoD3yYCe9gLCs8zV9_QpL7f0P34ag",
    authDomain: "planora-ce3a5.firebaseapp.com",
    projectId: "planora-ce3a5",
    storageBucket: "planora-ce3a5.appspot.com",
    messagingSenderId: "681139972771",
    appId: "1:681139972771:web:5e17d10a3549c1abe52d16",
    measurementId: "G-HTHPBGY2GQ"
  };

  // Initialize Firebase (if not already initialized)
  const app = firebase.initializeApp(firebaseConfig, 'setupApp');
  const db = firebase.firestore(app);

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
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Function to create applications
  async function createApplications() {
    try {
      console.log('📝 Creating sample applications...');

      // Create first application
      const docRef1 = await db.collection('applications').add(sampleApplication1);
      console.log('✅ Sample application 1 created with ID:', docRef1.id);

      // Create second application
      const docRef2 = await db.collection('applications').add(sampleApplication2);
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
      console.error('❌ Error creating applications:', error);
    }
  }

  // Run the setup
  createApplications();
}








