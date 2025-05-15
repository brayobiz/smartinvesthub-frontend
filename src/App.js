import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BalanceProvider } from './BalanceContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Products from './components/Products';
import Wallet from './components/Wallet';
import MyPage from './components/MyPage';
import Honor from './components/Honor';
import Login from './components/Login';
import Register from './components/Register';
import PaymentDetails from './components/PaymentDetails';
import MyTeam from './components/MyTeam';
import Support from './components/Support';
import About from './components/About';
import MyProducts from './components/MyProducts';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

// Custom hook for authentication
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setLoading(false);
    } else {
      setIsAuthenticated(!!token);
      axios.get('http://localhost:8000/api/user-profile/', {
        headers: { Authorization: `Token ${token}` },
      })
        .then(response => {
          console.log('User Profile Response:', response.data);
          const adminStatus = response.data.is_staff || response.data.is_superuser || false;
          setIsAdmin(adminStatus);
          console.log('isAdmin set to:', adminStatus);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          setIsAdmin(false);
        })
        .finally(() => setLoading(false));
    }
  }, [location]);

  return { isAuthenticated, isAdmin, loading };
};

const AppContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait for loading to complete before rendering Routes
  if (loading) return <div>Loading...</div>;

  return (
    <BalanceProvider>
      {isAuthenticated && <Navbar location={location.pathname} />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/honor" element={isAuthenticated ? <Honor /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/wallet" element={isAuthenticated ? <Wallet /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/my-page" element={isAuthenticated ? <MyPage /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/my-team" element={isAuthenticated ? <MyTeam /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/support" element={isAuthenticated ? <Support /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/about" element={isAuthenticated ? <About /> : <Navigate to="/login" state={{ from: location }} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/payment-details"
          element={isAuthenticated ? <PaymentDetails /> : <Navigate to="/login" state={{ from: location }} />}
        />
        <Route
          path="/my-products"
          element={isAuthenticated ? <MyProducts /> : <Navigate to="/login" state={{ from: location }} />}
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin
              ? <AdminDashboard />
              : <Navigate to="/login" state={{ from: location }} />
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} state={{ from: location }} />} />
      </Routes>
    </BalanceProvider>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;