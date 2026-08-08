# VaniBackend - Complete Shopping System Backend

A secure, full-featured backend API for the Vani Systems e-commerce platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Login history tracking
  - Account blocking/deactivation

- **Security**
  - Helmet for HTTP headers security
  - Rate limiting to prevent abuse
  - CORS configuration
  - Input validation with express-validator
  - SQL injection prevention (MongoDB)
  - XSS protection

- **Real-time Communication**
  - Socket.io for real-time updates
  - Order notifications to admin
  - Order status updates to users

- **API Endpoints**
  - Authentication (Register, Login, Profile)
  - User Management (Admin only)
  - Products (CRUD operations)
  - Orders (Create, Track, Update Status)
  - Payments (Record, Update Status)
  - Cart (Add, Update, Remove, Clear)
  - Wishlist (Add, Remove, Clear)
  - Addresses (CRUD operations)
  - Notifications (Mark read, Clear)
  - Coupons (Create, Validate, Apply)

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator
- **Real-time**: Socket.io
- **Payment Integration**: Razorpay (ready)
- **File Upload**: Multer with Cloudinary (ready)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vanisystems
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5173
```

3. Start MongoDB server:
```bash
# Using MongoDB locally
mongod

# Or using MongoDB Atlas connection string in .env
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "location": "Mumbai",
  "pinCode": "400001",
  "address": "123 Street"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /api/auth/update-profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "1234567890",
  "location": "Mumbai",
  "pinCode": "400001",
  "address": "123 Street"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?search=keyword&category=Home Services&featured=true&status=Active&page=1&limit=12
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "House Cleaning Service",
  "category": "Home Services",
  "image": "https://example.com/image.jpg",
  "price": 999,
  "discount": 20,
  "description": "Professional cleaning service",
  "stock": 50,
  "brand": "Vani Systems",
  "sku": "SKU-001",
  "gst": 18,
  "shippingCharge": 99,
  "featured": true,
  "status": "Active"
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 1499
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer {admin_token}
```

### Order Endpoints

#### Get All Orders
```http
GET /api/orders?status=Pending&search=keyword&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer {token}
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "customerAddress": "123 Street",
  "customerCity": "Mumbai",
  "customerPinCode": "400001",
  "items": [
    {
      "id": "product_id",
      "title": "Product Name",
      "image": "https://example.com/image.jpg",
      "price": 999,
      "discountPrice": 799,
      "quantity": 2,
      "gst": 18,
      "shippingCharge": 99
    }
  ],
  "totalItems": 2,
  "subtotal": 1598,
  "shippingCharge": 198,
  "tax": 287.64,
  "grandTotal": 2083.64,
  "paymentMethod": "Cash On Delivery"
}
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "Shipped",
  "remarks": "Order has been shipped",
  "location": "Mumbai Hub"
}
```

#### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

#### Get Order Statistics (Admin Only)
```http
GET /api/orders/stats/summary
Authorization: Bearer {admin_token}
```

### Payment Endpoints

#### Get All Payments
```http
GET /api/payments?status=Paid&search=keyword&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Payment
```http
GET /api/payments/:id
Authorization: Bearer {token}
```

#### Record Payment
```http
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "ORD-ABC123XYZ",
  "invoiceNumber": "INV-1234567890-1234",
  "amount": 2083.64,
  "paymentMethod": "Cash On Delivery"
}
```

#### Update Payment Status (Admin Only)
```http
PUT /api/payments/:id/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "paymentStatus": "Refunded",
  "refundReason": "Customer request"
}
```

#### Get Payment Statistics (Admin Only)
```http
GET /api/payments/stats/summary
Authorization: Bearer {admin_token}
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer {token}
```

#### Add to Cart
```http
POST /api/cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE /api/cart/remove/:productId
Authorization: Bearer {token}
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer {token}
```

### Wishlist Endpoints

#### Get Wishlist
```http
GET /api/wishlist
Authorization: Bearer {token}
```

#### Add to Wishlist
```http
POST /api/wishlist/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id"
}
```

#### Remove from Wishlist
```http
DELETE /api/wishlist/remove/:productId
Authorization: Bearer {token}
```

#### Clear Wishlist
```http
DELETE /api/wishlist/clear
Authorization: Bearer {token}
```

### Address Endpoints

#### Get Addresses
```http
GET /api/addresses
Authorization: Bearer {token}
```

#### Add Address
```http
POST /api/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "home",
  "fullName": "John Doe",
  "phone": "1234567890",
  "pincode": "400001",
  "address": "123 Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "isDefault": true
}
```

#### Update Address
```http
PUT /api/addresses/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

#### Delete Address
```http
DELETE /api/addresses/:id
Authorization: Bearer {token}
```

#### Set Default Address
```http
POST /api/addresses/:id/set-default
Authorization: Bearer {token}
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/notifications?unreadOnly=true
Authorization: Bearer {token}
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer {token}
```

#### Clear All Notifications
```http
DELETE /api/notifications/clear-all
Authorization: Bearer {token}
```

### Coupon Endpoints

#### Get Coupons
```http
GET /api/coupons?status=active&search=keyword&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Single Coupon
```http
GET /api/coupons/:id
Authorization: Bearer {token}
```

#### Create Coupon (Admin Only)
```http
POST /api/coupons
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "code": "SAVE20",
  "discount": 20,
  "discountType": "percentage",
  "minPurchase": 500,
  "maxDiscount": 200,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2024-12-31T23:59:59.000Z",
  "usageLimit": 1000
}
```

