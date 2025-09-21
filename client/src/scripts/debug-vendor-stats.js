// Debug script to check vendor stats in Firestore
// Run this in the browser console on the vendor profile page

import { collection, query, getDocs, where } from "firebase/firestore";
import { db, auth } from "../lib/firebase.js";

async function debugVendorStats() {
  console.log('🔍 Debug: Checking vendor stats...');
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user logged in');
      return;
    }

    const vendorId = currentUser.uid;
    console.log('🔐 Current vendor UID:', vendorId);

    // Get all bookings for this vendor
    console.log('📊 Fetching bookings for vendor...');
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("vendorId", "==", vendorId));
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📋 Total bookings found:', bookings.length);
    console.log('📋 All bookings:', bookings);

    // Calculate stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const totalRevenue = bookings.reduce((total, booking) => {
      return total + (booking.paidAmount || 0);
    }, 0);

    const totalAmount = bookings.reduce((total, booking) => {
      return total + (booking.totalAmount || 0);
    }, 0);

    const remainingAmount = bookings.reduce((total, booking) => {
      return total + (booking.remainingAmount || 0);
    }, 0);

    const uniqueCustomers = new Set(bookings.map(b => b.customerId || b.customerEmail).filter(Boolean));
    const customerCount = uniqueCustomers.size;

    console.log('📊 Calculated Stats:');
    console.log('  Total Bookings:', totalBookings);
    console.log('  Confirmed:', confirmedBookings);
    console.log('  Pending:', pendingBookings);
    console.log('  Completed:', completedBookings);
    console.log('  Cancelled:', cancelledBookings);
    console.log('  Total Revenue (Earned):', totalRevenue);
    console.log('  Total Amount:', totalAmount);
    console.log('  Remaining Amount:', remainingAmount);
    console.log('  Unique Customers:', customerCount);

    // Show sample booking details
    if (bookings.length > 0) {
      console.log('📋 Sample booking details:');
      const sampleBooking = bookings[0];
      console.log('  Customer Name:', sampleBooking.customerName);
      console.log('  Customer Email:', sampleBooking.customerEmail);
      console.log('  Status:', sampleBooking.status);
      console.log('  Total Amount:', sampleBooking.totalAmount);
      console.log('  Paid Amount:', sampleBooking.paidAmount);
      console.log('  Remaining Amount:', sampleBooking.remainingAmount);
      console.log('  Event Date:', sampleBooking.eventDate);
      console.log('  Number of Guests:', sampleBooking.numberOfGuests);
      console.log('  Selected Packages:', sampleBooking.selectedPackages);
    }

  } catch (error) {
    console.error('❌ Error fetching vendor stats:', error);
  }
}

// Run the debug function
debugVendorStats();




