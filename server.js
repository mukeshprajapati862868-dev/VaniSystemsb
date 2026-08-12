// ================================================================
// CORS CONFIGURATION
// ================================================================

const productionFrontend = "https://rishabh.vanisystems.in";

const localFrontend = "http://localhost:5173";

const allowedOrigins = [
  localFrontend,
  "http://127.0.0.1:5173",
  "http://rishabh.vanisystems.in",
  productionFrontend,
  "https://vani-systems-ouit.vercel.app"
];

// ================================================================
// ADD .ENV CORS ORIGINS
// ================================================================

if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  envOrigins.forEach((origin) => {
    if (!allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

// ================================================================
// REMOVE DUPLICATES
// ================================================================

const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins)
];

// ================================================================
// LOG CORS
// ================================================================

console.log("Allowed CORS Origins:");

uniqueAllowedOrigins.forEach((origin) => {
  console.log(` - ${origin}`);
});

// ================================================================
// CORS OPTIONS
// ================================================================

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests without Origin
    // Example: Postman, curl, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    // Allow approved frontend
    if (uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

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
// CORS MIDDLEWARE
// IMPORTANT: BEFORE API ROUTES
// ================================================================

app.use(cors(corsOptions));

// ================================================================
// DO NOT USE:
// app.options("*", cors(corsOptions));
//
// Express 5 gives:
// PathError: Missing parameter name at index 1: *
// ================================================================

// ================================================================
// EXPRESS 5 SAFE PREFLIGHT
// ONLY USE THIS IF EXPLICIT OPTIONS HANDLING IS REQUIRED
// ================================================================

// app.options(/.*/, cors(corsOptions));
