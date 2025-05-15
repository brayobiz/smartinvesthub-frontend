import React from 'react';
import { useLocation } from 'react-router-dom';
import './MyProducts.css';

const MyProducts = () => {
  const location = useLocation();
  const { purchasedProducts } = location.state || { purchasedProducts: [] };

  // Debug log to verify received data
  React.useEffect(() => {
    console.log('Received purchasedProducts:', purchasedProducts);
  }, [purchasedProducts]);

  return (
    <div className="container">
      <h2>My Purchased Products</h2>
      {purchasedProducts.length > 0 ? (
        <div className="products">
          {purchasedProducts.map((userProduct) => (
            <article key={userProduct.id} className="product-card">
              <h3>{userProduct.product.name}</h3>
              <p><strong>Price:</strong> {userProduct.product.price} KSh</p>
              <p><strong>Daily Income:</strong> {userProduct.product.daily_income} KSh</p>
              <p><strong>Total Income:</strong> {userProduct.product.total_income} KSh</p>
              <p><strong>Cycles:</strong> {userProduct.product.cycles}</p>
              <p><strong>Purchased on:</strong> {new Date(userProduct.purchase_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {userProduct.active ? 'Active' : 'Inactive'}</p>
              <p><strong>Cycles Completed:</strong> {userProduct.cycles_completed}</p>
            </article>
          ))}
        </div>
      ) : (
        <p>No purchased products found.</p>
      )}
    </div>
  );
};

export default MyProducts;