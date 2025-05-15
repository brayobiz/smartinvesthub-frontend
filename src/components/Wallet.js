import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BalanceContext } from '../BalanceContext';
import './Wallet.css';

const Wallet = () => {
  const { wallet, fetchWallet } = useContext(BalanceContext);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [statistics, setStatistics] = useState([]);
  const [fundingDetails, setFundingDetails] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [exchangeRewards, setExchangeRewards] = useState([]);
  const [depositStatus, setDepositStatus] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setProductsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Please log in to view your wallet.');
          setLoading(false);
          setProductsLoading(false);
          return;
        }

        const [statsRes, fundingRes, withdrawalRes, rewardRes, depositRes, productsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/statistics/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/funding-details/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/withdrawal-history/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/exchange-rewards/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/deposit-status/', { headers: { Authorization: `Token ${token}` } }),
          axios.get('http://localhost:8000/api/user-products/', { headers: { Authorization: `Token ${token}` } }),
        ]);

        setStatistics(statsRes.data.trend || []);
        setFundingDetails(fundingRes.data || []);
        setWithdrawalHistory(withdrawalRes.data || []);
        setExchangeRewards(rewardRes.data || []);
        setDepositStatus(depositRes.data || []);
        setPurchasedProducts(productsRes.data || []);
      } catch (error) {
        const errorDetails = error.response
          ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
          : error.message;
        setMessage(`Error fetching wallet data: ${errorDetails}`);
        if (error.response && error.response.config.url === 'http://localhost:8000/api/user-products/') {
          setProductsError(`Failed to load purchased products: ${errorDetails}`);
        }
      } finally {
        setLoading(false);
        setProductsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount greater than 0');
      return;
    }
    setRechargeLoading(true);
    setMessage('');
    navigate('/payment-details', { state: { amount } });
    setRechargeLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault(); // Prevent form submission if used within a form
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
    if (!phoneNumber) {
      setMessage('Please enter a phone number');
      return;
    }
    setWithdrawLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/wallets/withdraw/', // Correct endpoint
        { amount, phone_number: phoneNumber },
        { headers: { Authorization: `Token ${token}` } }
      );
      setWithdrawalHistory([...withdrawalHistory, response.data]);
      setMessage('Withdrawal request submitted. Awaiting admin approval.');
      setWithdrawAmount(''); // Clear input
      setPhoneNumber(''); // Clear input
      fetchWallet(); // Refresh wallet state
    } catch (error) {
      const errorDetails = error.response
        ? `${error.response.status}: ${error.response.data.error || error.response.statusText}`
        : error.message;
      setMessage(`Withdrawal failed: ${errorDetails}`);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleViewProducts = () => {
    navigate('/my-products', { state: { purchasedProducts } });
  };

  return (
    <div className="wallet-container">
      <h2>Wallet Overview</h2>
      {message && (
        <p
          className={`message ${message.includes('failed') || message.includes('Error') ? 'error' : 'success'}`}
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
        <div className="wallet-content">
          <div className="wallet-card">
            <h3>Wallet Details</h3>
            <p><strong>Balance:</strong> {wallet.balance} KSh</p>
            <p><strong>Income:</strong> {wallet.income} KSh</p>
            <p><strong>Last Income Update:</strong> {wallet.last_income_update ? new Date(wallet.last_income_update).toLocaleString() : 'Never'}</p>
            <p><strong>Has Recharged:</strong> {wallet.has_recharged ? 'Yes' : 'No'}</p>
          </div>

          <div className="wallet-actions">
            <div className="action-card recharge-card">
              <h4>Recharge Wallet</h4>
              <input
                type="number"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="Enter amount to recharge"
                aria-label="Recharge amount"
                min="1"
                step="1"
                disabled={rechargeLoading}
                className="recharge-input"
              />
              <button
                onClick={handleRecharge}
                disabled={rechargeLoading}
                className="action-button"
                aria-label="Recharge wallet"
              >
                {rechargeLoading ? (
                  <>
                    <span className="spinner"></span> Recharging...
                  </>
                ) : (
                  'Recharge'
                )}
              </button>
            </div>
            <div className="action-card withdraw-card">
              <h4>Withdraw Income</h4>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                aria-label="Withdrawal amount"
                min="100"
                step="1"
                disabled={withdrawLoading || !wallet.has_recharged}
                className="withdraw-input"
              />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                aria-label="Phone number for withdrawal"
                disabled={withdrawLoading || !wallet.has_recharged}
                className="withdraw-input"
              />
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !wallet.has_recharged || wallet.balance <= 0}
                className="action-button"
                aria-label="Withdraw income"
              >
                {withdrawLoading ? (
                  <>
                    <span className="spinner"></span> Withdrawing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>

          <div className="options-grid">
            <div className="card">
              <h3>Statistics</h3>
              {statistics.length > 0 ? (
                <ul>
                  {statistics.map((item, index) => (
                    <li key={index}>
                      {item.date}: Balance {item.balance} KSh, Income {item.income} KSh
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No statistics available.</p>
              )}
            </div>

            <div className="card">
              <h3>Funding Details</h3>
              {fundingDetails.length > 0 ? (
                <ul>
                  {fundingDetails.map((item) => (
                    <li key={item.id}>
                      {item.amount} KSh - {item.date} ({item.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No funding details available.</p>
              )}
            </div>

            <div className="card">
              <h3>My Products</h3>
              {productsLoading ? (
                <div className="spinner-container" role="alert">
                  <span className="spinner"></span> Loading products...
                </div>
              ) : productsError ? (
                <p className="error">{productsError}</p>
              ) : (
                <>
                  <button
                    className="action-button"
                    onClick={handleViewProducts}
                    aria-label="View my purchased products"
                    disabled={purchasedProducts.length === 0}
                  >
                    View Products
                  </button>
                  {purchasedProducts.length === 0 && <p>No purchased products yet.</p>}
                </>
              )}
            </div>

            <div className="card">
              <h3>Withdrawal History</h3>
              {withdrawalHistory.length > 0 ? (
                <ul>
                  {withdrawalHistory.map((item) => (
                    <li key={item.id}>
                      {item.amount} KSh - {item.date} ({item.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No withdrawal history available.</p>
              )}
            </div>

            <div className="card">
              <h3>Exchange Rewards</h3>
              {exchangeRewards.length > 0 ? (
                <ul>
                  {exchangeRewards.map((item) => (
                    <li key={item.id}>
                      {item.amount} KSh - {item.date} ({item.type})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No exchange rewards available.</p>
              )}
            </div>

            <div className="card">
              <h3>Deposit Status</h3>
              {depositStatus.length > 0 ? (
                <ul>
                  {depositStatus.map((item) => (
                    <li key={item.id}>
                      {item.amount} KSh - {item.date} ({item.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No deposit status available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;