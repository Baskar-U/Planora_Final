// Debug script to check pending payments in Firestore
// Run this in the browser console on the vendor dashboard

import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase.js";

async function debugPendingPayments() {
  console.log('🔍 Debug: Checking pending payments...');
  
  try {
    // Get all pending payments
    const q = query(
      collection(db, 'pendingPayments'),
      where('status', '==', 'pending_review')
    );
    
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Found pending payments:', payments.length);
    console.log('📋 All pending payments:', payments);
    
    // Check each payment's associated order
    for (const payment of payments) {
      try {
        const orderRef = doc(db, 'bookings', payment.orderId);
        const orderDoc = await getDoc(orderRef);
        const orderData = orderDoc.data();
        
        console.log(`🔍 Payment ${payment.id}:`);
        console.log('  - Order ID:', payment.orderId);
        console.log('  - Order exists:', !!orderData);
        console.log('  - Order vendorId:', orderData?.vendorId);
        console.log('  - Payment amount:', payment.amount);
        console.log('  - Payment customer:', payment.customerName);
        console.log('  - Payment submitted at:', payment.submittedAt?.toDate?.());
        console.log('---');
      } catch (error) {
        console.error('❌ Error checking order for payment', payment.id, ':', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching pending payments:', error);
  }
}

// Run the debug function
debugPendingPayments();




