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
app.set('db', {
  users: [],
  wishlists: [],
  products: []
});

// ==================== UPLOADS CONFIGURATION ====================

const uploadsRoot = path.join(__dirname, 'uploads');

try {
  fs.mkdirSync(
    path.join(uploadsRoot, 'candidates'),
    {
      recursive: true
    }
  );

  fs.mkdirSync(
    path.join(uploadsRoot, 'gallery'),
    {
      recursive: true
    }
  );

  console.log(
    'Uploads directories initialized successfully.'
  );
} catch (e) {
  console.error(
    'Uploads folder initialization error:',
    e.message
  );
}

// Serve uploaded files publicly
app.use(
  '/uploads',
  express.static(uploadsRoot)
);

// ================================================================
// ==================== CORS CONFIGURATION ========================
// ================================================================
//
// ALL ORIGINS ARE ALLOWED
//
// Plesk:
// https://rishabh.vanisystems.in
//
// Vercel:
// https://vani-systems-ouit.vercel.app
//
// Render:
// https://vanisystemsb-1.onrender.com
//
// Local:
// http://localhost:3000
// http://localhost:5173
// http://localhost:5174
//
// 127.0.0.1:
// http://127.0.0.1:3000
// http://127.0.0.1:5173
// http://127.0.0.1:5174
//
// ================================================================

const corsOptions = {
  origin: true,

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
    'HEAD'
  ],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Cookie',
    'X-Access-Token',
    'X-Auth-Token'
  ],

  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization'
  ],

  optionsSuccessStatus: 204,

  preflightContinue: false
};

// Global CORS
app.use(
  cors(corsOptions)
);

// ================================================================
// SOCKET.IO SETUP
// ================================================================

const io = new Server(
  httpServer,
  {
    cors: {
      origin: true,

      credentials: true,

      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
        'HEAD'
      ],

      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
      ]
    }
  }
);

// Make io accessible to routes
app.set('io', io);

// ================================================================
// SECURITY MIDDLEWARE
// ================================================================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [
          "'self'"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://jsdelivr.net',
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com'
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://jsdelivr.net',
          'https://cdn.jsdelivr.net'
        ],

        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          'http:',
          'https://unsplash.com'
        ],

        connectSrc: [
          "'self'",

          // Plesk frontend
          'https://rishabh.vanisystems.in',

          // Vercel frontend
          'https://vani-systems-ouit.vercel.app',
          'https://*.vercel.app',

          // Render
          'https://vanisystemsb-1.onrender.com',
          'https://*.onrender.com',

          // Localhost
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5000',

          // 127.0.0.1
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
          'http://127.0.0.1:5000',

          // Razorpay
          'https://razorpay.com',
          'https://api.razorpay.com',

          // WebSocket
          'ws:',
          'wss:'
        ],

        fontSrc: [
          "'self'",
          'data:',
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          'https://gstatic.com'
        ],

        objectSrc: [
          "'none'"
        ],

        mediaSrc: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          'http:'
        ],

        frameSrc: [
          "'self'",
          'https://razorpay.com',
          'https://api.razorpay.com'
        ],

        frameAncestors: [
          "'self'"
        ],

        baseUri: [
          "'self'"
        ],

        formAction: [
          "'self'"
        ]
      }
    },

    crossOriginEmbedderPolicy: false,

    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

// ================================================================
// RATE LIMITING
// ================================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5000,

  message: {
    error:
      'Too many requests from this IP, please try again later.'
  },

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) => {
    return (
      req.path === '/health' ||
      req.path === '/api/health'
    );
  }
});

app.use(
  '/api/',
  limiter
);

// ================================================================
// BODY PARSING MIDDLEWARE
// ================================================================

app.use(
  express.json({
    limit: '50mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb'
  })
);

// ================================================================
// COOKIE PARSER
// ================================================================

app.use(
  cookieParser()
);

// ================================================================
// COMPRESSION
// ================================================================

app.use(
  compression()
);

// ================================================================
// LOGGING
// ================================================================

if (
  process.env.NODE_ENV === 'development'
) {
  app.use(
    morgan('dev')
  );
} else {
  app.use(
    morgan('combined')
  );
}

// ================================================================
// SOCKET.IO CONNECTION HANDLING
// ================================================================

io.on(
  'connection',
  (socket) => {

    console.log(
      `User connected: ${socket.id}`
    );

    // ============================================================
    // USER ROOM
    // ============================================================

    socket.on(
      'join-user-room',
      (userId) => {

        if (!userId) {
          return;
        }

        socket.join(
          `user-${userId}`
        );

        console.log(
          `User ${userId} joined their room`
        );
      }
    );

    // ============================================================
    // ADMIN ROOM
    // ============================================================

    socket.on(
      'join-admin-room',
      () => {

        socket.join(
          'admin-room'
        );

        console.log(
          'Admin joined admin room'
        );
      }
    );

    // ============================================================
    // DISCONNECT
    // ============================================================

    socket.on(
      'disconnect',
      () => {

        console.log(
          `User disconnected: ${socket.id}`
        );
      }
    );
  }
);

// ================================================================
// ROOT ROUTE
// ================================================================

