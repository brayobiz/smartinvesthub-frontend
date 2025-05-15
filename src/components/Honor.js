import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Honor.css'; // Assuming a new CSS file

const Honor = () => {
  const [referral, setReferral] = useState({ vip_level: '', referrals_count: 0, referral_code: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Please log in to view your honor status.');
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:8000/api/referral/', {
          headers: { Authorization: `Token ${token}` },
        });
        setReferral(res.data[0] || { vip_level: '', referrals_count: 0, referral_code: '' }); // Handle list response
        setLoading(false);
      } catch (err) {
        const errorDetails = err.response
          ? `${err.response.status}: ${err.response.data.error || err.response.statusText}`
          : err.message;
        console.error('Error fetching referral:', errorDetails);
        setMessage(`Failed to load referral data: ${errorDetails}`);
        setLoading(false);
      }
    };

    fetchReferral();
  }, []);

  const getRewards = () => {
    if (referral.vip_level === 'VIP0') return 'No rewards yet. Refer friends to unlock!';
    if (referral.vip_level === 'VIP1') return 'Bonus: 500 KSh added to your wallet';
    if (referral.vip_level === 'VIP2') return 'Bonus: 1000 KSh + 5% extra daily income';
    if (referral.vip_level === 'VIP3') return 'Bonus: 2000 KSh + 10% extra daily income';
    return 'No rewards available';
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referral.referral_code).then(() => {
      setCopied(true);
      setMessage('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }).catch((err) => {
      setMessage('Failed to copy referral code.');
      console.error('Copy error:', err);
    });
  };

  const claimReward = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in to claim rewards.');
        return;
      }
      setLoading(true);
      const res = await axios.post(
        'http://localhost:8000/api/referral/claim/',
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage(res.data.message || 'Reward claimed successfully!');
      setTimeout(() => setMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      const errorDetails = err.response
        ? `${err.response.status}: ${err.response.data.error || err.response.statusText}`
        : err.message;
      setMessage(`Failed to claim reward: ${errorDetails}`);
      setLoading(false);
    }
  };

  return (
    <div className="honor-container">
      <h2>Honor & Rewards</h2>
      {message && (
        <p className={`message ${message.includes('failed') ? 'error' : 'success'}`} role="alert">
          {message}
        </p>
      )}
      {loading ? (
        <div className="spinner-container">
          <span className="spinner"></span> Loading...
        </div>
      ) : (
        <div className="honor-card">
          <p><strong>VIP Level:</strong> {referral.vip_level || 'N/A'}</p>
          <p><strong>Referrals:</strong> {referral.referrals_count || 0}</p>
          <p><strong>Referral Code:</strong> {referral.referral_code || 'N/A'}
            <button
              className="copy-button"
              onClick={copyReferralCode}
              disabled={!referral.referral_code || copied}
              aria-label="Copy referral code"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </p>
          <p><strong>Rewards:</strong> {getRewards()}</p>
          <button
            className="action-button"
            onClick={claimReward}
            disabled={loading || referral.vip_level === 'VIP0'}
            aria-label="Claim reward"
          >
            {loading ? <><span className="spinner"></span> Claiming...</> : 'Claim Reward'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Honor;