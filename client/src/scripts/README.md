# 🗄️ Vendor Registration Collection Setup

This directory contains scripts to automatically create the "vendorregistration" collection in Firestore with sample data.

## 📋 Quick Start

### Option 1: Browser Console (Recommended)

1. **Open your app** in the browser and make sure you're logged in
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Copy and paste** the following code:

```javascript
// ========================================
// COPY-PASTE THIS INTO BROWSER CONSOLE
// ========================================

console.log('🚀 Creating Vendor Registration Collection...');

const sampleData = [
  {
    vendorName: "Delight Caterers",
    contactPersonName: "Rajesh Kumar", 
    phoneNumber: "+91 9876543210",
    email: "rajesh@delightcaterers.com",
    businessAddress: "123 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017",
    businessCategory: "Catering",
    yearsOfExperience: 8,
    gstNumber: "33ABCDE1234F1Z5",
    website: "https://www.delightcaterers.com",
    instagram: "@delightcaterers",
    portfolio: "https://portfolio.delightcaterers.com",
    logo: "https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=DC",
    samplePhotos: [
      "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Sample1",
      "https://via.placeholder.com/400x300/10B981/FFFFFF?text=Sample2"
    ],
    packages: [
      {
        id: "pkg_001",
        name: "Non-Veg Silver Package",
        description: "Premium non-vegetarian package",
        basePrice: 500,
        discount: 10,
        finalPrice: 450,
        inclusions: ["Chicken Biryani", "Mutton Curry", "Dessert"],
        capacity: "200 people",
        addOnServices: ["Extra Lighting", "Live Cooking"],
        images: ["https://via.placeholder.com/300x200/EF4444/FFFFFF?text=NonVeg"],
        isActive: true
      },
      {
        id: "pkg_002",
        name: "Veg Classic Package", 
        description: "Traditional vegetarian package",
        basePrice: 350,
        discount: 0,
        finalPrice: 350,
        inclusions: ["Paneer Butter Masala", "Veg Pulao", "Sweet"],
        capacity: "150 people",
        addOnServices: ["Extra Desserts"],
        images: ["https://via.placeholder.com/300x200/22C55E/FFFFFF?text=Veg"],
        isActive: true
      }
    ],
    availabilityCalendar: "Available Monday to Saturday, 9 AM to 8 PM",
    paymentMethods: ["UPI", "Cash", "Bank Transfer"],
    termsAccepted: true,
    approvalStatus: "approved",
    userId: "sample_user_001",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    vendorName: "Royal Photography Studio",
    contactPersonName: "Priya Sharma",
    phoneNumber: "+91 8765432109", 
    email: "priya@royalphotography.com",
    businessAddress: "456 MG Road, Bangalore, Karnataka 560001",
    businessCategory: "Photography",
    yearsOfExperience: 12,
    gstNumber: "29ABCDE1234F1Z5",
    website: "https://www.royalphotography.com",
    instagram: "@royalphotography",
    portfolio: "https://portfolio.royalphotography.com",
    logo: "https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=RP",
    samplePhotos: [
      "https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Photo1",
      "https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Photo2"
    ],
    packages: [
      {
        id: "pkg_003",
        name: "Basic Photography Package",
        description: "Essential photography coverage",
        basePrice: 15000,
        discount: 15,
        finalPrice: 12750,
        inclusions: ["4 hours coverage", "200 edited photos", "Online gallery"],
        capacity: "1 photographer, 4 hours",
        addOnServices: ["Drone Photography", "Video Coverage"],
        images: ["https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Photo"],
        isActive: true
      }
    ],
    availabilityCalendar: "Available 7 days a week",
    paymentMethods: ["UPI", "Bank Transfer"],
    termsAccepted: true,
    approvalStatus: "approved",
    userId: "sample_user_002",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function createVendorRegistrationCollection() {
  try {
    const db = window.firebase.firestore();
    const collectionRef = db.collection('vendorregistration');
    
    console.log('📝 Creating vendor registration documents...');
    
    for (let i = 0; i < sampleData.length; i++) {
      const vendorData = sampleData[i];
      try {
        const docRef = await collectionRef.add(vendorData);
        console.log(`✅ Created: ${vendorData.vendorName} (ID: ${docRef.id})`);
      } catch (error) {
        console.error(`❌ Failed: ${vendorData.vendorName}`, error);
      }
    }
    
    console.log('🎉 Collection "vendorregistration" created successfully!');
    
    const snapshot = await collectionRef.get();
    console.log(`📊 Total documents: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createVendorRegistrationCollection();
```

5. **Press Enter** to execute
6. **Check the console** for success messages

### Option 2: Using the Full Script

1. **Open** `createVendorRegistrationCollection.js` in your browser
2. **Copy the entire content**
3. **Paste into browser console**
4. **Run** `setupVendorRegistrationCollection()`

## 📊 What Gets Created

The script creates a "vendorregistration" collection with:

### Sample Vendors:
1. **Delight Caterers** (Catering)
   - Non-Veg Silver Package: ₹500 → ₹450 (10% discount)
   - Veg Classic Package: ₹350 (no discount)

2. **Royal Photography Studio** (Photography)
   - Basic Photography Package: ₹15,000 → ₹12,750 (15% discount)

### Document Structure:
```typescript
{
  // Basic Details
  vendorName: string;
  contactPersonName: string;
  phoneNumber: string;
  email: string;
  businessAddress: string;
  businessCategory: string;
  yearsOfExperience: number;
  gstNumber: string;
  website: string;
  instagram: string;
  portfolio: string;
  logo: string;
  samplePhotos: string[];
  
  // Packages (Array)
  packages: [
    {
      id: string;
      name: string;
      description: string;
      basePrice: number;
      discount: number;
      finalPrice: number;
      inclusions: string[];
      capacity: string;
      addOnServices: string[];
      images: string[];
      isActive: boolean;
    }
  ];
  
  // Additional Settings
  availabilityCalendar: string;
  paymentMethods: string[];
  termsAccepted: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  
  // System Fields
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔧 Available Functions

After running the script, these functions are available in console:

- `setupVendorRegistrationCollection()` - Complete setup
- `createVendorRegistrationCollection()` - Create sample data only
- `verifyVendorRegistrationCollection()` - Check collection status
- `clearVendorRegistrationCollection()` - Clear all data

## 🧪 Testing Your Form

After creating the collection:

1. **Navigate to** `/comprehensive-vendor-registration`
2. **Fill out the form** with test data
3. **Submit** to create a new vendor registration
4. **Check Firestore** to see the new document
5. **Verify** all fields are saved correctly

## 🗑️ Cleanup

To remove all test data:

```javascript
clearVendorRegistrationCollection();
```

## 📝 Notes

- **Placeholder Images**: Uses placeholder.com for sample images
- **Real URLs**: Replace with actual Firebase Storage URLs in production
- **Authentication**: Make sure you're logged in before running
- **Permissions**: Ensure your Firestore rules allow writes

## 🚨 Troubleshooting

### "Firebase is not available"
- Make sure you're running this in your app's browser tab
- Check that Firebase is properly initialized

### "Permission denied"
- Check your Firestore security rules
- Ensure you're authenticated

### "Collection not found"
- Run the script again
- Check Firestore console manually

## 🎯 Next Steps

1. **Test the form** with the sample data
2. **Customize** the sample data for your needs
3. **Update** your form to read from this collection
4. **Implement** proper image upload to Firebase Storage
5. **Add** admin approval workflow