#### Update Coupon (Admin Only)
```http
PUT /api/coupons/:id
Authorization: Bearer {admin_token}
```

#### Delete Coupon (Admin Only)
```http
DELETE /api/coupons/:id
Authorization: Bearer {admin_token}
```

#### Validate Coupon
```http
POST /api/coupons/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 1000
}
```

### User Management Endpoints (Admin Only)

#### Get All Users
```http
GET /api/users?search=keyword&page=1&limit=10
Authorization: Bearer {admin_token}
```

#### Get Single User
```http
GET /api/users/:id
Authorization: Bearer {admin_token}
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "John Doe",
  "role": "admin",
  "isActive": true,
  "isBlocked": false
}
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer {admin_token}
```

#### Block User
```http
POST /api/users/:id/block
Authorization: Bearer {admin_token}
```

#### Unblock User
```http
POST /api/users/:id/unblock
Authorization: Bearer {admin_token}
```

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  pinCode: String,
  address: String,
  role: String (user/admin),
  isActive: Boolean,
  isBlocked: Boolean,
  lastLogin: Date,
  loginHistory: Array,
  registrationDate: Date
}
```

### Product Model
```javascript
{
  title: String,
  category: String,
  image: String,
  price: Number,
  discount: Number,
  discountPrice: Number,
  description: String,
  stock: Number,
  brand: String,
  sku: String (unique),
  gst: Number,
  shippingCharge: Number,
  featured: Boolean,
  status: String (Active/Inactive)
}
```

### Order Model
```javascript
{
  orderId: String (unique),
  invoiceNumber: String (unique),
  trackingNumber: String (unique),
  userId: ObjectId,
  customerEmail: String,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  customerCity: String,
  customerPinCode: String,
  items: Array,
  totalItems: Number,
  subtotal: Number,
  shippingCharge: Number,
  tax: Number,
  discount: Number,
  grandTotal: Number,
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  timeline: Array,
  tracking: Object
}
```

### Payment Model
```javascript
{
  transactionId: String (unique),
  orderId: String,
  invoiceNumber: String,
  amount: Number,
  paymentMethod: String,
  paymentStatus: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  paymentDetails: Object,
  refundAmount: Number,
  refundReason: String,
  refundDate: Date
}
```

### Cart Model
```javascript
{
  userId: ObjectId,
  items: Array,
  appliedCoupon: ObjectId,
  subtotal: Number,
  totalGST: Number,
  totalShipping: Number,
  couponDiscount: Number,
  grandTotal: Number
}
```

### Wishlist Model
```javascript
{
  userId: ObjectId,
  items: Array
}
```

### Address Model
```javascript
{
  userId: ObjectId,
  type: String (home/office/other),
  fullName: String,
  phone: String,
  pincode: String,
  address: String,
  city: String,
  state: String,
  isDefault: Boolean
}
```

### Notification Model
```javascript
{
  userId: ObjectId,
  userEmail: String,
  title: String,
  message: String,
  type: String (order/payment/promotion/system),
  read: Boolean
}
```

### Coupon Model
```javascript
{
  code: String (unique),
  discount: Number,
  discountType: String (percentage/fixed),
  minPurchase: Number,
  maxDiscount: Number,
  validFrom: Date,
  validTo: Date,
  status: String (active/inactive/expired),
  usageLimit: Number,
  usedCount: Number
}
```

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt with configurable rounds
3. **Rate Limiting**: Prevents brute force attacks
4. **Helmet**: Sets secure HTTP headers
5. **CORS**: Configured for specific origins
6. **Input Validation**: All inputs validated before processing
7. **Role-Based Access**: Admin-only endpoints protected
8. **Account Blocking**: Admin can block malicious users
9. **Login History**: Tracks user login attempts

## Socket.io Events

### Client → Server
- `join-user-room`: Join user-specific room for notifications
- `join-admin-room`: Join admin room for order updates

### Server → Client
- `new-order`: Notify admin of new order
- `order-updated`: Notify user of order status update
- `order-cancelled`: Notify admin of order cancellation

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Validation errors:
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_REFRESH_EXPIRE | Refresh token expiration | 30d |
| BCRYPT_ROUNDS | Bcrypt rounds | 12 |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |

## Project Structure

```
VaniBackend/
├── server.js              # Main server file
├── .env                   # Environment variables
├── package.json           # Dependencies
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handler
│   └── notFound.js       # 404 handler
├── models/               # Database models
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   ├── Payment.js
│   ├── Cart.js
│   ├── Wishlist.js
│   ├── Address.js
│   ├── Notification.js
│   └── Coupon.js
└── routes/               # API routes
    ├── auth.js
    ├── users.js
    ├── products.js
    ├── orders.js
    ├── payments.js
    ├── cart.js
    ├── wishlist.js
    ├── addresses.js
    ├── notifications.js
    └── coupons.js
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### Using Nodemon for Auto-restart
```bash
npm install -g nodemon
nodemon server.js
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong secrets for JWT
3. Use MongoDB Atlas for production database
4. Configure proper CORS origin
5. Enable HTTPS
6. Set up proper logging
7. Configure backup strategy
8. Monitor server performance

## License

MIT License

## Author

Er.Mukesh Prajapati

## Support

For issues and questions, please contact the development team.
