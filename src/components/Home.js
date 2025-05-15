import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import { BalanceContext } from '../BalanceContext';
import './Home.css';
import investor1 from '../images/investor1.jpg';
import investor2 from '../images/investor2.jpg';
import investor3 from '../images/investor3.jpg';

const Home = () => {
  const { wallet, fetchWallet } = useContext(BalanceContext);
  const [userData, setUserData] = useState({ username: '', phone_number: '' });
  const [products, setProducts] = useState([]);
  const [referralData, setReferralData] = useState({ referral_code: '', vip_level: 'VIP0', referrals_count: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // New state for withdrawal modal
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargePhone, setRechargePhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(''); // New state for withdrawal amount
  const [withdrawPhone, setWithdrawPhone] = useState(''); // New state for withdrawal phone number
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserData({ username: 'Guest', phone_number: '' });
          setMessage('No token found. Please log in again.');
          setLoading(false);
          return;
        }

        const [userRes, productsRes, referralRes] = await Promise.all([
          axios.get('http://localhost:8000/api/user-profile/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/user-products/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/referral/', { headers: { Authorization: `Token ${token}` } }),
        ]);

        setUserData({
          username: userRes.data.username || 'Guest',
          phone_number: userRes.data.phone_number || '',
        });
        setRechargePhone(userRes.data.phone_number || '');
        setWithdrawPhone(userRes.data.phone_number || ''); // Pre-fill withdrawal phone number
        setProducts(productsRes.data || []);
        setReferralData(referralRes.data[0] || { referral_code: '', vip_level: 'VIP0', referrals_count: 0 });
      } catch (error) {
        const errorDetails = error.response
          ? `${error.response.status}: ${error.response.data.detail || error.response.data}`
          : error.message;
        setMessage(`Failed to fetch data: ${errorDetails}`);
        setUserData({ username: 'Guest', phone_number: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount greater than 0');
      return;
    }
    setShowRechargeModal(false);
    navigate('/payment-details', { state: { amount } });
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount greater than 0');
      return;
    }
    if (amount > wallet.balance) {
      setMessage('Insufficient balance for withdrawal');
      return;
    }
    const minWithdrawal = 100;
    if (amount < minWithdrawal) {
      setMessage(`Minimum withdrawal amount is ${minWithdrawal} KSh`);
      return;
    }
    if (!withdrawPhone) {
      setMessage('Please enter a phone number');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/wallets/withdraw/',
        { amount, phone_number: withdrawPhone },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage('Withdrawal request submitted. Awaiting admin approval.');
      setWithdrawAmount(''); // Clear input
      setWithdrawPhone(userData.phone_number || ''); // Reset to default
      setShowWithdrawModal(false); // Close modal
      fetchWallet(); // Refresh wallet state
    } catch (error) {
      const errorDetails = error.response
        ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
        : error.message;
      setMessage(`Withdrawal failed: ${errorDetails}`);
    }
  };

  const handleInvite = async () => {
    try {
      const referralCode = referralData.referral_code || '';
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
            console.error('Share error:', err);
          }
        }
      } else {
        setMessage('Sharing not supported on this device. The link is copied to your clipboard.');
      }
    } catch (err) {
      setMessage('Failed to copy referral link.');
      console.error('Invite error:', err);
    }
  };

  const investorImages = [
    { url: investor3 },
    { url: investor2 },
    { url: investor1 },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'ease-in-out',
    rtl: true,
  };

  return (
    <div className="home-container">
      {loading ? (
        <div className="loading-spinner" aria-live="polite">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <>
          <h2>Welcome, {userData.username}</h2>
          {message && (
            <p className={`message ${message.includes('Failed') || message.includes('failed') ? 'error' : 'success'}`} role="alert">
              {message}
            </p>
          )}
          <div className="slide-container">
            <Slider {...settings}>
              {investorImages.map((slide, index) => (
                <div key={index}>
                  <div
                    style={{
                      backgroundImage: `url(${slide.url})`,
                    }}
                  >
                    <span>{slide.caption}</span>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="features-grid">
            <div className="card">
              <h3>Statistics</h3>
              <p>Balance: {wallet.balance} KSh</p>
              <p>Income: {wallet.income} KSh</p>
            </div>

            <button
              className="action-button"
              onClick={() => setShowRechargeModal(true)}
              aria-label="Recharge wallet"
            >
              Recharge
            </button>
            {showRechargeModal && (
              <div className="modal" onClick={() => setShowRechargeModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Recharge Wallet</h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleRecharge(); }}>
                    <label htmlFor="phone-number">
                      Phone Number:
                      <input
                        id="phone-number"
                        type="text"
                        value={rechargePhone}
                        onChange={(e) => setRechargePhone(e.target.value)}
                        placeholder="e.g., 254712345678"
                        required
                        aria-required="true"
                      />
                    </label>
                    <label htmlFor="recharge-amount">
                      Amount (KSh):
                      <input
                        id="recharge-amount"
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                        aria-required="true"
                        min="1"
                      />
                    </label>
                    <button type="submit" className="action-button">
                      Proceed to Payment
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => setShowRechargeModal(false)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}

            <button
              className="action-button"
              onClick={() => setShowWithdrawModal(true)} // Open withdrawal modal
              disabled={wallet.balance <= 0 || !wallet.has_recharged} // Disable if no balance or hasn't recharged
              aria-label="Withdraw funds"
            >
              Withdraw
            </button>
            {showWithdrawModal && (
              <div className="modal" onClick={() => setShowWithdrawModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Withdraw Funds</h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleWithdraw(); }}>
                    <label htmlFor="withdraw-phone">
                      Phone Number:
                      <input
                        id="withdraw-phone"
                        type="text"
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                        placeholder="e.g., 254712345678"
                        required
                        aria-required="true"
                      />
                    </label>
                    <label htmlFor="withdraw-amount">
                      Amount (KSh):
                      <input
                        id="withdraw-amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                        aria-required="true"
                        min="100"
                      />
                    </label>
                    <button type="submit" className="action-button">
                      Submit Withdrawal
                    </button>
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => setShowWithdrawModal(false)}
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="card">
              <h3>My Products</h3>
              {products.length > 0 ? (
                <ul>
                  {products.map((product) => (
                    <li key={product.id}>
                      {product.product.name} - Cycles Completed: {product.cycles_completed}/
                      {product.product.cycles}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No active products.</p>
              )}
            </div>

            <div className="card">
              <h3>My Team</h3>
              <p>VIP Level: {referralData.vip_level}</p>
              <p>Referrals: {referralData.referrals_count}</p>
            </div>

            <button
              className="action-button"
              onClick={handleInvite}
              aria-label="Invite friends"
            >
              Invite
            </button>
          </div>

          <div className="info-list">
            <p>Secure your future with SmartInvestHub—where smart investing meets peace of mind. Join thousands of investors growing their wealth safely and confidently!</p>
            <p>Don’t wait! Choose your Bronze, Silver, or Gold tier and start building your financial legacy today.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;