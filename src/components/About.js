import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-container">
      <h2>About SmartInvestHub</h2>
      <div className="about-card">
        <p>
          Welcome to SmartInvestHub, your trusted platform for smart and secure investing. Below, we’ve provided everything you need to know about how our platform works, its features, and how you can benefit from joining our community.
        </p>
      </div>

      <div className="about-card">
        <h3>Our Mission</h3>
        <p>
          At SmartInvestHub, our mission is to empower individuals to achieve financial freedom through smart, accessible, and secure investment opportunities. We believe that everyone deserves the chance to grow their wealth, regardless of their financial background. Our platform is designed to make investing simple, transparent, and rewarding.
        </p>
      </div>

      <div className="about-card">
        <h3>What is SmartInvestHub?</h3>
        <p>
          SmartInvestHub is a digital investment platform that allows you to invest in various products and earn daily income based on your investment. We offer a range of investment products with different costs, returns, and cycles, so you can choose the one that best fits your financial goals. Additionally, our referral program lets you earn more by inviting friends to join the platform.
        </p>
      </div>

      <div className="about-card">
        <h3>Key Features</h3>
        <ul>
          <li>
            <strong>Investment Products:</strong> Choose from a variety of products with different price points, daily incomes, and total returns. Each product runs for a set number of cycles, providing consistent earnings.
          </li>
          <li>
            <strong>Daily Income:</strong> Earn daily income from your active products, which is credited to your wallet. You can track your earnings on the My Profile page.
          </li>
          <li>
            <strong>Referral Program:</strong> Invite friends using your unique referral code and earn rewards as they join and invest. Climb the VIP levels (VIP0 to VIP3) by referring more users.
          </li>
          <li>
            <strong>Wallet Management:</strong> Recharge your wallet to purchase products, withdraw your earnings, and track your balance and income in real-time.
          </li>
          <li>
            <strong>Secure Transactions:</strong> We use advanced security measures to protect your funds and personal information, ensuring a safe investing experience.
          </li>
          <li>
            <strong>Support:</strong> Our dedicated support team is available at <a href="tel:+254736196188">+254736196188</a> to assist with any questions or issues.
          </li>
        </ul>
      </div>

      <div className="about-card">
        <h3>How It Works</h3>
        <ol>
          <li>
            <strong>Sign Up:</strong> Create an account on SmartInvestHub by registering with your username and password. You’ll receive a unique referral code.
          </li>
          <li>
            <strong>Recharge Your Wallet:</strong> Add funds to your wallet using our secure payment methods. This balance will be used to purchase investment products.
          </li>
          <li>
            <strong>Choose a Product:</strong> Browse our available products on the Products page. Each product shows its cost, daily income, total return, and cycle duration. Purchase a product to start earning.
          </li>
          <li>
            <strong>Earn Daily Income:</strong> Once you purchase a product, you’ll earn daily income for the duration of its cycles. Your earnings are added to your wallet’s income balance.
          </li>
          <li>
            <strong>Invite Friends:</strong> Share your referral link with friends. When they sign up and invest, you’ll earn rewards and progress toward higher VIP levels.
          </li>
          <li>
            <strong>Withdraw Earnings:</strong> Transfer your earned income to your bank account or mobile money wallet at any time, provided you meet the minimum withdrawal threshold.
          </li>
        </ol>
      </div>

      <div className="about-card">
        <h3>VIP Levels and Referral Benefits</h3>
        <p>
          Our referral program offers three VIP levels to reward active users:
        </p>
        <ul>
          <li><strong>VIP0:</strong> Starting level for all users (0–4 referrals).</li>
          <li><strong>VIP1:</strong> Achieved after 5 referrals. Unlock additional benefits.</li>
          <li><strong>VIP2:</strong> Achieved after 10 referrals. Enjoy higher rewards.</li>
          <li><strong>VIP3:</strong> Achieved after 15 referrals. The highest level with maximum benefits.</li>
        </ul>
        <p>
          The more friends you invite, the higher your VIP level, and the greater your rewards. Check your referral progress on the My Team page.
        </p>
      </div>

      <div className="about-card">
        <h3>Why Choose SmartInvestHub?</h3>
        <ul>
          <li><strong>Transparency:</strong> We provide clear information about each product’s cost, returns, and cycles, so you know exactly what to expect.</li>
          <li><strong>Flexibility:</strong> Invest as little or as much as you’d like, with products tailored to different budgets.</li>
          <li><strong>Community:</strong> Join thousands of investors who trust SmartInvestHub to grow their wealth securely.</li>
          <li><strong>Ease of Use:</strong> Our platform is user-friendly, with intuitive navigation and real-time updates on your investments and earnings.</li>
          <li><strong>Reliable Support:</strong> We’re here to help you every step of the way. Contact us at <a href="tel:+254736196188">+254736196188</a> for assistance.</li>
        </ul>
      </div>

      <div className="about-card">
        <h3>Frequently Asked Questions</h3>
        <h4>How do I start investing?</h4>
        <p>
          After signing up, recharge your wallet with funds, then go to the Products page to select and purchase an investment product. You’ll start earning daily income immediately.
        </p>
        <h4>Is my money safe?</h4>
        <p>
          Yes, we prioritize security with encrypted transactions and strict privacy policies to protect your funds and data.
        </p>
        <h4>How can I withdraw my earnings?</h4>
        <p>
          Go to the My Profile page, click Withdraw, and follow the instructions to transfer your earnings to your preferred account. Ensure your income balance meets the minimum withdrawal amount.
        </p>
        <h4>What happens if I don’t refer anyone?</h4>
        <p>
          You can still invest and earn daily income from your products. Referring friends is optional but helps you unlock VIP levels and additional rewards.
        </p>
      </div>

      <button
        className="action-button"
        onClick={() => navigate('/my-page')}
        aria-label="Back to profile"
      >
        Back to Profile
      </button>
    </div>
  );
};

export default About;