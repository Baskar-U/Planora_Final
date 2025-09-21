# 📊 Vendor Registration Database Structure

## 🗄️ Firestore Collections

### 1. **vendors** Collection
Main collection for storing vendor information.

```typescript
interface VendorDocument {
  // Basic Details
  vendorName: string;                    // "Delight Caterers"
  contactPersonName: string;            // "John Doe"
  phoneNumber: string;                  // "+91 9876543210"
  email: string;                        // "contact@delightcaterers.com"
  businessAddress: string;              // "123 Main St, Chennai, TN 600001"
  businessCategory: string;             // "Catering"
  yearsOfExperience: number;            // 5
  gstNumber: string;                    // "22ABCDE1234F1Z5"
  website: string;                      // "https://www.delightcaterers.com"
  instagram: string;                    // "@delightcaterers"
  portfolio: string;                    // "https://portfolio.delightcaterers.com"
  logo: string;                         // Firebase Storage URL
  samplePhotos: string[];               // Array of Firebase Storage URLs
  
  // Packages (Embedded)
  packages: PackageData[];
  
  // Additional Settings
  availabilityCalendar: string;         // "Available Mon-Fri, 9 AM - 6 PM"
  paymentMethods: string[];            // ["UPI", "Cash", "Bank Transfer"]
  termsAccepted: boolean;              // true
  approvalStatus: 'pending' | 'approved' | 'rejected';
  
  // System Fields
  userId: string;                       // Firebase Auth UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. **packages** Collection (Optional - for complex queries)
If you need to query packages separately or have complex package management.

```typescript
interface PackageDocument {
  // Package Details
  name: string;                         // "Non-Veg Silver Package"
  description: string;                  // "Premium non-vegetarian package"
  basePrice: number;                    // 500
  discount: number;                     // 10
  finalPrice: number;                   // 450 (auto-calculated)
  inclusions: string[];                 // ["Chicken biryani", "Mutton curry", "Dessert"]
  capacity: string;                     // "200 people"
  addOnServices: string[];              // ["Extra lighting", "Drone shoot"]
  images: string[];                     // Array of Firebase Storage URLs
  isActive: boolean;                    // true
  
  // Vendor Reference
  vendorId: string;                     // Reference to vendors collection
  vendorName: string;                   // Denormalized for easy queries
  
  // System Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. **vendorServices** Collection (Existing)
For individual services (if different from packages).

```typescript
interface VendorServiceDocument {
  // Service Details
  name: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  location: string;
  isActive: boolean;
  
  // Images
  coverImage?: string;
  collections?: string[];
  
  // Packages (if using embedded approach)
  packages?: PackageData[];
  
  // Vendor Reference
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  
  // System Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔥 Firebase Storage Structure

```
vendors/
  {userId}/
    logo/
      {timestamp}_{filename}
    samples/
      {timestamp}_{filename}
    services/
      {serviceId}/
        cover/
          {timestamp}_{filename}
        collections/
          {timestamp}_{filename}
        packages/
          {packageId}/
            {timestamp}_{filename}
```

## 📋 Indexes Required

### Firestore Indexes
1. **vendors collection:**
   - `businessCategory` (Ascending)
   - `approvalStatus` (Ascending)
   - `createdAt` (Descending)

2. **packages collection (if separate):**
   - `vendorId` (Ascending)
   - `isActive` (Ascending)
   - `finalPrice` (Ascending)

3. **vendorServices collection:**
   - `vendorId` (Ascending)
   - `category` (Ascending)
   - `isActive` (Ascending)

## 🔍 Query Examples

### Get all approved vendors by category
```typescript
const vendorsRef = collection(db, "vendors");
const q = query(
  vendorsRef,
  where("businessCategory", "==", "Catering"),
  where("approvalStatus", "==", "approved")
);
```

### Get vendor with packages
```typescript
const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
const vendorData = vendorDoc.data();
// Packages are embedded in vendorData.packages
```

### Search vendors by location and category
```typescript
const vendorsRef = collection(db, "vendors");
const q = query(
  vendorsRef,
  where("businessAddress", ">=", "Chennai"),
  where("businessAddress", "<=", "Chennai\uf8ff"),
  where("businessCategory", "==", "Photography")
);
```

## 🚀 Implementation Notes

1. **Embedded vs Separate Collections:**
   - **Embedded**: Packages stored within vendor document (simpler, good for small-medium data)
   - **Separate**: Packages in separate collection (better for complex queries, large datasets)

2. **Image Storage:**
   - Use Firebase Storage with organized folder structure
   - Implement proper security rules
   - Consider image optimization and compression

3. **Search Functionality:**
   - Use Algolia or Elasticsearch for complex search
   - Or implement basic search with Firestore's limited text search

4. **Real-time Updates:**
   - Use Firestore listeners for real-time vendor status updates
   - Implement proper caching strategies

5. **Security Rules:**
   - Vendors can only read/write their own data
   - Public read access for approved vendors
   - Admin-only access for approval status changes

## 📱 Frontend Integration

The comprehensive form integrates with this structure by:
- Uploading images to the correct Storage paths
- Creating vendor documents with embedded packages
- Handling form validation and submission
- Providing real-time feedback during uploads
- Managing complex form state with multiple sections





