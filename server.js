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

// ==================== IMPORT DATABASE CONNECTION ====================
const connectDB = require('./config/db');

// ==================== IMPORT ROUTES ====================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const addressRoutes = require('./routes/addresses');
const notificationRoutes = require('./routes/notifications');
const couponRoutes = require('./routes/coupons');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/adminRoutes');
const candidateRoutes = require('./routes/candidates');
const galleryRoutes = require('./routes/gallery');

// ==================== IMPORT CONTROLLERS ====================
const galleryController = require('./controllers/galleryController');

// ==================== IMPORT MIDDLEWARE ====================
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// ==================== INITIALIZE EXPRESS APP ====================
const app = express();
const httpServer = createServer(app);

// ==================== FALLBACK STORAGE ====================
// This prevents middleware/auth.js from throwing:
// "Storage not initialized"
// ===============================================================
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

  console.log('Uploads folders initialized successfully');
} catch (e) {
  console.error(
    'Uploads folder initialization error:',
    e.message
  );
}

// ==================== SERVE UPLOADED FILES ====================
// Public upload route
app.use(
  '/api/uploads',
  express.static(uploadsRoot, {
    fallthrough: true
  })
);

// Also serve uploads directly if required by existing frontend
app.use(
  '/uploads',
  express.static(uploadsRoot, {
    fallthrough: true
  })
);

// ==================== ALLOWED CORS ORIGINS ====================
// Production frontend
// Local development
// Existing Vercel frontend
// ===============================================================

const allowedOrigins = [
  'https://rishabh.vanisystems.in',
  'http://rishabh.vanisystems.in',
  'https://vani-systems-ouit.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Optional additional origin from .env
if (
  process.env.CORS_ORIGIN &&
  !allowedOrigins.includes(process.env.CORS_ORIGIN)
) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

// Remove accidental trailing slashes from origins
const normalizedAllowedOrigins = allowedOrigins
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

console.log(
  'Allowed CORS Origins:',
  normalizedAllowedOrigins
);

// ==================== CORS ORIGIN VALIDATION ====================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / Postman / curl requests
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (
      normalizedAllowedOrigins.includes(normalizedOrigin)
    ) {
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

// ==================== SOCKET.IO ====================

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');

      if (
        normalizedAllowedOrigins.includes(
          normalizedOrigin
        )
      ) {
        return callback(null, true);
      }

      console.error(
        `Socket.IO CORS blocked origin: ${origin}`
      );

      return callback(
        new Error(
          'Socket.IO CORS origin not allowed'
        )
      );
    },

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

// Make Socket.IO accessible to routes
app.set('io', io);

// ==================== HELMET SECURITY ====================

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

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
          'https://api-rishabh.vanisystems.in',
          'https://rishabh.vanisystems.in',
          'https://vani-systems-ouit.vercel.app',
          'https://razorpay.com',
          'https://api.razorpay.com',
          'http://localhost:5000',
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:3000',
          'http://127.0.0.1:3000',
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
          'https://checkout.razorpay.com',
          'https://razorpay.com'
        ],

        workerSrc: [
          "'self'",
          'blob:'
        ],

        manifestSrc: [
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

// ==================== CORS MIDDLEWARE ====================
// IMPORTANT:
// This MUST be before API routes.
// ===========================================================

app.use(cors(corsOptions));

// ==================== EXPLICIT PREFLIGHT HANDLER ====================
// This fixes:
// "Response to preflight request doesn't pass access control check"
// ===============================================================

app.options(
  '*',
  cors(corsOptions)
);

// ==================== EXTRA PREFLIGHT SAFETY ====================
// Ensures OPTIONS receives the required headers even when
// a reverse proxy/server configuration interferes.
// ===============================================================

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (
    requestOrigin &&
    normalizedAllowedOrigins.includes(
      requestOrigin.replace(/\/$/, '')
    )
  ) {
    res.header(
      'Access-Control-Allow-Origin',
      requestOrigin
    );

    res.header(
      'Access-Control-Allow-Credentials',
      'true'
    );

    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,PATCH,OPTIONS'
    );

    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    );

    res.header(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Type, Authorization'
    );

    res.header(
      'Vary',
      'Origin'
    );
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

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
    return req.method === 'OPTIONS';
  }
});

app.use(
  '/api/',
  limiter
);

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

// ==================== COMPRESSION ====================

app.use(compression());

// ==================== LOGGING ====================

if (
  process.env.NODE_ENV === 'development'
) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== BASIC REQUEST DEBUGGING ====================

app.use((req, res, next) => {
  if (
    req.method === 'OPTIONS'
  ) {
    console.log(
      'CORS PREFLIGHT:',
      req.method,
      req.originalUrl,
      'Origin:',
      req.headers.origin,
      'Request-Headers:',
      req.headers['access-control-request-headers']
    );
  }

  next();
});

// ==================== SOCKET.IO CONNECTION ====================

