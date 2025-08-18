import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

// IMPROVED CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  process.env.CLIENT_URL,
  // Add your actual frontend Vercel URL here
  'https://your-frontend-app.vercel.app' // Replace with actual URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Add preflight handling
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    allowedOrigins: allowedOrigins
  });
});

console.log("MONGO_URI from .env:", process.env.MONGO_URI ? "Set" : "Not Set");
console.log("CLIENT_URL from .env:", process.env.CLIENT_URL);
console.log("Allowed Origins:", allowedOrigins);

// MongoDB connection with caching for serverless
let cachedDb = null;

async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    
    // Disconnect if there's an existing connection in a bad state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    cachedDb = conn;
    console.log('✅ MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    cachedDb = null;
    throw error;
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running successfully!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    cors: 'enabled'
  });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', req.body);
    
    await connectDB();
    
    const { name, admissionNo, branch, phone, email } = req.body;

    // Validation
    if (!name || !admissionNo || !branch || !phone || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill all the fields." 
      });
    }

    if (!/^\d{6}$/.test(admissionNo)) {
      return res.status(400).json({ 
        success: false, 
        message: "Admission number must be exactly 6 digits." 
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: "Phone number must be exactly 10 digits." 
      });
    }

    // Email validation
    if (!/^([a-zA-Z0-9._%+-]+)@(gmail\.com|thapar\.edu)$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email must be a valid '@gmail.com' or '@thapar.edu' address." 
      });
    }

    // Check for existing user
    const existing = await User.findOne({ 
      $or: [{ email }, { admissionNo }] 
    });
    
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: "You have already registered." 
      });
    }

    // Create new user
    const user = new User({ name, admissionNo, branch, phone, email });
    await user.save();
    
    console.log('✅ User registered successfully:', email);
    
    return res.status(201).json({ 
      success: true, 
      message: "Registered successfully!" 
    });

  } catch (err) {
    console.error('❌ Registration Error:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data provided." 
      });
    }
    
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "User already exists." 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again later." 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Internal server error." 
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
