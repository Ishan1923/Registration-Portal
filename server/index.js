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
app.use(cors({
    origin: process.env.CLIENT_URL
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

console.log("MONGO_URI from .env:", process.env.MONGO_URI);

// Efficient MongoDB connection for serverless (caching)
let cachedDb = null;
async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    cachedDb = conn;
    console.log('✅ MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.post('/register', async (req, res) => {
  await connectDB(); // Ensure DB connection (important for serverless)

  const { name, admissionNo, branch, phone, email } = req.body;

  if (!name || !admissionNo || !branch || !phone || !email) {
    return res.status(400).json({ success: false, message: "Please fill all the fields." });
  }

  if (!/^\d{6}$/.test(admissionNo)) {
    return res.status(400).json({ success: false, message: "Admission number must be exactly 6 digits." });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits." });
  }

  // Improved email validation: must be @gmail.com or @thapar.edu
  if (!/^([a-zA-Z0-9._%+-]+)@(gmail\.com|thapar\.edu)$/.test(email)) {
    return res.status(400).json({ success: false, message: "Email must be a valid '@gmail.com' or '@thapar.edu' address." });
  }

  const existing = await User.findOne({ $or: [{ email }, { admissionNo }] });
  if (existing) {
    return res.status(409).json({ success: false, message: "You have already registered." });
  }

  try {
    const user = new User({ name, admissionNo, branch, phone, email });
    await user.save();
    return res.status(201).json({ success: true, message: "Registered successfully!" });
  } catch (err) {
    console.error('❌ Registration Error:', err.message);
    return res.status(500).json({ success: false, message: "Registration failed. Try again later." });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// *******************************************************************// *******************************************************************
// CRUCIAL ADDITION FOR VERCEL SERVERLESS FUNCTIONS// CRUCIAL ADDITION FOR VERCEL SERVERLESS FUNCTIONS
// *******************************************************************// *******************************************************************
export default app; // For ES Modulesexport default app; // For ES Modules
// If you were using CommonJS (require/module.exports), it would be:// If you were using CommonJS (require/module.exports), it would be:
// module.exports = app;