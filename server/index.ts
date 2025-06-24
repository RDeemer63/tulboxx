import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import http from 'http';
import { db } from './db'; // For database connection check
import { sql } from 'drizzle-orm';

import { setupVite, serveStatic, log } from "./vite";
import { globalErrorHandler } from './middleware/error-middleware';
import { registerAllRoutes } from './routes'; // Step 1: Import the registerAllRoutes function

// Step 2: Individual router imports are no longer needed here as they are handled by registerAllRoutes
// import contactsRouter from "./routes/contacts";
// import { estimateRouter, templateRouter } from "./routes/estimates";
// import leadsRouter from "./routes/leads";
// import featureFlagsRouter from './routes/feature-flags'; // This is now handled within registerAllRoutes

const app = express();

// --- Startup Validation Functions ---
function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    log(`❌ Critical Error: Missing required environment variables: ${missingVars.join(', ')}`);
    log('Please ensure all required variables are set in your .env file or system environment.');
    process.exit(1); // Terminate if critical env vars are missing
  }
  log('✅ Environment variables validated.');
}

async function validateDatabaseConnection() {
  try {
    // Perform a simple query to check DB connection
    await db.execute(sql`SELECT 1`);
    log('✅ Database connection successful.');
  } catch (error) {
    log('❌ Critical Error: Failed to connect to the database.');
    if (error instanceof Error) {
      log(`Error details: ${error.message}`);
      console.error(error.stack); // Log full stack for debugging
    } else {
      log(`Unknown database connection error: ${error}`);
    }
    process.exit(1); // Terminate if DB connection fails
  }
}


// Trust proxy for rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for Vite dev
      connectSrc: ["'self'", "ws:", "wss:", "https:"], // Allow WebSocket connections for Vite HMR
    },
  },
  crossOriginEmbedderPolicy: false, 
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.REPLIT_URL || 'https://*.replit.app', 'https://*.replit.dev']
    : ['http://localhost:5000', 'http://127.0.0.1:5000', `http://localhost:${process.env.PORT || 5000}`, `http://127.0.0.1:${process.env.PORT || 5000}`],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: process.env.NODE_ENV === 'development' ? () => true : undefined,
  trustProxy: process.env.NODE_ENV === 'production',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true,
  skip: process.env.NODE_ENV === 'development' ? () => true : undefined,
  trustProxy: process.env.NODE_ENV === 'production',
});

app.use('/api/', limiter);
// TODO: Apply authLimiter specifically to authentication routes (e.g., app.use('/api/auth/login', authLimiter);)

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// -------------------- API Routes Mounting --------------------
// Step 3: Replace individual app.use() calls with a single call to registerAllRoutes(app)
registerAllRoutes(app);

// Request logging middleware (after routes to catch API calls)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args] as any);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && Object.keys(capturedJsonResponse).length > 0) {
        const bodyString = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${bodyString.length > 200 ? bodyString.substring(0,197) + "..." : bodyString }`;
      }
      log(logLine);
    }
  });
  next();
});


// Serve design mockup (if still needed)
app.get('/design-mockup.html', (_req, res) => {
  res.sendFile('design-mockup.html', { root: '.' });
});

// Global error handler - should be defined AFTER all other routes and middleware
app.use(globalErrorHandler);


(async () => {
  try {
    // Perform startup validations
    validateEnvironment();
    await validateDatabaseConnection();

    const port = process.env.PORT || 5000;
    const httpServer = http.createServer(app);

    // Setup Vite development server or serve static files for production
    if (app.get("env") === "development") {
      await setupVite(app, httpServer);
    } else {
      serveStatic(app);
    }
    
    httpServer.listen(Number(port), "0.0.0.0", () => {
      log(`🚀 Server listening on port ${port}`);
    });

  } catch (startupError) {
    log('❌ Server failed to start due to critical error during initialization.');
    if (startupError instanceof Error) {
        log(`Startup Error: ${startupError.message}`);
        console.error(startupError.stack);
    } else {
        log(`Unknown startup error: ${startupError}`);
    }
    process.exit(1);
  }
})();

// Process-level error handlers
process.on('uncaughtException', (error) => {
  log('--- UNCAUGHT EXCEPTION ---');
  log('Shutting down gracefully...');
  console.error(error);
  process.exit(1); // Mandatory (as per Node.js docs)
});

process.on('unhandledRejection', (reason, promise) => {
  log('--- UNHANDLED PROMISE REJECTION ---');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
  // For now, we'll log and exit, but in production you might want more sophisticated handling
  // or to let a process manager restart the service.
  log('Shutting down due to unhandled rejection...');
  process.exit(1);
});