app.get(
  '/',
  (req, res) => {

    res.status(200).json({

      success: true,

      status: 'online',

      message:
        'Vani Systems Backend API is running successfully.',

      frontend:
        'https://rishabh.vanisystems.in',

      timestamp:
        new Date().toISOString()

    });
  }
);

// ================================================================
// BASIC HEALTH ROUTE
// ================================================================

app.get(
  '/health',
  (req, res) => {

    res.status(200).json({

      success: true,

      status: 'online',

      message:
        'Vani Systems Backend is running',

      timestamp:
        new Date().toISOString()

    });
  }
);

// ================================================================
// ==================== API ROUTES ================================
// ================================================================

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/admin',
  require('./Routes/adminRoutes')
);

app.use(
  '/api/users',
  userRoutes
);

app.use(
  '/api/products',
  productRoutes
);

app.use(
  '/api/orders',
  orderRoutes
);

app.use(
  '/api/payments',
  paymentRoutes
);

app.use(
  '/api/cart',
  cartRoutes
);

app.use(
  '/api/wishlist',
  wishlistRoutes
);

app.use(
  '/api/addresses',
  addressRoutes
);

app.use(
  '/api/notifications',
  notificationRoutes
);

app.use(
  '/api/coupons',
  couponRoutes
);

app.use(
  '/api/dashboard',
  dashboardRoutes
);

// ================================================================
// CANDIDATE API
// ================================================================

app.use(
  '/api/candidates',
  candidateRoutes
);

// ================================================================
// GALLERY API
// ================================================================

app.use(
  '/api/gallery',
  galleryRoutes
);

// ================================================================
// HEALTH CHECK ENDPOINT
// ================================================================

app.get(
  '/api/health',
  (req, res) => {

    res.status(200).json({

      status: 'success',

      message:
        'Server is running',

      frontend:
        'https://rishabh.vanisystems.in',

      cors:
        'enabled',

      timestamp:
        new Date().toISOString()

    });
  }
);

// ================================================================
// ERROR MIDDLEWARE
// ================================================================

const errorHandler =
  require('./middleware/errorHandler');

const notFound =
  require('./middleware/notFound');

// ================================================================
// 404 HANDLER
// ================================================================

app.use(
  notFound
);

// ================================================================
// GLOBAL ERROR HANDLER
// ================================================================

app.use(
  errorHandler
);

// ================================================================
// START SERVER
// ================================================================

const PORT =
  process.env.PORT || 5000;

// ================================================================
// START SERVER FUNCTION
// ================================================================

const startServer = async () => {

  try {

    // ============================================================
    // CONNECT DATABASE
    // ============================================================

    await connectDB();

    // ============================================================
    // START HTTP SERVER
    // ============================================================

    httpServer.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log('');
        console.log(
          '===================================================='
        );

        console.log(
          '🚀 VANI SYSTEMS BACKEND SERVER STARTED'
        );

        console.log(
          '===================================================='
        );

        console.log(
          `🚀 Server running on port ${PORT}`
        );

        console.log(
          `🌐 Root route: /`
        );

        console.log(
          `❤️ Health route: /api/health`
        );

        console.log(
          `🔐 Auth routes mounted at /api/auth`
        );

        console.log(
          `👤 User routes mounted at /api/users`
        );

        console.log(
          `📦 Product routes mounted at /api/products`
        );

        console.log(
          `🛒 Order routes mounted at /api/orders`
        );

        console.log(
          `💳 Payment routes mounted at /api/payments`
        );

        console.log(
          `🛍️ Cart routes mounted at /api/cart`
        );

        console.log(
          `❤️ Wishlist routes mounted at /api/wishlist`
        );

        console.log(
          `📍 Address routes mounted at /api/addresses`
        );

        console.log(
          `🔔 Notification routes mounted at /api/notifications`
        );

        console.log(
          `🎟️ Coupon routes mounted at /api/coupons`
        );

        console.log(
          `📊 Dashboard routes mounted at /api/dashboard`
        );

        console.log(
          `👨‍🎓 Candidate routes mounted at /api/candidates`
        );

        console.log(
          `🖼️ Gallery routes mounted at /api/gallery`
        );

        console.log(
          `📁 Uploads served from /uploads`
        );

        console.log(
          `🌐 Plesk Frontend: https://rishabh.vanisystems.in`
        );

        console.log(
          `🌐 CORS: ALL ORIGINS ENABLED`
        );

        console.log(
          `🔌 Socket.IO: ENABLED`
        );

        console.log(
          '===================================================='
        );

        console.log('');
      }
    );

  } catch (error) {

    console.error(
      '❌ Server startup failed:',
      error.message
    );

    process.exit(1);
  }
};

// ================================================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ================================================================

process.on(
  'unhandledRejection',
  (err) => {

    console.error(
      `Unhandled Rejection: ${err.message}`
    );

    httpServer.close(
      () => process.exit(1)
    );
  }
);

// ================================================================
// HANDLE UNCAUGHT EXCEPTIONS
// ================================================================

process.on(
  'uncaughtException',
  (err) => {

    console.error(
      `Uncaught Exception: ${err.message}`
    );

    process.exit(1);
  }
);

// ================================================================
// START
// ================================================================

startServer();

// ================================================================
// EXPORT
// ================================================================

module.exports = {
  app,
  io
};
