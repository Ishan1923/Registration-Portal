import React, { useState } from 'react';

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

  // ⭐⭐⭐ FIX: Define backendUrl using environment variable ⭐⭐⭐
  // For Create React App, environment variables must start with REACT_APP_
  // In development, this will come from your .env file (e.g., REACT_APP_BACKEND_URL=http://localhost:5000)
  // In production (on Vercel), this will come from the environment variable you set in Vercel's dashboard.
  // const backendBaseUrl = process.env.REACT_APP_BACKEND_URL;
  const apiUrl = process.env.REACT_APP_API_URL;

  // Optional: A fallback for extreme cases, though usually not needed if .env is set up
  // if (!backendBaseUrl) {
  //   console.warn("REACT_APP_BACKEND_URL is not set. Using a fallback for development.");
  //   backendBaseUrl = "http://localhost:5000";
  // }
  // ⭐⭐⭐ END FIX ⭐⭐⭐

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
    if (!formData.email.includes("@")) newErrors.email = "Email must contain '@'";

    return newErrors;
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // ⭐⭐⭐ FIX: Use the environment variable for the fetch URL ⭐⭐⭐
      const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      // ⭐⭐⭐ END FIX ⭐⭐⭐

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setFormData({
          name: '',
          admissionNo: '',
          branch: '',
          phone: '',
          email: '',
        });
        setErrors({});
        setSubmitted(false);
      } else {
        setErrors({ general: data.message });
      }
    } catch (err) {
      // Improved error logging for debugging network issues
      console.error("Fetch error:", err);
      setErrors({ general: "Something went wrong. Try again later." });
    }
  };

  return (
    <>
      <style>{`
/* Base styles for all screen sizes */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: linear-gradient(to bottom right, #f0faff, #e6f4ff, #ffffff);
  font-family: Arial, sans-serif;
  min-height: 100vh;
}

.container {
  max-width: 500px;
  margin: 60px auto;
  background: white;
  padding: 30px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.logo {
  width: 80px;
  display: block;
  margin: 0 auto 15px auto;
}
.logo-section {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #003366;
  margin-top: 10px;
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
}

label {
  font-weight: bold;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  transition: background-color 0.3s, border-color 0.3s;
}

input:focus {
  background-color: #e6f3ff;
  border-color: #66aaff;
  outline: none;
}

button {
  width: 100%;
  background-color: #0066cc;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: #004d99;
}

.error {
  color: red;
  font-size: 13px;
  margin-top: -12px;
  margin-bottom: 12px;
}

.message {
  margin-top: 15px;
  text-align: center;
  font-size: 17px;
  font-weight: bold;
}

.success {
  color: green;
}

.fail {
  color: red;
}

.thank-you {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #2b7a2b;
  padding: 40px 10px;
}

/* ⭐⭐⭐ Responsive Styles (Media Queries) ⭐⭐⭐ */

/* For screens smaller than 600px (e.g., mobile phones) */
@media (max-width: 600px) {
  .container {
    max-width: 90%; /* Adjust width to take up more space on smaller screens */
    margin: 30px auto; /* Reduce top/bottom margin */
    padding: 20px 15px; /* Reduce padding */
  }

  .logo {
    width: 60px; /* Make logo slightly smaller */
  }

  .title {
    font-size: 20px; /* Slightly smaller title */
  }

  h2 {
    font-size: 20px; /* Slightly smaller heading */
    margin-bottom: 20px;
  }

  input, button {
    font-size: 14px; /* Adjust font size for inputs and buttons */
    padding: 10px;
  }

  .message, .error {
    font-size: 14px; /* Adjust message/error font size */
  }

  .thank-you {
    font-size: 18px; /* Adjust thank you message font size */
    padding: 30px 10px;
  }
}

/* For even smaller screens (e.g., very small phones) */
@media (max-width: 400px) {
  .container {
    margin: 15px auto;
    padding: 15px 10px;
  }

  .logo {
    width: 50px;
  }

  .title {
    font-size: 18px;
  }

  h2 {
    font-size: 18px;
  }
}

      `}</style>

      <div className="container">
        <div className="logo-section">
          {/* Ensure 'istelogo.png' is in your 'public' folder or provide a full path */}
          <img src="istelogo.png" alt="ISTE Logo" className="logo" />
          <h2 className="title">ISTE Registration</h2>
        </div>

        {successMessage === "Registered successfully" ? (
          <div className="thank-you">Thank you for registering!</div>
        ) : (
          <form onSubmit={handleSubmit}>

            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
            {submitted && errors.name && <div className="error">{errors.name}</div>}

            <label>Admission Number</label>
            <input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleChange} />
            {submitted && errors.admissionNo && <div className="error">{errors.admissionNo}</div>}

            <label>Branch</label>
            <input type="text" name="branch" value={formData.branch} onChange={handleChange} />
            {submitted && errors.branch && <div className="error">{errors.branch}</div>}

            <label>Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            {submitted && errors.phone && <div className="error">{errors.phone}</div>}

            <label>Email ID</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            {submitted && errors.email && <div className="error">{errors.email}</div>}

            <button type="submit">Register</button>

            {/* ✅ Server response message shown here below the button */}
            {errors.general && <p className="message fail">{errors.general}</p>}
            {successMessage && <p className="message success">{successMessage}</p>}

          </form>
        )}
      </div>
    </>
  );
}

export default App;