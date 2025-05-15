import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { BalanceContext } from '../BalanceContext';
import './PaymentDetails.css';

const PaymentDetails = () => {
  const { fetchWallet } = useContext(BalanceContext);
  const [message, setMessage] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const amount = location.state?.amount || 0;

  const paymentDetails = {
    phone_number: '+254736196188',
    recipient_name: 'Brian Kangogo',
    instructions: [
      '1. Open M-Pesa on your phone.',
      '2. Select "Send Money".',
      '3. Enter the phone number above.',
      '4. Confirm the recipient name matches "Brian Kangogo" (ask the recipient if necessary).',
      '5. Enter the amount.',
      '6. Complete the transaction.',
      '7. Immediately send the full transaction confirmation message to the above number on WhatsApp.'
    ]
  };

  useEffect(() => {
    setLoading(false);
    if (!location.state?.amount) {
      setMessage('No amount specified. Please go back to the Wallet page and enter an amount.');
    }
  }, [location.state]);

  const handleCopyPhoneNumber = async () => {
    try {
      await navigator.clipboard.writeText(paymentDetails.phone_number);
      setCopySuccess('Phone number copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy phone number.');
      setTimeout(() => setCopySuccess(''), 2000);
      console.error('Copy error:', err);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!isNameConfirmed) {
      setMessage('Please confirm the recipient name before proceeding.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/recharge/',
        {
          amount: amount,
          phone_number: paymentDetails.phone_number,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessage(response.data.message);
      startPollingStatus(response.data.transaction_id);
    } catch (error) {
      const errorDetails = error.response
        ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
        : error.message;
      setMessage(`Failed to confirm payment: ${errorDetails}`);
      console.error('Payment confirmation error:', error);
      setLoading(false);
    }
  };

  const startPollingStatus = (transactionId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/recharge-status/${transactionId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        });
        setMessage(`Payment status: ${response.data.status}`);
        if (response.data.status === 'Completed') {
          clearInterval(interval);
          setMessage('Payment verified! Balance updated.');
          fetchWallet();
          setLoading(false);
          setTimeout(() => navigate('/wallet'), 2000);
        } else if (response.data.status === 'Failed') {
          clearInterval(interval);
          setMessage('Payment failed. Please contact support.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error polling status:', error);
        setMessage('Error checking payment status. Please wait.');
      }
    }, 5000);
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      {message && (
        <p className={`message ${message.includes('failed') || message.includes('Error') ? 'error' : 'success'}`} role="alert">
          {message}
        </p>
      )}
      {copySuccess && (
        <p className={`message ${copySuccess.includes('Failed') ? 'error' : 'success'}`} role="alert">
          {copySuccess}
        </p>
      )}
      {loading ? (
        <div className="spinner-container">
          <span className="spinner"></span> Processing...
        </div>
      ) : (
        <>
          <div className="payment-card">
            <h3>Payment Instructions</h3>
            <p><strong>Amount:</strong> {amount} KSh</p>
            <p className="phone-number-row">
              <strong>Phone Number:</strong> {paymentDetails.phone_number}{' '}
              <button onClick={handleCopyPhoneNumber} className="copy-button" aria-label="Copy phone number">
                Copy
              </button>
            </p>
            <p><strong>Recipient Name:</strong> {paymentDetails.recipient_name}</p>
            {paymentDetails.instructions.map((instruction, index) => (
              <p key={index}>{instruction}</p>
            ))}
            <div className="confirmation-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={isNameConfirmed}
                  onChange={(e) => setIsNameConfirmed(e.target.checked)}
                  aria-label="Confirm recipient name is Brian Kangogo"
                />
                I confirm the recipient name is {paymentDetails.recipient_name}
              </label>
            </div>
            <button
              onClick={handlePaymentConfirmation}
              disabled={loading || !isNameConfirmed}
              className="action-button"
              aria-label="Confirm payment instructions"
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                'Confirm Payment Instructions'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentDetails;