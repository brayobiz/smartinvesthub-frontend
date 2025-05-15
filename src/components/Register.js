import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // New CSS file

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract referral code from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('referral_code');
    if (code) {
      setReferralCode(code);
      setMessage(`Referral code ${code} detected. Proceed with registration to link it.`);
    }
  }, []);

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^2547\d{8}$/; // Matches 2547XXXXXXXX
    return phoneRegex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Client-side validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage('Phone number must be in the format 2547XXXXXXXX (e.g., 254712345678)');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
        phone_number: phoneNumber,
        referral_code: referralCode || '', // Send referral code if present
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      } else {
        setMessage(response.data.message || 'Registration successful');
      }
      // Optionally clear referral code after successful registration
      setReferralCode('');
    } catch (error) {
      console.error('Register error:', error);
      setMessage(error.response?.data?.error || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register for SmartInvestHub</h2>
      {message && (
        <p aria-live="polite" className={message.includes('error') ? 'error' : 'success'}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          placeholder="Choose a Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="Username"
          required
        />
        <input
          type="password"
          placeholder="Create a Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (e.g., 254712345678)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          aria-label="Phone Number"
          required
        />
        <input
          type="text"
          placeholder="Referral Code (optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          aria-label="Referral Code"
          disabled={!!new URLSearchParams(window.location.search).get('referral_code')} // Disable if from URL
        />
        <button
          type="submit"
          className="action-button"
          disabled={loading || !username || !password || !phoneNumber}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>
      <p className="login-link">
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;