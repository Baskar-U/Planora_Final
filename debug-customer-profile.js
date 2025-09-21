// Debug Customer Profile Update Issues
// Run this in the browser console to check and fix customer profile update problems

console.log('🔍 Debugging Customer Profile Update Issues...');

// Check if Firebase functions are available
if (typeof window.db === 'undefined') {
  console.error('❌ Firebase functions not available. Please refresh the page and try again.');
} else {
  console.log('✅ Firebase functions available');
  
  // Debug functions
  window.debugCustomerProfile = {
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

    // Full profile check and fix
    checkAndFixProfile: async () => {
      console.log('🔍 Starting customer profile check...');
      
      const user = await window.debugCustomerProfile.checkCurrentUser();
      if (!user) {
        console.error('❌ No user logged in');
        return;
      }

      console.log('📋 User ID:', user.uid);
      
      // Check user profile
      const userProfile = await window.debugCustomerProfile.checkUserProfile(user.uid);
      
      console.log('📊 Profile Summary:');
      console.log('- User Profile exists:', !!userProfile);
      
      return { user, userProfile };
    },

    // Manual profile update
    manualUpdate: async (updates) => {
      const user = window.auth.currentUser;
      if (!user) {
        console.error('❌ No user logged in');
        return;
      }

      console.log('🔄 Starting manual customer profile update...');
      
      // Update user profile
      await window.debugCustomerProfile.updateUserProfile(user.uid, updates);
      
      console.log('✅ Manual update completed');
    },

    // Complete customer profile setup
    setupCustomerProfile: async () => {
      const user = window.auth.currentUser;
      if (!user) {
        console.error('❌ No user logged in');
        return;
      }

      console.log('🚀 Setting up complete customer profile...');
      
      // Create user profile
      await window.debugCustomerProfile.createUserProfile(user.uid, {
        displayName: user.displayName || 'Customer',
        email: user.email || ''
      });
      
      console.log('✅ Customer profile setup completed');
    }
  };

  console.log('🚀 Debug functions available:');
  console.log('- window.debugCustomerProfile.checkCurrentUser()');
  console.log('- window.debugCustomerProfile.checkUserProfile(userId)');
  console.log('- window.debugCustomerProfile.createUserProfile(userId, userData)');
  console.log('- window.debugCustomerProfile.updateUserProfile(userId, updates)');
  console.log('- window.debugCustomerProfile.checkAndFixProfile()');
  console.log('- window.debugCustomerProfile.manualUpdate(updates)');
  console.log('- window.debugCustomerProfile.setupCustomerProfile()');
  
  console.log('');
  console.log('💡 Quick fix: Run window.debugCustomerProfile.checkAndFixProfile() to see what\'s wrong');
  console.log('💡 Manual update: Run window.debugCustomerProfile.manualUpdate({name: "New Name", email: "new@email.com"})');
  console.log('💡 Complete setup: Run window.debugCustomerProfile.setupCustomerProfile()');
}

// Auto-run the check
setTimeout(async () => {
  if (window.debugCustomerProfile) {
    await window.debugCustomerProfile.checkAndFixProfile();
  }
}, 1000);
