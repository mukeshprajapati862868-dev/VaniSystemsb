// ================================================================
// DNS FIX FOR MONGODB ATLAS
// MUST BE ON TOP
// ================================================================
const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

// ================================================================
// ENVIRONMENT
// ================================================================
require("dotenv").config();

// ================================================================
// CORE IMPORTS
// ================================================================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { createServer } = require("http");
const { Server } = require("socket.io");

const path = require("path");
const fs = require("fs");

// ================================================================
// DATABASE
// ================================================================
const connectDB = require("./config/db");

// ================================================================
// ROUTES
// ================================================================
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");
const addressRoutes = require("./routes/addresses");
const notificationRoutes = require("./routes/notifications");
const couponRoutes = require("./routes/coupons");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/adminRoutes");
const candidateRoutes = require("./routes/candidates");
const galleryRoutes = require("./routes/gallery");

// ================================================================
// MIDDLEWARE
// ================================================================
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// ================================================================
// INITIALIZE EXPRESS
// ================================================================
const app = express();
const httpServer = createServer(app);

// ================================================================
// FALLBACK STORAGE
// ================================================================
app.set("db", {
  users: [],
  wishlists: [],
  products: []
});

// ================================================================
// UPLOADS CONFIGURATION
// ================================================================
const uploadsRoot = path.join(
  __dirname,
  "uploads"
);

try {
  fs.mkdirSync(
    path.join(
      uploadsRoot,
      "candidates"
    ),
    {
      recursive: true
    }
  );

  fs.mkdirSync(
    path.join(
      uploadsRoot,
      "gallery"
    ),
    {
      recursive: true
    }
  );

  console.log(
    "Uploads directories initialized successfully."
  );
} catch (error) {
  console.error(
    "Uploads directory initialization error:",
    error.message
  );
}

// ================================================================
// SERVE UPLOADED FILES
// ================================================================

// Public uploads
app.use(
  "/uploads",
  express.static(
    uploadsRoot,
    {
      fallthrough: true,
      index: false
    }
  )
);

// API uploads
app.use(
  "/api/uploads",
  express.static(
    uploadsRoot,
    {
      fallthrough: true,
      index: false
    }
  )
);

// ================================================================
// CORS CONFIGURATION
// ================================================================
//
// Production Frontend:
// https://rishabh.vanisystems.in
//
// Production API:
// https://api-rishabh.vanisystems.in
//
// IMPORTANT:
// API domain is NOT itself a frontend origin.
// The frontend origin that needs CORS permission is:
// https://rishabh.vanisystems.in
// ================================================================

// Default production frontend
const productionFrontend =
  "https://rishabh.vanisystems.in";

// Default local frontend
const localFrontend =
  "http://localhost:5173";

// ================================================================
// BUILD ALLOWED ORIGINS
// ================================================================
const allowedOrigins = [
  localFrontend,

  "http://127.0.0.1:5173",

  "http://rishabh.vanisystems.in",

  productionFrontend,

  "https://vani-systems-ouit.vercel.app"
];

// ================================================================
// READ CORS_ORIGIN FROM .ENV
// ================================================================
if (
  process.env.CORS_ORIGIN
) {
  const envOrigins =
    process.env.CORS_ORIGIN
      .split(",")
      .map(
        (origin) =>
          origin.trim()
      )
      .filter(Boolean);

  envOrigins.forEach(
    (origin) => {

      if (
        !allowedOrigins.includes(
          origin
        )
      ) {
        allowedOrigins.push(
          origin
        );
      }
    }
  );
}

// ================================================================
// REMOVE DUPLICATE ORIGINS
// ================================================================
const uniqueAllowedOrigins =
  [
    ...new Set(
      allowedOrigins
    )
  ];

// ================================================================
// LOG CORS CONFIGURATION
// ================================================================
console.log(
  "Allowed CORS Origins:"
);

uniqueAllowedOrigins.forEach(
  (origin) => {
    console.log(
      ` - ${origin}`
    );
  }
);