io.on('connection', (socket) => {
  console.log(
    `User connected: ${socket.id}`
  );

  socket.on(
    'join-user-room',
    (userId) => {
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
});

// ============================================================
// ==================== API ROUTES ============================
// ============================================================

// ==================== AUTH ====================

app.use(
  '/api/auth',
  authRoutes
);

// ==================== ADMIN ====================

app.use(
  '/api/admin',
  adminRoutes
);

// ==================== USERS ====================

app.use(
  '/api/users',
  userRoutes
);

// ==================== PRODUCTS ====================

app.use(
  '/api/products',
  productRoutes
);

// ==================== ORDERS ====================

app.use(
  '/api/orders',
  orderRoutes
);

// ==================== PAYMENTS ====================

app.use(
  '/api/payments',
  paymentRoutes
);

// ==================== CART ====================

app.use(
  '/api/cart',
  cartRoutes
);

// ==================== WISHLIST ====================

app.use(
  '/api/wishlist',
  wishlistRoutes
);

// ==================== ADDRESSES ====================

app.use(
  '/api/addresses',
  addressRoutes
);

// ==================== NOTIFICATIONS ====================

app.use(
  '/api/notifications',
  notificationRoutes
);

// ==================== COUPONS ====================

app.use(
  '/api/coupons',
  couponRoutes
);

// ==================== DASHBOARD ====================

app.use(
  '/api/dashboard',
  dashboardRoutes
);

// ==================== CANDIDATES ====================

app.use(
  '/api/candidates',
  candidateRoutes
);

// ==================== GALLERY ====================

app.use(
  '/api/gallery',
  galleryRoutes
);

// ==================== GALLERY GET FALLBACK ====================
// Kept because your existing code directly uses
// galleryController.getGalleryImages.
// =============================================================

app.get(
  '/api/gallery',
  galleryController.getGalleryImages
);

// ==================== HEALTH CHECK ====================

app.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({
      status: 'success',

      message:
        'Server is running',

      timestamp:
        new Date().toISOString(),

      environment:
        process.env.NODE_ENV || 'production',

      cors: {
        enabled: true,

        frontend:
          'https://rishabh.vanisystems.in',

        backend:
          'https://api-rishabh.vanisystems.in'
      }
    });
  }
);

// ==================== CORS TEST ENDPOINT ====================
// Use this endpoint to verify browser CORS.
// =============================================================

app.get(
  '/api/cors-test',
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        'CORS is working correctly',

      origin:
        req.headers.origin || null,

      server:
        'api-rishabh.vanisystems.in',

      frontend:
        'rishabh.vanisystems.in',

      timestamp:
        new Date().toISOString()
    });
  }
);

// ==================== 404 HANDLER ====================

app.use(
  notFound
);

// ==================== GLOBAL ERROR HANDLER ====================

app.use(
  errorHandler
);

// ==================== START SERVER ====================

const PORT =
  process.env.PORT || 5000;

const startServer =
  async () => {
    try {
      console.log(
        'Connecting to MongoDB Atlas...'
      );

      await connectDB();

      console.log(
        'MongoDB Atlas connected successfully'
      );

      httpServer.listen(
        PORT,
        () => {
          console.log(
            '=========================================='
          );

          console.log(
            `Server running on port ${PORT}`
          );

          console.log(
            `Environment: ${
              process.env.NODE_ENV ||
              'production'
            }`
          );

          console.log(
            '=========================================='
          );

          console.log(
            'Frontend:',
            'https://rishabh.vanisystems.in'
          );

          console.log(
            'Backend:',
            'https://api-rishabh.vanisystems.in'
          );

          console.log(
            'Health:',
            'https://api-rishabh.vanisystems.in/api/health'
          );

          console.log(
            'CORS Test:',
            'https://api-rishabh.vanisystems.in/api/cors-test'
          );

          console.log(
            'Auth routes mounted at /api/auth'
          );

          console.log(
            'Admin routes mounted at /api/admin'
          );

          console.log(
            'Products routes mounted at /api/products'
          );

          console.log(
            'Candidates routes mounted at /api/candidates'
          );

          console.log(
            'Gallery routes mounted at /api/gallery'
          );

          console.log(
            'Uploads served from /uploads'
          );

          console.log(
            'API uploads served from /api/uploads'
          );

          console.log(
            '=========================================='
          );
        }
      );
    } catch (error) {
      console.error(
        'SERVER STARTUP ERROR:',
        error
      );

      process.exit(1);
    }
  };

// ==================== UNHANDLED PROMISE REJECTION ====================

process.on(
  'unhandledRejection',
  (err) => {
    console.error(
      `Unhandled Rejection: ${
        err.message
      }`
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

// ==================== UNCAUGHT EXCEPTION ====================

process.on(
  'uncaughtException',
  (err) => {
    console.error(
      `Uncaught Exception: ${
        err.message
      }`
    );

    console.error(
      err.stack
    );

    process.exit(1);
  }
);

// ==================== START APPLICATION ====================

startServer();

// ==================== EXPORT ====================

module.exports = {
  app,
  io
};
