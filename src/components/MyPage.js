import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BalanceContext } from '../BalanceContext';
import './MyPage.css';

const MyPage = () => {
  const { wallet } = useContext(BalanceContext); // Removed fetchWallet
  const [userProfile, setUserProfile] = useState({ username: 'Loading...', phone_number: '' });
  const [referral, setReferral] = useState({ referral_code: '', vip_level: 'VIP0', referrals_count: 0 });
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('No token found. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const profileRes = await axios.get('http://localhost:8000/api/user-profile/', {
          headers: { Authorization: `Token ${token}` },
        });
        setUserProfile(profileRes.data || { username: 'Unknown', phone_number: '' });

        const referralRes = await axios.get('http://localhost:8000/api/referral/', {
          headers: { Authorization: `Token ${token}` },
        });
        const referralData = referralRes.data[0] || { referral_code: '', vip_level: 'VIP0', referrals_count: 0 };
        setReferral(referralData);

        const productsRes = await axios.get('http://localhost:8000/api/user-products/', {
          headers: { Authorization: `Token ${token}` },
        });
        setPurchasedProducts(productsRes.data || []);
      } catch (error) {
        const errorDetails = error.response
          ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
          : error.message;
        setMessage(`Failed to fetch data: ${errorDetails}`);
        if (error.response && error.response.status === 401) {
          setMessage('Session expired. Redirecting to login...');
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleInvite = async () => {
    try {
      const referralCode = referral.referral_code || '';
      if (!referralCode) {
        setMessage('No referral code available.');
        return;
      }

      const referralLink = `${window.location.origin}/referral/${referralCode}`;

      await navigator.clipboard.writeText(referralLink);
      setMessage('Referral link copied to clipboard!');

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join SmartInvestHub',
            text: 'Sign up with my referral link to join SmartInvestHub!',
            url: referralLink,
          });
          setMessage('Referral link shared successfully!');
        } catch (err) {
          if (err.name === 'AbortError') {
            setMessage('Share action canceled. The link is still copied to your clipboard.');
          } else {
            setMessage('Failed to share referral link. The link is copied to your clipboard.');
          }
        }
      } else {
        setMessage('Sharing not supported on this device. The link is copied to your clipboard.');
      }
    } catch (err) {
      setMessage('Failed to copy referral link.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post('http://localhost:8000/api/logout/', {}, {
        headers: { Authorization: `Token ${token}` },
      });
      localStorage.removeItem('token');
      setMessage('Logged out successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorDetails = error.response
        ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
        : error.message;
      setMessage(`Error logging out: ${errorDetails}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const nextVipLevel = () => {
    if (referral.vip_level === 'VIP0' && referral.referrals_count < 5) return 'VIP1 (Refer 5 more)';
    if (referral.vip_level === 'VIP1' && referral.referrals_count < 10) return 'VIP2 (Refer 5 more)';
    if (referral.vip_level === 'VIP2' && referral.referrals_count < 15) return 'VIP3 (Refer 5 more)';
    return 'Max Level Reached';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-Kenya', { style: 'currency', currency: 'KES' }).format(amount);
  };

  return (
    <div className="my-page-container">
      <h2>My Profile</h2>
      {message && (
        <p
          className={`message ${message.includes('Failed') || message.includes('Error') ? 'error' : 'success'}`}
          role="alert"
          aria-live="polite"
        >
          {message}
        </p>
      )}
      {loading ? (
        <div className="spinner-container" role="alert">
          <span className="spinner"></span> Loading...
        </div>
      ) : (
        <div className="profile-content">
          <div className="profile-card">
            <h3>Profile Details</h3>
            <p><strong>Username:</strong> {userProfile.username}</p>
            <p><strong>Wallet Balance:</strong> {formatCurrency(wallet.balance)}</p>
            <p><strong>Total Earnings:</strong> {formatCurrency(wallet.income)}</p>
            <p><strong>VIP Level:</strong> {referral.vip_level}</p>
            <p><strong>Referral Code:</strong> {referral.referral_code}</p>
            <p><strong>Next VIP:</strong> {nextVipLevel()}</p>
            <p><strong>Referrals:</strong> {referral.referrals_count}</p>
            <p><strong>Purchased Products:</strong> {purchasedProducts.length}</p>
          </div>

          <div className="options-grid" role="navigation">
            <button
              className="action-button"
              onClick={() => navigate('/my-team')}
              aria-label="View my team and referees"
            >
              My Team
            </button>
            <button
              className="action-button"
              onClick={() => navigate('/support')}
              aria-label="Contact support"
            >
              Support
            </button>
            <button
              className="action-button"
              onClick={handleInvite}
              aria-label="Invite friends"
            >
              Invite Friends
            </button>
            <button
              className="action-button"
              onClick={() => navigate('/about')}
              aria-label="View about us"
            >
              About Us
            </button>
            <button
              className="action-button logout-button"
              onClick={handleLogout}
              aria-label="Log out"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;