// Browser Console Script for Creating Applications Collection
// Copy and paste this code into your browser console while on your Planora app

// Wait for the app to load and Firebase functions to be available
setTimeout(async () => {
  try {
    console.log('🚀 Starting applications collection setup...');
    console.log('📋 Using Firebase functions from your main.tsx...');

    // Check if Firebase functions are available
    if (typeof window.db === 'undefined' || typeof window.addDoc === 'undefined') {
      console.log('❌ Firebase functions not available yet. Please wait a moment and try again.');
      return;
    }

    console.log('✅ Firebase functions detected!');

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
      createdAt: new Date(),
      updatedAt: new Date()
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
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 3600000)
    };

    const sampleApplication3 = {
      userId: 'demo-user-789',
      orderId: 'ORD-DEMO-003',
      vendorId: 'demo-vendor-3',
      vendorName: 'Royal Decorators',
      status: 'payment_done',
      phase: 'payment_done',
      eventType: 'Birthday Party',
      eventDate: '2024-08-10',
      eventLocation: 'Bangalore, Karnataka',
      guestCount: 50,
      budget: 25000,
      eventDescription: 'Elegant birthday celebration with theme decoration',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+91 98765 67890',
      timeline: [
        {
          id: '1',
          phase: 'browsing_vendors',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          description: 'Application created - browsing vendors',
          updatedBy: 'customer',
          metadata: {}
        },
        {
          id: '2',
          phase: 'order_initiated',
          timestamp: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
          description: 'Order initiated and sent to vendors',
          updatedBy: 'customer',
          metadata: {}
        },
        {
          id: '3',
          phase: 'order_confirmed',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: 'Vendor confirmed the order',
          updatedBy: 'vendor',
          metadata: {
            vendorId: 'demo-vendor-3',
            vendorName: 'Royal Decorators'
          }
        },
        {
          id: '4',
          phase: 'payment_done',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          description: 'Payment completed successfully',
          updatedBy: 'customer',
          metadata: {
            amount: 25000,
            paymentMethod: 'UPI'
          }
        }
      ],
      paymentStatus: 'paid',
      paymentAmount: 25000,
      paymentMethod: 'UPI',
      vendorNotes: 'Theme: Elegant Gold and White',
      customerNotes: 'Please arrive 2 hours before the event',
      additionalRequirements: 'Need photo booth setup',
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 7200000)
    };

    console.log('📝 Creating sample applications...');

    // Create first application
    const docRef1 = await window.addDoc(window.collection(window.db, 'applications'), sampleApplication1);
    console.log('✅ Sample application 1 created with ID:', docRef1.id);

    // Create second application
    const docRef2 = await window.addDoc(window.collection(window.db, 'applications'), sampleApplication2);
    console.log('✅ Sample application 2 created with ID:', docRef2.id);

    // Create third application
    const docRef3 = await window.addDoc(window.collection(window.db, 'applications'), sampleApplication3);
    console.log('✅ Sample application 3 created with ID:', docRef3.id);

    console.log('🎉 Applications collection setup completed successfully!');
    console.log('\n📋 Collection Structure Created:');
    console.log('- Collection: applications');
    console.log('- Required fields: userId, orderId, vendorId, vendorName, status, phase, eventType, eventDate, eventLocation, guestCount, budget, eventDescription, customerName, customerEmail, customerPhone, timeline, paymentStatus');
    console.log('- Optional fields: paymentAmount, paymentMethod, vendorNotes, customerNotes, additionalRequirements, createdAt, updatedAt');
    console.log('\n🔄 Phases: browsing_vendors → order_initiated → order_confirmed → payment_done → order_completed');
    console.log('\n📊 Statuses: browsing_vendors, order_initiated, order_confirmed, payment_done, order_completed, cancelled, refunded');
    console.log('\n🎯 You can now test the order tracking UI by visiting /order-tracking-demo');
    console.log('\n💡 The floating order tracker will appear on all screens for customers with active orders');

  } catch (error) {
    console.error('❌ Error setting up applications collection:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you are on the Planora app page');
    console.log('2. Wait for the app to fully load before running this script');
    console.log('3. Check if Firebase functions are available: console.log(window.db)');
    console.log('4. Try refreshing the page and running the script again');
  }
}, 2000); // Wait 2 seconds for app to load




