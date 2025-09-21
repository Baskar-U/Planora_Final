// Debug script to check customer bookings in Firestore
// Run this in the browser console on the customer profile page

import { collection, query, getDocs, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase.js";

async function debugCustomerBookings() {
  console.log('🔍 Debug: Checking all bookings in the database...');
  
  try {
    // Get all bookings
    const bookingsRef = collection(db, "bookings");
    const snapshot = await getDocs(bookingsRef);
    const allBookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Total bookings in database:', allBookings.length);
    console.log('📋 All bookings:', allBookings);
    
    // Check what customer identifiers are used
    const customerIds = new Set();
    const customerEmails = new Set();
    
    allBookings.forEach(booking => {
      if (booking.customerId) customerIds.add(booking.customerId);
      if (booking.customerEmail) customerEmails.add(booking.customerEmail);
    });
    
    console.log('👥 Unique customer IDs found:', Array.from(customerIds));
    console.log('📧 Unique customer emails found:', Array.from(customerEmails));
    
    // Check current user's auth info
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('🔐 Current user UID:', currentUser.uid);
      console.log('📧 Current user email:', currentUser.email);
      
      // Look for bookings with current user's UID
      const bookingsByUid = allBookings.filter(b => b.customerId === currentUser.uid);
      console.log('📊 Bookings with current user UID:', bookingsByUid.length);
      
      // Look for bookings with current user's email
      const bookingsByEmail = allBookings.filter(b => b.customerEmail === currentUser.email);
      console.log('📊 Bookings with current user email:', bookingsByEmail.length);
      
      // Show sample booking structure
      if (allBookings.length > 0) {
        console.log('📋 Sample booking structure:', allBookings[0]);
      }
    } else {
      console.log('❌ No current user found');
    }
    
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
  }
}

// Run the debug function
debugCustomerBookings();
