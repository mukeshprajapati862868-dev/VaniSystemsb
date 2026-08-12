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
  fs.mkdirSync(path.join(uploadsRoot, 'candidates'), {
    recursive: true
  });

  fs.mkdirSync(path.join(uploadsRoot, 'gallery'), {
    recursive: true
  });
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

// ===============================================================


// ==================== ALLOWED ORIGINS ====================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',

  'https://vani-systems-ouit.vercel.app',

  'http://rishabh.vanisystems.in',
  'https://rishabh.vanisystems.in',

  'http://api-rishabh.vanisystems.in',
  'https://api-rishabh.vanisystems.in'
];

// ===============================================================


// ==================== CORS CONFIGURATION ====================

// IMPORTANT:
// CORS middleware must run BEFORE API routes.
//
// Production frontend:
// https://rishabh.vanisystems.in
//
// Production backend:
// https://api-rishabh.vanisystems.in

const corsOptions = {
  origin: function (origin, callback) {

    // Allow server-to-server requests, health checks,
    // curl/Postman and requests without Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(
      `CORS blocked origin: ${origin}`
    );

    return callback(
      new Error(
        `CORS Policy: Origin ${origin} is not allowed by Vani Systems Security!`
      )
    );
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
    'X-Requested-With',
    'Accept',
    'Origin'
  ],

  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization'
  ],

  optionsSuccessStatus: 204,

  preflightContinue: false
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight requests
app.options(
  '*',
  cors(corsOptions)
);

// ===============================================================


// ==================== SOCKET.IO ====================

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,

    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS'
    ],

    credentials: true
  },

  transports: [
    'websocket',
    'polling'
  ]
});

// Make io accessible to routes
app.set('io', io);

// ===============================================================


// ==================== SECURITY MIDDLEWARE ====================

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
          'https://cdn.jsdelivr.net',
          'https://jsdelivr.net'
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdn.jsdelivr.net',
          'https://jsdelivr.net'
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

          // Local frontend/backend
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5000',

          // Production frontend
          'https://rishabh.vanisystems.in',
          'http://rishabh.vanisystems.in',

          // Production backend
          'https://api-rishabh.vanisystems.in',
          'http://api-rishabh.vanisystems.in',

          // Existing Vercel frontend
          'https://vani-systems-ouit.vercel.app',

          // Razorpay
          'https://razorpay.com',
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',

          // Socket connection
          'wss://api-rishabh.vanisystems.in',
          'ws://api-rishabh.vanisystems.in'
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
          'https://api.razorpay.com',
          'https://checkout.razorpay.com'
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

// ===============================================================


// ==================== RATE LIMITING ====================

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
    return req.path === '/health';
  }
});

app.use(
  '/api/',
  limiter
);

// ===============================================================


// ==================== BODY PARSING ====================

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

app.use(cookieParser());

// ===============================================================


// ==================== COMPRESSION ====================

app.use(
  compression()
);

// ===============================================================


// ==================== LOGGING ====================

if (process.env.NODE_ENV === 'development') {
  app.use(
    morgan('dev')
  );
} else {
  app.use(
    morgan('combined')
  );
}

// ===============================================================


// ==================== SOCKET.IO CONNECTION ====================

io.on(
  'connection',
  (socket) => {

    console.log(
      `User connected: ${socket.id}`
    );

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

// ===============================================================


// ==================== API ROUTES ====================

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

// ===============================================================


// ==================== CANDIDATE API ====================

app.use(
  '/api/candidates',
  candidateRoutes
);

// ===============================================================


// ==================== GALLERY API ====================

app.use(
  '/api/gallery',
  galleryRoutes
);

// ===============================================================


// ==================== HEALTH CHECK ====================

app.get(
  '/api/health',
  (req, res) => {

    res.status(200).json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment:
        process.env.NODE_ENV || 'production',
      origin:
        req.headers.origin || null
    });
  }
);

// ===============================================================


// ==================== ROOT CHECK ====================

app.get(
  '/',
  (req, res) => {

    res.status(200).json({
      status: 'success',
      message: 'Vani Systems API is running',
      api: '/api',
      health: '/api/health',
      timestamp: new Date().toISOString()
    });
  }
);

// ===============================================================


// ==================== IMPORT ERROR MIDDLEWARE ====================

const errorHandler =
  require('./middleware/errorHandler');

const notFound =
  require('./middleware/notFound');

// ===============================================================


// ==================== 404 HANDLER ====================

app.use(
  notFound
);

// ===============================================================


// ==================== GLOBAL ERROR HANDLER ====================

app.use(
  errorHandler
);

// ===============================================================


// ==================== START SERVER ====================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {

  try {

    await connectDB();

    httpServer.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log(
          '=================================================='
        );

        console.log(
          `Server running on port ${PORT}`
        );

        console.log(
          `Environment: ${
            process.env.NODE_ENV || 'production'
          }`
        );

        console.log(
          '=================================================='
        );

        console.log(
          'Allowed Frontend Origins:'
        );

        allowedOrigins.forEach(
          (origin) => {
            console.log(
              ` - ${origin}`
            );
          }
        );

        console.log(
          '=================================================='
        );

        console.log(
          'Auth routes mounted at /api/auth'
        );

        console.log(
          'Admin routes mounted at /api/admin'
        );

        console.log(
          'User routes mounted at /api/users'
        );

        console.log(
          'Product routes mounted at /api/products'
        );

        console.log(
          'Order routes mounted at /api/orders'
        );

        console.log(
          'Payment routes mounted at /api/payments'
        );

        console.log(
          'Cart routes mounted at /api/cart'
        );

        console.log(
          'Wishlist routes mounted at /api/wishlist'
        );

        console.log(
          'Address routes mounted at /api/addresses'
        );

        console.log(
          'Notification routes mounted at /api/notifications'
        );

        console.log(
          'Coupon routes mounted at /api/coupons'
        );

        console.log(
          'Dashboard routes mounted at /api/dashboard'
        );

        console.log(
          'Candidate routes mounted at /api/candidates'
        );

        console.log(
          'Gallery routes mounted at /api/gallery'
        );

        console.log(
          'Uploads served from /uploads'
        );

        console.log(
          'Health check available at /api/health'
        );

        console.log(
          '=================================================='
        );
      }
    );

  } catch (error) {

    console.error(
      'Failed to start server:',
      error.message
    );

    process.exit(1);
  }
};

// ===============================================================


// ==================== HANDLE UNHANDLED REJECTIONS ====================

process.on(
  'unhandledRejection',
  (err) => {

    console.error(
      `Unhandled Rejection: ${err.message}`
    );

    console.error(
      err.stack
    );

    httpServer.close(
      () => {
        process.exit(1);
      }
    );
  }
);

// ===============================================================


// ==================== HANDLE UNCAUGHT EXCEPTIONS ====================

process.on(
  'uncaughtException',
  (err) => {

    console.error(
      `Uncaught Exception: ${err.message}`
    );

    console.error(
      err.stack
    );

    process.exit(1);
  }
);

// ===============================================================


// ==================== START APPLICATION ====================

startServer();

// ===============================================================


// ==================== EXPORT ====================

module.exports = {
  app,
  io
};

// ===============================================================
