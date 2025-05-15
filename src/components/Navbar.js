import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ location }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/products', label: 'PRODUCTS' },
    { path: '/honor', label: 'HONOR' },
    { path: '/wallet', label: 'WALLET' },
    { path: '/my-page', label: 'MY' }, // Updated to match App.js route
  ];

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={location === item.path ? 'active' : ''}
          onClick={() => navigate(item.path)}
          aria-label={`Navigate to ${item.label}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;