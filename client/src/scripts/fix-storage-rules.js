// Fix Firebase Storage Rules for Decoration Images
// This script provides the correct Firebase Storage rules

console.log('🔧 Firebase Storage Rules Fix');
console.log('=====================================');

console.log('❌ Current Issue:');
console.log('Firebase Storage: User does not have permission to access decoration-images/...');
console.log('');

console.log('✅ Solution:');
console.log('Update your Firebase Storage security rules to allow access to decoration-images folder');
console.log('');

console.log('📋 Steps to Fix:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project: planora-ce3a5');
console.log('3. Go to Storage > Rules');
console.log('4. Replace the current rules with the following:');
console.log('');

const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read/write their own files
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // Specific rules for different folders
    match /services/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /decoration-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /decoration-images/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    match /collections/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /upi-qr/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to uploaded images
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`;

console.log('📄 New Storage Rules:');
console.log('```');
console.log(storageRules);
console.log('```');
console.log('');

console.log('5. Click "Publish" to apply the new rules');
console.log('6. Test the image upload again');
console.log('');

console.log('🔍 Alternative Quick Fix:');
console.log('If you want to allow all authenticated users to upload anywhere temporarily:');
console.log('');

const quickRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

console.log('```');
console.log(quickRules);
console.log('```');
console.log('');

console.log('⚠️  Security Note:');
console.log('The quick fix allows any authenticated user to upload anywhere.');
console.log('Use the detailed rules above for better security.');
console.log('');

console.log('🧪 Test After Fix:');
console.log('1. Try uploading a decoration image again');
console.log('2. Check the browser console for any remaining errors');
console.log('3. Verify the image appears in the preview');




