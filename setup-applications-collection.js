// Setup script for applications collection
// This script creates the applications collection structure in Firebase

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBHdkoD3yYCe9gLCs8zV9_QpL7f0P34ag",
  authDomain: "planora-ce3a5.firebaseapp.com",
  projectId: "planora-ce3a5",
  storageBucket: "planora-ce3a5.appspot.com",
  messagingSenderId: "681139972771",
  appId: "1:681139972771:web:5e17d10a3549c1abe52d16",
  measurementId: "G-HTHPBGY2GQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupApplicationsCollection() {
  try {
    console.log('🚀 Setting up applications collection...');

    // Create a sample application document to establish the collection
    const sampleApplication = {
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the sample document
    const docRef = await addDoc(collection(db, 'applications'), sampleApplication);
    console.log('✅ Sample application created with ID:', docRef.id);

    // Create a second sample application with different phase
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
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000)
    };

    const docRef2 = await addDoc(collection(db, 'applications'), sampleApplication2);
    console.log('✅ Second sample application created with ID:', docRef2.id);

    console.log('🎉 Applications collection setup completed successfully!');
    console.log('\n📋 Collection Structure:');
    console.log('- Collection: applications');
    console.log('- Required fields: userId, orderId, vendorId, vendorName, status, phase, eventType, eventDate, eventLocation, guestCount, budget, eventDescription, customerName, customerEmail, customerPhone, timeline, paymentStatus');
    console.log('- Optional fields: paymentAmount, paymentMethod, vendorNotes, customerNotes, additionalRequirements, createdAt, updatedAt');
    console.log('\n🔄 Phases: browsing_vendors → order_initiated → order_confirmed → payment_done → order_completed');
    console.log('\n📊 Statuses: browsing_vendors, order_initiated, order_confirmed, payment_done, order_completed, cancelled, refunded');

  } catch (error) {
    console.error('❌ Error setting up applications collection:', error);
  }
}

// Run the setup
setupApplicationsCollection();
