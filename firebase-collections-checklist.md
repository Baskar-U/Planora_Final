# Firebase Collections Checklist

## ✅ **Existing Collections (Already Created)**

### 1. **users**
- **Purpose**: Store user account information
- **Fields**: 
  - `uid` (string) - Firebase Auth UID
  - `name` (string) - Full name
  - `email` (string) - Email address
  - `phone` (string) - Phone number
  - `userType` (string) - 'customer' or 'vendor'
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 2. **vendors**
- **Purpose**: Store vendor profile information
- **Fields**:
  - `id` (string) - Vendor ID
  - `name` (string) - Vendor name
  - `businessname` (string) - Business name
  - `email` (string) - Email
  - `mobilenumber` (string) - Phone
  - `location` (string) - Location
  - `eventname` (string) - Event category
  - `description` (string) - About
  - `hours` (string) - Working hours
  - `exprience` (number) - Years of experience
  - `image` (string) - Profile image URL
  - `menu` (array) - Service menu items
  - `isVerified` (boolean) - Verification status
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 3. **orders**
- **Purpose**: Store order/booking information
- **Fields**:
  - `orderId` (string) - Unique order ID
  - `customerId` (string) - Customer UID
  - `vendorId` (string) - Vendor ID
  - `serviceId` (string) - Service ID
  - `status` (string) - Order status
  - `amount` (number) - Order amount
  - `eventDate` (timestamp) - Event date
  - `eventType` (string) - Type of event
  - `customerDetails` (object) - Customer info
  - `vendorDetails` (object) - Vendor info
  - `serviceDetails` (object) - Service info
  - `timeline` (array) - Order timeline
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 4. **messages**
- **Purpose**: Store chat messages
- **Fields**:
  - `messageId` (string) - Unique message ID
  - `conversationId` (string) - Conversation ID
  - `senderId` (string) - Sender UID
  - `senderType` (string) - 'customer' or 'vendor'
  - `content` (string) - Message content
  - `messageType` (string) - 'text', 'image', 'file'
  - `isRead` (boolean) - Read status
  - `createdAt` (timestamp)

### 5. **conversations**
- **Purpose**: Store chat conversations
- **Fields**:
  - `conversationId` (string) - Unique conversation ID
  - `customerId` (string) - Customer UID
  - `vendorId` (string) - Vendor ID
  - `orderId` (string) - Related order ID
  - `lastMessage` (object) - Last message details
  - `unreadCount` (number) - Unread messages count
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 6. **vendorAvailability**
- **Purpose**: Store vendor availability data
- **Fields**:
  - `vendorId` (string) - Vendor ID
  - `vendorName` (string) - Vendor name
  - `year` (number) - Year
  - `month` (number) - Month
  - `availability` (array) - Daily availability
  - `workingHours` (object) - Working hours settings
  - `advanceBookingDays` (number) - Advance booking limit
  - `minNoticeHours` (number) - Minimum notice hours
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 7. **vendorCalendarSettings**
- **Purpose**: Store vendor calendar configuration
- **Fields**:
  - `vendorId` (string) - Vendor ID
  - `workingHours` (object) - Daily working hours
  - `eventTypes` (array) - Available event types
  - `holidays` (array) - Holiday dates
  - `bookingSettings` (object) - Booking preferences
  - `advanceBookingDays` (number) - Advance booking limit
  - `minNoticeHours` (number) - Minimum notice hours
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 8. **bookings**
- **Purpose**: Store booking requests
- **Fields**:
  - `bookingId` (string) - Unique booking ID
  - `customerId` (string) - Customer UID
  - `vendorId` (string) - Vendor ID
  - `eventDate` (string) - Event date
  - `eventTime` (string) - Event time
  - `eventType` (string) - Type of event
  - `customerName` (string) - Customer name
  - `customerEmail` (string) - Customer email
  - `customerPhone` (string) - Customer phone
  - `eventDetails` (string) - Event description
  - `guestCount` (number) - Number of guests
  - `status` (string) - Booking status
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 9. **vendorServices**
- **Purpose**: Store vendor service offerings
- **Fields**:
  - `vendorId` (string) - Vendor ID
  - `vendorName` (string) - Vendor name
  - `serviceName` (string) - Service name
  - `category` (string) - Service category
  - `description` (string) - Service description
  - `price` (number) - Service price
  - `priceUnit` (string) - Price unit (fixed, per_person, etc.)
  - `duration` (string) - Service duration
  - `features` (array) - Service features
  - `availability` (string) - Availability info
  - `location` (string) - Service location
  - `isActive` (boolean) - Service status
  - `images` (array) - Service images
  - `rating` (number) - Average rating
  - `reviewCount` (number) - Number of reviews
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

## 🔄 **Collections to Create (Run Setup Scripts)**

### 10. **reviews**
- **Purpose**: Store customer reviews and ratings
- **Fields**:
  - `reviewId` (string) - Unique review ID
  - `customerId` (string) - Customer UID
  - `vendorId` (string) - Vendor ID
  - `serviceId` (string) - Service ID
  - `orderId` (string) - Related order ID
  - `rating` (number) - Rating (1-5)
  - `title` (string) - Review title
  - `comment` (string) - Review comment
  - `images` (array) - Review images
  - `isVerified` (boolean) - Verified purchase
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 11. **notifications**
- **Purpose**: Store user notifications
- **Fields**:
  - `notificationId` (string) - Unique notification ID
  - `userId` (string) - User UID
  - `userType` (string) - 'customer' or 'vendor'
  - `type` (string) - Notification type
  - `title` (string) - Notification title
  - `message` (string) - Notification message
  - `data` (object) - Additional data
  - `isRead` (boolean) - Read status
  - `createdAt` (timestamp)

### 12. **payments**
- **Purpose**: Store payment information
- **Fields**:
  - `paymentId` (string) - Unique payment ID
  - `orderId` (string) - Related order ID
  - `customerId` (string) - Customer UID
  - `vendorId` (string) - Vendor ID
  - `amount` (number) - Payment amount
  - `currency` (string) - Currency (INR)
  - `paymentMethod` (string) - Payment method
  - `status` (string) - Payment status
  - `transactionId` (string) - External transaction ID
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

## 📋 **Setup Instructions**

### Step 1: Run the setup scripts in browser console
```javascript
// Set up vendor services
window.addVendorServices()

// Set up availability data  
window.addVendorAvailability()

// Set up booking data
window.addBookings()
```

### Step 2: Create missing collections manually in Firebase Console
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Create the following collections:
   - `reviews`
   - `notifications` 
   - `payments`

### Step 3: Verify all collections exist
Check that all 12 collections are present in your Firebase project.

## 🎯 **Current Status**
- ✅ **9 collections already exist** (users, vendors, orders, messages, conversations, vendorAvailability, vendorCalendarSettings, bookings, vendorServices)
- 🔄 **3 collections need to be created** (reviews, notifications, payments)

## 📊 **Collection Summary**
- **Total Collections**: 12
- **User Management**: 2 (users, vendors)
- **Service Management**: 1 (vendorServices)
- **Booking System**: 3 (orders, bookings, payments)
- **Communication**: 2 (messages, conversations)
- **Availability**: 2 (vendorAvailability, vendorCalendarSettings)
- **Reviews & Feedback**: 1 (reviews)
- **Notifications**: 1 (notifications)

