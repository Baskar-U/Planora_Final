# Package System for Planora Vendors

## Overview
This system allows vendors to manage packages for their services across different categories (Catering, Decoration, Photography, DJ, Cakes, Travel). Each vendor can have 2-3 unique packages with detailed pricing and features.

## Categories and Package Types

### 1. Catering Packages
- **Basic Package**: Small gatherings (50 people)
- **Premium Package**: Medium events (100 people) 
- **Deluxe Package**: Large events (200 people)

**Features:**
- Meal-wise pricing (Breakfast, Lunch, Dinner)
- Capacity-based pricing
- Fresh ingredients and professional service

### 2. Decoration Packages
- **Basic Package**: Simple elegant decoration
- **Premium Package**: Custom themes with advanced lighting
- **Deluxe Package**: Complete venue transformation

**Features:**
- Fresh flowers and lighting
- Custom themes and backdrops
- Professional setup and cleanup

### 3. Photography Packages
- **Basic Package**: 4 hours coverage, 100+ photos
- **Premium Package**: 8 hours coverage, 300+ photos with drone shots
- **Deluxe Package**: 12 hours coverage, 500+ photos with multiple photographers

**Features:**
- Per event and per hour pricing
- Professional editing and online gallery
- Drone and ground shots

### 4. DJ Packages
- **Basic Package**: 4 hours service with quality sound
- **Premium Package**: 6 hours with advanced lighting and MC services
- **Deluxe Package**: 8 hours with premium equipment and live music

**Features:**
- Per event and per hour pricing
- Professional sound system and lighting
- Music requests and MC services

### 5. Cakes Packages
- **Basic Package**: 1kg cake with simple design
- **Premium Package**: 2kg custom designed cake
- **Deluxe Package**: Multi-tier luxury cake

**Features:**
- Various flavors and sizes
- Custom designs and artistic decoration
- Fresh ingredients and delivery

### 6. Travel Packages
- **Basic Package**: 1-day local destinations
- **Premium Package**: 2-day comprehensive tours
- **Deluxe Package**: 3-day luxury travel with accommodation

**Features:**
- Per person and group pricing
- Guided tours and professional drivers
- Multiple destinations with specialties

## Database Structure

### Postorder Collection Document Structure
```javascript
{
  // Vendor Information
  businessname: string,
  category: string, // Catering, Decoration, Photography, DJ, Cakes, Travel
  email: string,
  vendorId: string,
  
  // Packages Array
  packages: [
    {
      id: string,
      name: string,
      description: string,
      originalPrice: number,
      discountedPrice: number,
      discount: number,
      features: string[],
      isActive: boolean,
      category: string,
      
      // Category-specific fields
      capacity?: number, // For catering
      priceUnit?: string, // For non-catering
      mealDetails?: object, // For catering
      decorationDetails?: object, // For decoration
      photographyDetails?: object, // For photography
      djDetails?: object, // For DJ
      cakeDetails?: object, // For cakes
      travelDetails?: object // For travel
    }
  ]
}
```

## Running the Demo Packages Script

### Prerequisites
1. Node.js installed
2. Firebase project configured
3. Service account key (if running locally)

### Steps to Add Demo Packages

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

3. **Run the demo packages script:**
   ```bash
   node src/scripts/add-demo-packages.js
   ```

4. **Verify the results:**
   - Check the Firebase Console for updated documents
   - Verify that each vendor has 2-3 packages
   - Check that packages are category-appropriate

### Script Features
- **Smart Selection**: Randomly selects 2-3 packages per vendor
- **Unique IDs**: Generates unique package IDs to avoid conflicts
- **Category Matching**: Only adds packages matching the vendor's category
- **Skip Existing**: Skips vendors who already have packages
- **Comprehensive Logging**: Detailed logs for monitoring progress

## Security Rules

### Firestore Rules
- Vendors can only update their own packages
- Package data is validated before storage
- Limits: Maximum 10 packages per vendor
- Authentication required for all operations

### Storage Rules
- Package images limited to 5MB
- Service images limited to 10MB
- Only image files allowed
- Vendors can only manage their own images

## Package Management

### Adding New Packages
1. **Via Vendor Dashboard:**
   - Login as vendor
   - Go to "My Services" tab
   - Click "Add Package" for a service
   - Fill in package details
   - Save changes

2. **Via API:**
   ```javascript
   // Update packages for a vendor
   await updateDoc(doc(db, 'postorder', vendorId), {
     packages: arrayUnion(newPackage),
     updatedAt: new Date()
   });
   ```

### Updating Existing Packages
1. **Via Vendor Dashboard:**
   - Go to "My Services" tab
   - Click "Edit" on existing package
   - Modify details
   - Save changes

2. **Via API:**
   ```javascript
   // Update specific package
   const updatedPackages = vendorData.packages.map(pkg => 
     pkg.id === packageId ? updatedPackage : pkg
   );
   await updateDoc(doc(db, 'postorder', vendorId), {
     packages: updatedPackages,
     updatedAt: new Date()
   });
   ```

### Deleting Packages
1. **Via Vendor Dashboard:**
   - Go to "My Services" tab
   - Click "Delete" on package
   - Confirm deletion

2. **Via API:**
   ```javascript
   // Remove package from array
   const filteredPackages = vendorData.packages.filter(pkg => pkg.id !== packageId);
   await updateDoc(doc(db, 'postorder', vendorId), {
     packages: filteredPackages,
     updatedAt: new Date()
   });
   ```

## Monitoring and Analytics

### Key Metrics to Track
- Number of packages per vendor
- Package performance (views, bookings)
- Category-wise package distribution
- Pricing trends and discounts

### Firebase Console Monitoring
1. **Firestore Usage:**
   - Monitor read/write operations
   - Check for rule violations
   - Track document size growth

2. **Storage Usage:**
   - Monitor image uploads
   - Check storage costs
   - Track file access patterns

## Troubleshooting

### Common Issues
1. **Packages not showing:**
   - Check if vendor has packages array
   - Verify category matching
   - Check for data validation errors

2. **Permission denied:**
   - Verify user authentication
   - Check Firestore rules
   - Ensure user owns the document

3. **Image upload failures:**
   - Check file size limits
   - Verify file type (images only)
   - Check storage rules

### Debug Steps
1. Check browser console for errors
2. Verify Firebase rules in console
3. Check network tab for failed requests
4. Review Firebase logs for errors

## Future Enhancements

### Planned Features
1. **Package Analytics Dashboard**
2. **Dynamic Pricing Based on Demand**
3. **Package Recommendations**
4. **Bulk Package Management**
5. **Package Templates**
6. **Advanced Search and Filtering**

### Performance Optimizations
1. **Pagination for Large Package Lists**
2. **Image Optimization and Compression**
3. **Caching for Frequently Accessed Packages**
4. **Lazy Loading for Package Images**

## Support

For technical support or questions about the package system:
1. Check this documentation first
2. Review Firebase Console logs
3. Contact the development team
4. Create an issue in the project repository



