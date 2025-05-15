import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending login request with:', { username, password });
      const res = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Login Response:', res.data);
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        console.log('Token saved to localStorage:', token);
        const from = location.state?.from?.pathname || '/';
        console.log('Redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        setMessage('No token received from server');
      }
    } catch (error) {
      console.error('Login Error:', error.response ? error.response.status : 'No status', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p className="error">{message}</p>}
      <p>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
};

export default Login;