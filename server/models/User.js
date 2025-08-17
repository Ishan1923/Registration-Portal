import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  admissionNo: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{6}$/, 'Admission number must be exactly 6 digits.'] 
  },
  branch: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    required: true, 
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits.'] 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^([a-zA-Z0-9._%+-]+)@(gmail\.com|thapar\.edu)$/, "Email must be a valid '@gmail.com' or '@thapar.edu' address."]
  }
});

export default mongoose.model('User', userSchema);
