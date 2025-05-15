import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BalanceContext } from '../BalanceContext';
import './Products.css';

const Products = () => {
  const { wallet } = useContext(BalanceContext); // Removed fetchWallet
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('Please log in to view products.');
          return;
        }

        const productsRes = await axios.get('http://localhost:8000/api/products/', {
          headers: { Authorization: `Token ${token}` },
        });
        setProducts(productsRes.data);
        console.log('Fetched Products:', productsRes.data);
      } catch (err) {
        const errorDetails = err.response
          ? `${err.response.status}: ${err.response.data.error || err.response.statusText}`
          : err.message;
        console.error('Error fetching data:', errorDetails);
        setMessage(`Failed to load data: ${errorDetails}`);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount <= 0) {
      return 'Not Available';
    }
    return new Intl.NumberFormat('en-Kenya', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const openPaymentModal = (product) => {
    console.log('Selected Product for Modal:', product);
    setSelectedProduct(product);
    setShowPaymentModal(true);
    setPaymentMethod(null);
    setMessage('');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      setMessage('Please select a payment method.');
      return;
    }

    const productCost = parseFloat(selectedProduct.price || selectedProduct.cost) || 0;
    if (!productCost || productCost <= 0) {
      setMessage('Unable to proceed: Product price is invalid or missing.');
      return;
    }

    if (paymentMethod === 'mpesa') {
      setShowPaymentModal(false);
      navigate('/payment-details', { state: { amount: productCost } });
    } else if (paymentMethod === 'wallet') {
      // Debug logs
      console.log('Wallet Balance:', wallet.balance, 'type:', typeof wallet.balance);
      console.log('Product Cost:', productCost, 'type:', typeof productCost);
      if (wallet.balance < productCost) {
        setMessage('Insufficient wallet balance.');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          'http://localhost:8000/api/wallets/purchase/',
          { product_id: selectedProduct.id },
          { headers: { Authorization: `Token ${token}` } }
        );
        setMessage('Product purchased successfully using wallet. Refresh to see updated balance.');
        setShowPaymentModal(false);
        // Removed fetchWallet call; rely on page refresh
      } catch (err) {
        const errorDetails = err.response
          ? `${err.response.status}: ${err.response.data.error || err.response.data}`
          : err.message;
        setMessage(`Payment failed: ${errorDetails}`);
      }
    }
  };

  return (
    <div className="products-container">
      <h2>Investment Tiers</h2>
      {message && (
        <p className={`message ${message.includes('failed') ? 'error' : 'success'}`} role="alert">
          {message}
        </p>
      )}
      <div className="products-grid">
        {products.map((product) => {
          console.log('Product Data:', product);
          const productCost = product.price || product.cost || 0;
          const formattedCost = productCost > 0 ? formatCurrency(productCost) : 'Not Available';
          const isCostValid = productCost > 0;

          return (
            <article key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>Cost: {formattedCost}</p>
              <p>Daily Income: {product.daily_income} KSh</p>
              <p>Cycles: {product.cycles}</p>
              {isCostValid ? (
                <button
                  className="action-button"
                  onClick={() => openPaymentModal(product)}
                  aria-label={`Purchase ${product.name}`}
                >
                  Buy Now
                </button>
              ) : (
                <p className="error">Cannot purchase: Invalid price. Contact support.</p>
              )}
            </article>
          );
        })}
      </div>

      {showPaymentModal && selectedProduct && (
        <div className="payment-modal" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Purchase {selectedProduct.name}</h3>
            <p>Cost: {formatCurrency(selectedProduct.price || selectedProduct.cost || 0)}</p>
            <p>Your Wallet Balance: {formatCurrency(wallet.balance)}</p>
            {(selectedProduct.price || selectedProduct.cost) <= 0 && (
              <p className="error">Cannot proceed: Product price is invalid. Contact support.</p>
            )}
            <form onSubmit={handlePayment}>
              <label>
                Select Payment Method:
                <div className="payment-options">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      aria-label="Pay with M-Pesa"
                      disabled={(selectedProduct.price || selectedProduct.cost) <= 0}
                    />
                    M-Pesa
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      aria-label="Pay with Wallet"
                      disabled={(selectedProduct.price || selectedProduct.cost) <= 0}
                    />
                    Wallet
                  </label>
                </div>
              </label>
              <div className="buttons-container">
                <button
                  type="submit"
                  className="action-button"
                  disabled={(selectedProduct.price || selectedProduct.cost) <= 0}
                >
                  {paymentMethod === 'mpesa' ? 'Proceed to M-Pesa Payment' : 'Confirm Purchase with Wallet'}
                </button>
                <button
                  type="button"
                  className="action-button"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;