import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure this import exists

// Footer component
function Footer() {
  const currentYear = new Date().getFullYear(); 

  const footerStyle = {
    width: '100%',
    textAlign: 'center',
    padding: '2rem 1rem',
    marginTop: 'auto',
    color: '#a1a1a6',
    fontSize: '0.9rem',
  };

  const linkStyle = {
    color: '#f5f5f7',
    textDecoration: 'none',
    fontWeight: '500',
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; {currentYear} ISTE Student Chapter. All Rights Reserved.</p>
      <p>
        Developed with ❤️ in Patiala by{' '}
        <a href="https://github.com/ishan-pathak-23" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Ishan Pathak
        </a>
      </p>
    </footer>
  );
}

function App() {
  const [formData, setFormData] = useState({
    name: '',
    admissionNo: '',
    branch: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Use environment variable if available, otherwise fallback to hardcoded URL
  const backendBaseUrl = process.env.REACT_APP_BACKEND_URL || 'https://reg-portal-backend.vercel.app';

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!/^\d{6}$/.test(formData.admissionNo)) newErrors.admissionNo = "Admission number must be 6 digits";
    if (!formData.branch.trim()) newErrors.branch = "Branch is required";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits";
    if (!/^([a-zA-Z0-9._%+-]+)@(gmail\.com|thapar\.edu)$/.test(formData.email)) {
      newErrors.email = "Email must be a valid '@gmail.com' or '@thapar.edu' address";
    }
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Sending request to:', `${backendBaseUrl}/register`);
      console.log('Request data:', formData);
      
      const res = await fetch(`${backendBaseUrl}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        mode: 'cors', // Explicitly set CORS mode
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      let data;
      try {
        data = await res.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid response');
      }

      if (res.ok && data.success) {
        setSuccessMessage(data.message || "Registration successful! Welcome to ISTE!");
        setFormData({ name: '', admissionNo: '', branch: '', phone: '', email: '' });
        setErrors({});
        setSubmitted(false);
      } else {
        const errorMessage = data.message || data.error || `Server error: ${res.status}`;
        setErrors({ general: errorMessage });
        setSuccessMessage('');
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Network error. Please check your connection and try again.";
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else if (err.message.includes('CORS')) {
        errorMessage = "CORS error. Please contact administrator.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({ general: errorMessage });
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccessMessage('');
    setFormData({ name: '', admissionNo: '', branch: '', phone: '', email: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .container-loaded {
          animation: fadeIn 0.7s ease-out;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        .glass-effect {
          background: rgba(44, 44, 46, 0.6);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 25px rgba(0,0,0,0.25);
        }

        .input-field {
          background-color: rgba(118, 118, 128, 0.24);
          border: 1px solid transparent;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .input-field:focus {
          border-color: #0a84ff;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
          outline: none;
        }

        .input-field::placeholder {
          color: #a1a1a6;
        }

        .input-field option {
          background-color: #2c2c2e;
          color: white;
        }

        .btn-gradient {
          background: linear-gradient(45deg, #007aff, #0a84ff);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-gradient:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 122, 255, 0.2);
        }

        .btn-gradient:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        /* Ensure Tailwind classes work */
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .w-full { width: 100%; }
        .max-w-md { max-width: 28rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .p-8 { padding: 2rem; }
        .p-4 { padding: 1rem; }
        .text-white { color: white; }
        .text-center { text-align: center; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .rounded-full { border-radius: 50%; }
        .rounded-xl { border-radius: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .text-sm { font-size: 0.875rem; }
        .text-base { font-size: 1rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .text-gray-300 { color: rgb(209 213 219); }
        .text-green-400 { color: rgb(74 222 128); }
        .text-red-400 { color: rgb(248 113 113); }
        .bg-blue-500 { background-color: rgb(59 130 246); }
        .gap-2 { gap: 0.5rem; }
        .block { display: block; }
      `}</style>

      <div className={`w-full max-w-md glass-effect rounded-3xl p-8 ${isLoaded ? 'container-loaded' : 'opacity-0'}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
            I
          </div>
          <h2 className="text-2xl font-semibold text-white">ISTE Registration</h2>
          <p className="text-sm text-gray-300 mt-1">Backend: {backendBaseUrl}</p>
        </div>

        {successMessage ? (
          <div className="text-center py-8">
            <h3 className="text-xl text-green-400 mb-2 font-semibold">Thank You!</h3>
            <p className="text-gray-300 mb-6">{successMessage}</p>
            <button 
              onClick={resetForm}
              className="btn-gradient text-white px-6 py-3 rounded-xl font-medium"
            >
              Register Another Student
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              {submitted && errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Admission Number</label>
              <input 
                type="text" 
                name="admissionNo" 
                value={formData.admissionNo} 
                onChange={handleChange} 
                placeholder="e.g., 102123"
                disabled={isSubmitting}
                maxLength="6"
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              {submitted && errors.admissionNo && <div className="text-red-400 text-sm mt-1">{errors.admissionNo}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
              <select 
                name="branch" 
                value={formData.branch} 
                onChange={handleChange} 
                disabled={isSubmitting}
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              >
                <option value="">Select your branch</option>
                <option value="COE">COE - Computer Engineering</option>
                <option value="ECE">ECE - Electronics & Communication</option>
                <option value="EEE">EEE - Electrical & Electronics</option>
                <option value="ME">ME - Mechanical Engineering</option>
                <option value="CE">CE - Civil Engineering</option>
                <option value="CHE">CHE - Chemical Engineering</option>
                <option value="BT">BT - Biotechnology</option>
                <option value="IT">IT - Information Technology</option>
                <option value="CSE">CSE - Computer Science</option>
                <option value="Other">Other</option>
              </select>
              {submitted && errors.branch && <div className="text-red-400 text-sm mt-1">{errors.branch}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="10-digit mobile number"
                disabled={isSubmitting}
                maxLength="10"
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              {submitted && errors.phone && <div className="text-red-400 text-sm mt-1">{errors.phone}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email ID</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="yourname@gmail.com or yourname@thapar.edu"
                disabled={isSubmitting}
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              {submitted && errors.email && <div className="text-red-400 text-sm mt-1">{errors.email}</div>}
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn-gradient w-full py-4 rounded-xl text-white font-medium text-base flex items-center justify-center gap-2 mt-6"
            >
              {isSubmitting && <div className="loading-spinner"></div>}
              {isSubmitting ? 'Registering...' : 'Register Now'}
            </button>

            {errors.general && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-center text-sm">
                {errors.general}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
