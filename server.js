// // ==================== DNS FIX FOR MONGODB ATLAS (MUST BE ON TOP) ====================
// const dns = require('dns');
// dns.setServers(['1.1.1.1', '8.8.8.8']); 
// // ===================================================================================

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const rateLimit = require('express-rate-limit');
// const { createServer } = require('http');
// const { Server } = require('socket.io');

// // Import database connection
// const connectDB = require('./config/db');

// // Import routes
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const productRoutes = require('./routes/products');
// const orderRoutes = require('./routes/orders');
// const paymentRoutes = require('./routes/payments');
// const cartRoutes = require('./routes/cart');
// const wishlistRoutes = require('./routes/wishlist');
// const addressRoutes = require('./routes/addresses');
// const notificationRoutes = require('./routes/notifications');
// const couponRoutes = require('./routes/coupons');
// const dashboardRoutes = require('./routes/dashboard');

// // Import middleware
// const errorHandler = require('./middleware/errorHandler');
// const notFound = require('./middleware/notFound');

// // Initialize Express app
// const app = express();
// const httpServer = createServer(app);

// // FIX: Binds a fallback storage instance context object to Express.
// // This prevents 'middleware/auth.js' from throwing "Storage not initialized".
// app.set('db', { users: [], wishlists: [], products: [] });

// // Socket.io setup
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
//   }
// });

// // Make io accessible to routes
// app.set('io', io);

// // Security middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://jsdelivr.net"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://jsdelivr.net"],
//       imgSrc: ["'self'", "data:", "https:", "https://unsplash.com"],
//       connectSrc: ["'self'", "https://razorpay.com"],
//       fontSrc: ["'self'", "https://gstatic.com"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"]
//     }
//   },
//   crossOriginEmbedderPolicy: false
// }));

// // CORS configuration
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Rate limiting - FIX: Limit extended to 5000 requests for non-blocking operations
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 5000,
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });

// app.use('/api/', limiter);

// // Body parsing middleware - Size increased to 50mb for Base64 Strings
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// app.use(cookieParser());

// // Compression middleware
// app.use(compression());

// // Logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }

// // Socket.io connection handling
// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('join-user-room', (userId) => {
//     socket.join(`user-${userId}`);
//     console.log(`User ${userId} joined their room`);
//   });

//   socket.on('join-admin-room', () => {
//     socket.join('admin-room');
//     console.log('Admin joined admin room');
//   });

//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use("/api/admin", require("./routes/adminRoutes"));
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/addresses', addressRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/coupons', couponRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler
// app.use(notFound);

// // Global error handler
// app.use(errorHandler);

// // Start server
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   // Connect to MongoDB Atlas first
//   await connectDB();
  
//   httpServer.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Auth routes mounted at /api/auth`);
//   });
// };

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error(`Unhandled Rejection: ${err.message}`);
//   httpServer.close(() => process.exit(1));
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error(`Uncaught Exception: ${err.message}`);
//   process.exit(1);
// });

// startServer();

// module.exports = { app, io };


// ==================== DNS FIX FOR MONGODB ATLAS (MUST BE ON TOP) ====================
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']); 
// ===================================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import database connection
const connectDB = require('./config/db');

// Import routes (FIXED PATHS WITH CAPITAL 'R')
const authRoutes = require('./Routes/auth');
const userRoutes = require('./Routes/users');
const productRoutes = require('./Routes/products');
const orderRoutes = require('./Routes/orders');
const paymentRoutes = require('./Routes/payments');
const cartRoutes = require('./Routes/cart');
const wishlistRoutes = require('./Routes/wishlist');
const addressRoutes = require('./Routes/addresses');
const notificationRoutes = require('./Routes/notifications');
const couponRoutes = require('./Routes/coupons');
const dashboardRoutes = require('./Routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// FIX: Binds a fallback storage instance context object to Express.
app.set('db', { users: [], wishlists: [], products: [] });

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "https://unsplash.com"],
      connectSrc: ["'self'", "https://razorpay.com"],
      fontSrc: ["'self'", "https://gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5000,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes (FIXED ADMIN PATH WITH CAPITAL 'R')
app.use('/api/auth', authRoutes);
app.use("/api/admin", require("./Routes/adminRoutes"));
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Auth routes mounted at /api/auth`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();

module.exports = { app, io };







