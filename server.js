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

// // Import routes (FIXED PATHS WITH CAPITAL 'R')
// const authRoutes = require('./Routes/auth');
// const userRoutes = require('./Routes/users');
// const productRoutes = require('./Routes/products');
// const orderRoutes = require('./Routes/orders');
// const paymentRoutes = require('./Routes/payments');
// const cartRoutes = require('./Routes/cart');
// const wishlistRoutes = require('./Routes/wishlist');
// const addressRoutes = require('./Routes/addresses');
// const notificationRoutes = require('./Routes/notifications');
// const couponRoutes = require('./Routes/coupons');
// const dashboardRoutes = require('./Routes/dashboard');

// // Initialize Express app
// const app = express();
// const httpServer = createServer(app);

// // FIX: Binds a fallback storage instance context object to Express.
// app.set('db', { users: [], wishlists: [], products: [] });

// // Allowed Origins List for Full Security
// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://vani-systems-ouit.vercel.app'
// ];

// // Socket.io setup with multi-origin CORS support
// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true
//   }
// });

// // Make io accessible to routes
// app.set('io', io);

// // Security middleware (Helmet Policy Updated for Frontend & Backend Connectivity)
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://jsdelivr.net"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://jsdelivr.net"],
//       imgSrc: ["'self'", "data:", "https:", "https://unsplash.com"],
//       connectSrc: ["'self'", "https://razorpay.com", "http://localhost:5000", "https://vani-systems-ouit.vercel.app"],
//       fontSrc: ["'self'", "https://gstatic.com"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"]
//     }
//   },
//   crossOriginEmbedderPolicy: false
// }));

// // CORS Dynamic Configuration for Production & Local Security
// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS Policy: This origin is not allowed by Vani Systems Security!'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // Rate limiting
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

// // Body parsing middleware
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

// // API Routes (FIXED ADMIN PATH WITH CAPITAL 'R')
// app.use('/api/auth', authRoutes);
// app.use("/api/admin", require("./Routes/adminRoutes"));
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

// // Import middleware (Placed correctly before handlers)
// const errorHandler = require('./middleware/errorHandler');
// const notFound = require('./middleware/notFound');

// // 404 handler
// app.use(notFound);

// // Global error handler
// app.use(errorHandler);

// // Start server
// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
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
const path = require('path');
const fs = require('fs');

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

// ==================== CANDIDATE + GALLERY ROUTES ====================
const candidateRoutes = require('./Routes/candidates');
const galleryRoutes = require('./Routes/gallery');
// ====================================================================

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// FIX: Binds a fallback storage instance context object to Express.
app.set('db', { users: [], wishlists: [], products: [] });

// ==================== UPLOADS CONFIGURATION ====================
const uploadsRoot = path.join(__dirname, 'uploads');

try {
  fs.mkdirSync(path.join(uploadsRoot, 'candidates'), {
    recursive: true
  });

  fs.mkdirSync(path.join(uploadsRoot, 'gallery'), {
    recursive: true
  });
} catch (e) {
  console.error('Uploads folder initialization error:', e.message);
}

// Serve uploaded files publicly
app.use('/uploads', express.static(uploadsRoot));
// ===============================================================

// Allowed Origins List for Full Security
const allowedOrigins = [
  'http://localhost:5173',
  'https://vani-systems-ouit.vercel.app'
];

// Socket.io setup with multi-origin CORS support
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Security middleware (Helmet Policy Updated for Frontend & Backend Connectivity)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://jsdelivr.net'
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://jsdelivr.net'
        ],

        imgSrc: [
          "'self'",
          'data:',
          'https:',
          'http:',
          'https://unsplash.com'
        ],

        connectSrc: [
          "'self'",
          'https://razorpay.com',
          'http://localhost:5000',
          'https://vani-systems-ouit.vercel.app'
        ],

        fontSrc: [
          "'self'",
          'https://gstatic.com'
        ],

        objectSrc: ["'none'"],

        mediaSrc: ["'self'"],

        frameSrc: ["'none'"]
      }
    },

    crossOriginEmbedderPolicy: false
  })
);

// CORS Dynamic Configuration for Production & Local Security
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(
          new Error(
            'CORS Policy: This origin is not allowed by Vani Systems Security!'
          )
        );
      }
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With'
    ]
  })
);

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

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb'
  })
);

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

    console.log(
      `User ${userId} joined their room`
    );
  });

  socket.on('join-admin-room', () => {
    socket.join('admin-room');

    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log(
      `User disconnected: ${socket.id}`
    );
  });
});

// ==================== API ROUTES ====================

app.use('/api/auth', authRoutes);

app.use(
  '/api/admin',
  require('./Routes/adminRoutes')
);

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

// ==================== CANDIDATE API ====================

app.use(
  '/api/candidates',
  candidateRoutes
);

// ==================== GALLERY API ====================

app.use(
  '/api/gallery',
  galleryRoutes
);

// ============================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import middleware (Placed correctly before handlers)
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

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
    console.log(`Candidate routes mounted at /api/candidates`);
    console.log(`Gallery routes mounted at /api/gallery`);
    console.log(`Uploads served from /uploads`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(
    `Unhandled Rejection: ${err.message}`
  );

  httpServer.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(
    `Uncaught Exception: ${err.message}`
  );

  process.exit(1);
});

startServer();

module.exports = {
  app,
  io
};

