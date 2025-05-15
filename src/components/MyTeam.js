import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyTeam.css';

const MyTeam = () => {
  const [referral, setReferral] = useState({ referral_code: '', vip_level: 'VIP0', referrals_count: 0, invitees: [] });
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

        // Fetch referral data with invitees
        const referralRes = await axios.get('http://localhost:8000/api/referral/', {
          headers: { Authorization: `Token ${token}` },
        });
        const referralData = referralRes.data[0] || { referral_code: '', vip_level: 'VIP0', referrals_count: 0, invitees: [] };
        const inviteeUsernames = referralData.invitees.map(invitee => invitee.username || 'Unknown');
        setReferral({ ...referralData, invitees: inviteeUsernames });
      } catch (error) {
        const errorDetails = error.response
          ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
          : error.message;
        setMessage(`Failed to fetch team data: ${errorDetails}`);
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

  return (
    <div className="my-team-container">
      <h2>My Team</h2>
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
        <div className="team-content">
          <div className="team-card">
            <h3>Team Overview</h3>
            <p><strong>Total Referrals:</strong> {referral.referrals_count}</p>
            {referral.invitees.length > 0 ? (
              <div className="referral-details">
                <h4>Referees:</h4>
                <ul>
                  {referral.invitees.map((invitee, index) => (
                    <li key={index}>{invitee}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No referees yet.</p>
            )}
          </div>
          <button
            className="action-button"
            onClick={() => navigate('/my-page')}
            aria-label="Back to profile"
          >
            Back to Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default MyTeam;