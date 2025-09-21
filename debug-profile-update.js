// Debug Profile Update Issues
// Run this in the browser console to check and fix profile update problems

console.log('🔍 Debugging Profile Update Issues...');

// Check if Firebase functions are available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase functions not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase functions available');
  
  // Debug functions
  window.debugProfileUpdate = {
    // Check current user
    checkCurrentUser: async () => {
      try {
        const user = window.auth.currentUser;
        console.log('👤 Current user:', user);
        return user;
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    },

    // Check user profile in users collection
    checkUserProfile: async (userId) => {
      try {
        const userDoc = await window.getDoc(window.doc(window.db, "users", userId));
        if (userDoc.exists()) {
          console.log('📄 User profile found:', userDoc.data());
          return userDoc.data();
        } else {
          console.log('❌ User profile not found in users collection');
          return null;
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    },

    // Check vendor profile in vendors collection
    checkVendorProfile: async (userId) => {
      try {
        const vendorsRef = window.collection(window.db, "vendors");
        const q = window.query(vendorsRef, window.where("vendorid", "==", userId));
        const snapshot = await window.getDocs(q);
        
        if (!snapshot.empty) {
          console.log('🏪 Vendor profile found:', snapshot.docs[0].data());
          return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        } else {
          console.log('❌ Vendor profile not found in vendors collection');
          return null;
        }
      } catch (error) {
        console.error('Error checking vendor profile:', error);
      }
    },

    // Create user profile if missing
    createUserProfile: async (userId, userData) => {
      try {
        const userRef = window.doc(window.db, "users", userId);
        await window.setDoc(userRef, {
          name: userData.displayName || '',
          email: userData.email || '',
          phone: '',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ User profile created successfully');
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    },

    // Update user profile
    updateUserProfile: async (userId, updates) => {
      try {
        const userRef = window.doc(window.db, "users", userId);
        await window.updateDoc(userRef, {
          ...updates,
          updatedAt: new Date()
        });
        console.log('✅ User profile updated successfully');
      } catch (error) {
        console.error('Error updating user profile:', error);
      }
    },

    // Update vendor profile
    updateVendorProfile: async (vendorId, updates) => {
      try {
        const vendorRef = window.doc(window.db, "vendors", vendorId);
        await window.updateDoc(vendorRef, {
          ...updates,
          updatedAt: new Date()
        });
        console.log('✅ Vendor profile updated successfully');
      } catch (error) {
        console.error('Error updating vendor profile:', error);
      }
    },

    // Full profile check and fix
    checkAndFixProfile: async () => {
      console.log('🔍 Starting full profile check...');
      
      const user = await window.debugProfileUpdate.checkCurrentUser();
      if (!user) {
        console.error('❌ No user logged in');
        return;
      }

      console.log('📋 User ID:', user.uid);
      
      // Check user profile
      const userProfile = await window.debugProfileUpdate.checkUserProfile(user.uid);
      
      // Check vendor profile
      const vendorProfile = await window.debugProfileUpdate.checkVendorProfile(user.uid);
      
      console.log('📊 Profile Summary:');
      console.log('- User Profile exists:', !!userProfile);
      console.log('- Vendor Profile exists:', !!vendorProfile);
      
      return { user, userProfile, vendorProfile };
    },

    // Manual profile update
    manualUpdate: async (updates) => {
      const user = window.auth.currentUser;
      if (!user) {
        console.error('❌ No user logged in');
        return;
      }

      console.log('🔄 Starting manual profile update...');
      
      // Update user profile
      await window.debugProfileUpdate.updateUserProfile(user.uid, updates);
      
      // Check if vendor profile exists and update it too
      const vendorProfile = await window.debugProfileUpdate.checkVendorProfile(user.uid);
      if (vendorProfile) {
        await window.debugProfileUpdate.updateVendorProfile(vendorProfile.id, updates);
      }
      
      console.log('✅ Manual update completed');
    }
  };

  console.log('🚀 Debug functions available:');
  console.log('- window.debugProfileUpdate.checkCurrentUser()');
  console.log('- window.debugProfileUpdate.checkUserProfile(userId)');
  console.log('- window.debugProfileUpdate.checkVendorProfile(userId)');
  console.log('- window.debugProfileUpdate.createUserProfile(userId, userData)');
  console.log('- window.debugProfileUpdate.updateUserProfile(userId, updates)');
  console.log('- window.debugProfileUpdate.updateVendorProfile(vendorId, updates)');
  console.log('- window.debugProfileUpdate.checkAndFixProfile()');
  console.log('- window.debugProfileUpdate.manualUpdate(updates)');
  
  console.log('');
  console.log('💡 Quick fix: Run window.debugProfileUpdate.checkAndFixProfile() to see what\'s wrong');
  console.log('💡 Manual update: Run window.debugProfileUpdate.manualUpdate({name: "New Name", email: "new@email.com"})');
}

// Auto-run the check
setTimeout(async () => {
  if (window.debugProfileUpdate) {
    await window.debugProfileUpdate.checkAndFixProfile();
  }
}, 1000);
