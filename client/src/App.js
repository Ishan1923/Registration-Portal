import React, { useState, useEffect } from 'react';

// Footer component is now defined directly in this file
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

  // This will trigger the animation once the component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Updated backend URL
  const backendBaseUrl = 'https://reg-portal-backend.vercel.app';

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "A valid email is required";
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubmitting(true);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Updated endpoint to match your backend
      const res = await fetch(`${backendBaseUrl}/api/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && (data.success || res.status === 200)) {
        setSuccessMessage(data.message || "Registration successful! Welcome to ISTE!");
        setFormData({ name: '', admissionNo: '', branch: '', phone: '', email: '' });
        setErrors({});
        setSubmitted(false);
      } else {
         setErrors({ general: data.message || data.error || "Registration failed. Please try again." });
         setSuccessMessage('');
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ general: "Network error. Please check your connection and try again." });
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
      `}</style>

      <div className={`w-full max-w-md glass-effect rounded-3xl p-8 ${isLoaded ? 'container-loaded' : 'opacity-0'}`}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
            I
          </div>
          <h2 className="text-2xl font-semibold text-white">ISTE Registration</h2>
        </div>

        {successMessage ? (
          <div className="text-center py-8 animate-fadeIn">
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
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
              {submitted && errors.admissionNo && <div className="text-red-400 text-sm mt-1">{errors.admissionNo}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
              <input 
                type="text" 
                name="branch" 
                value={formData.branch} 
                onChange={handleChange} 
                placeholder="e.g., COE, ECE, IT"
                disabled={isSubmitting}
                className="input-field w-full px-4 py-3 rounded-xl text-white text-base"
              />
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
                placeholder="your.email@example.com"
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