// ================================================================
// CORS OPTIONS
// ================================================================
const corsOptions = {

  origin: function (
    origin,
    callback
  ) {

    // Allow requests without
    // Origin header.
    //
    // Examples:
    // curl
    // Postman
    // server-to-server
    // health checks
    if (!origin) {
      return callback(
        null,
        true
      );
    }

    // Allow approved origin
    if (
      uniqueAllowedOrigins.includes(
        origin
      )
    ) {
      return callback(
        null,
        true
      );
    }

    // Reject unknown origin
    console.error(
      `CORS blocked origin: ${origin}`
    );

    return callback(
      new Error(
        `CORS Policy: Origin ${origin} is not allowed.`
      )
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Requested-With",
    "Cache-Control",
    "Pragma"
  ],

  exposedHeaders: [
    "Content-Length",
    "Content-Type"
  ],

  optionsSuccessStatus: 204,

  maxAge: 86400
};

// ================================================================
// CORS MUST BE BEFORE API ROUTES
// ================================================================
app.use(
  cors(
    corsOptions
  )
);

// ================================================================
// EXPLICIT PREFLIGHT HANDLING
// ================================================================
//
// Browser sends OPTIONS before some
// GET/POST/PUT/PATCH/DELETE requests.
//
// This must be handled before routes.
// ================================================================
app.options(
  "*",
  cors(
    corsOptions
  )
);

// ================================================================
// HELMET SECURITY
// ================================================================
app.use(
  helmet({

    crossOriginEmbedderPolicy:
      false,

    crossOriginResourcePolicy: {
      policy:
        "cross-origin"
    },

    contentSecurityPolicy: {

      directives: {

        defaultSrc: [
          "'self'"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://jsdelivr.net"
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://jsdelivr.net"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "http:"
        ],

        connectSrc: [
          "'self'",

          "https://api-rishabh.vanisystems.in",

          "https://rishabh.vanisystems.in",

          "https://vani-systems-ouit.vercel.app",

          "https://razorpay.com",

          "https://api.razorpay.com",

          "http://localhost:5000",

          "http://127.0.0.1:5000"
        ],

        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",
          "https://gstatic.com"
        ],

        objectSrc: [
          "'none'"
        ],

        mediaSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "http:"
        ],

        frameSrc: [
          "'self'",
          "https://razorpay.com"
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
    }
  })
);

// ================================================================
// RATE LIMITING
// ================================================================
const limiter =
  rateLimit({

    windowMs:
      Number(
        process.env.RATE_LIMIT_WINDOW_MS
      ) ||
      15 * 60 * 1000,

    max:
      Number(
        process.env.RATE_LIMIT_MAX_REQUESTS
      ) ||
      5000,

    message: {
      error:
        "Too many requests from this IP, please try again later."
    },

    standardHeaders:
      true,

    legacyHeaders:
      false
  });

// Apply rate limit to API
app.use(
  "/api/",
  limiter
);

// ================================================================
// BODY PARSER
// ================================================================
app.use(
  express.json({
    limit: "50mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb"
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
  process.env.NODE_ENV ===
  "development"
) {

  app.use(
    morgan("dev")
  );

} else {

  app.use(
    morgan("combined")
  );
}

// ================================================================
// ROOT API
// ================================================================
app.get(
  "/",
  (req, res) => {

    res.status(200).json({
      status: "success",

      message:
        "Vani Systems API is running",

      api:
        "https://api-rishabh.vanisystems.in",

      frontend:
        "https://rishabh.vanisystems.in",

      environment:
        process.env.NODE_ENV ||
        "production",

      timestamp:
        new Date().toISOString()
    });
  }
);

// ================================================================
// HEALTH CHECK
// ================================================================
app.get(
  "/api/health",
  (req, res) => {

    res.status(200).json({

      status:
        "success",

      message:
        "Server is running",

      timestamp:
        new Date().toISOString(),

      environment:
        process.env.NODE_ENV ||
        "production"
    });
  }
);

// ================================================================
// CORS TEST
// ================================================================
app.get(
  "/api/cors-test",
  (req, res) => {

    res.status(200).json({

      success:
        true,

      message:
        "CORS is working correctly.",

      requestOrigin:
        req.headers.origin ||
        null,

      allowedOrigins:
        uniqueAllowedOrigins,

      timestamp:
        new Date().toISOString()
    });
  }
);

// ================================================================
// SOCKET.IO
// ================================================================
const io =
  new Server(
    httpServer,
    {

      cors: {

        origin:
          function (
            origin,
            callback
          ) {

            if (!origin) {
              return callback(
                null,
                true
              );
            }

            if (
              uniqueAllowedOrigins.includes(
                origin
              )
            ) {

              return callback(
                null,
                true
              );
            }

            console.error(
              `Socket.IO CORS blocked: ${origin}`
            );

            return callback(
              new Error(
                "Socket.IO CORS origin not allowed"
              )
            );
          },

        methods: [
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "PATCH",
          "OPTIONS"
        ],

        credentials:
          true
      },

      transports: [
        "websocket",
        "polling"
      ]
    }
  );

// ================================================================
// MAKE SOCKET.IO AVAILABLE TO ROUTES
// ================================================================
app.set(
  "io",
  io
);

// ================================================================
// SOCKET.IO CONNECTION
// ================================================================
io.on(
  "connection",
  (socket) => {

    console.log(
      `User connected: ${socket.id}`
    );

    // ------------------------------------------------------------
    // USER ROOM
    // ------------------------------------------------------------
    socket.on(
      "join-user-room",
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

    // ------------------------------------------------------------
    // ADMIN ROOM
    // ------------------------------------------------------------
    socket.on(
      "join-admin-room",
      () => {

        socket.join(
          "admin-room"
        );

        console.log(
          "Admin joined admin room"
        );
      }
    );

    // ------------------------------------------------------------
    // DISCONNECT
    // ------------------------------------------------------------
    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          `User disconnected: ${socket.id} - ${reason}`
        );
      }
    );
  }
);

// ================================================================
// API ROUTES
// ================================================================

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Admin
app.use(
  "/api/admin",
  adminRoutes
);

// Users
app.use(
  "/api/users",
  userRoutes
);

// Products
app.use(
  "/api/products",
  productRoutes
);

// Orders
app.use(
  "/api/orders",
  orderRoutes
);

// Payments
app.use(
  "/api/payments",
  paymentRoutes
);

// Cart
app.use(
  "/api/cart",
  cartRoutes
);

// Wishlist
app.use(
  "/api/wishlist",
  wishlistRoutes
);

// Addresses
app.use(
  "/api/addresses",
  addressRoutes
);

// Notifications
app.use(
  "/api/notifications",
  notificationRoutes
);

// Coupons
app.use(
  "/api/coupons",
  couponRoutes
);

// Dashboard
app.use(
  "/api/dashboard",
  dashboardRoutes
);

// Candidates
app.use(
  "/api/candidates",
  candidateRoutes
);

// Gallery
app.use(
  "/api/gallery",
  galleryRoutes
);

// ================================================================
// ROUTE LOG
// ================================================================
console.log(
  "================================================"
);

console.log(
  "API ROUTES MOUNTED"
);

console.log(
  "/api/auth"
);

console.log(
  "/api/admin"
);

console.log(
  "/api/users"
);

console.log(
  "/api/products"
);

console.log(
  "/api/orders"
);

console.log(
  "/api/payments"
);

console.log(
  "/api/cart"
);

console.log(
  "/api/wishlist"
);

console.log(
  "/api/addresses"
);

console.log(
  "/api/notifications"
);

console.log(
  "/api/coupons"
);

console.log(
  "/api/dashboard"
);

console.log(
  "/api/candidates"
);

console.log(
  "/api/gallery"
);

console.log(
  "================================================"
);

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
// PORT
// ================================================================
const PORT =
  Number(
    process.env.PORT
  ) || 5000;

// ================================================================
// START SERVER
// ================================================================
const startServer =
  async () => {

    try {

      // ----------------------------------------------------------
      // CONNECT DATABASE
      // ----------------------------------------------------------
      await connectDB();

      console.log(
        "MongoDB connected successfully."
      );

      // ----------------------------------------------------------
      // START HTTP SERVER
      // ----------------------------------------------------------
      httpServer.listen(
        PORT,
        "0.0.0.0",
        () => {

          console.log(
            "================================================"
          );

          console.log(
            `Server running on port ${PORT}`
          );

          console.log(
            `NODE_ENV: ${
              process.env.NODE_ENV ||
              "production"
            }`
          );

          console.log(
            "API Base URL:"
          );

          console.log(
            "https://api-rishabh.vanisystems.in"
          );

          console.log(
            "Frontend URL:"
          );

          console.log(
            "https://rishabh.vanisystems.in"
          );

          console.log(
            "Health URL:"
          );

          console.log(
            "https://api-rishabh.vanisystems.in/api/health"
          );

          console.log(
            "CORS Test URL:"
          );

          console.log(
            "https://api-rishabh.vanisystems.in/api/cors-test"
          );

          console.log(
            "Uploads:"
          );

          console.log(
            "/uploads"
          );

          console.log(
            "/api/uploads"
          );

          console.log(
            "================================================"
          );
        }
      );

    } catch (error) {

      console.error(
        "Failed to start server:",
        error
      );

      process.exit(1);
    }
  };

// ================================================================
// UNHANDLED PROMISE REJECTION
// ================================================================
process.on(
  "unhandledRejection",
  (err) => {

    console.error(
      "Unhandled Rejection:",
      err.message
    );

    httpServer.close(
      () => {
        process.exit(1);
      }
    );
  }
);

// ================================================================
// UNCAUGHT EXCEPTION
// ================================================================
process.on(
  "uncaughtException",
  (err) => {

    console.error(
      "Uncaught Exception:",
      err.message
    );

    process.exit(1);
  }
);

// ================================================================
// START APPLICATION
// ================================================================
startServer();

// ================================================================
// EXPORT
// ================================================================
module.exports = {
  app,
  io
};
