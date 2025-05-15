import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [wallet, setWallet] = useState({
    balance: 0,
    income: 0,
    last_income_update: null,
    has_recharged: false,
  });

  const fetchWallet = async (forceUpdate = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping wallet fetch');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/wallets/', {
        headers: { Authorization: `Token ${token}` },
      });
      const newWallet = response.data || { balance: 0, income: 0, last_income_update: null, has_recharged: false };
      console.log('Fetched wallet data:', newWallet); // Debug log
      setWallet(newWallet);

      if (forceUpdate) {
        const lastUpdate = newWallet.last_income_update ? new Date(newWallet.last_income_update) : null;
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const shouldUpdate = !lastUpdate || lastUpdate < twentyFourHoursAgo;

        if (shouldUpdate) {
          try {
            const updateRes = await axios.post('http://localhost:8000/api/update-income/', {}, {
              headers: { Authorization: `Token ${token}` },
            });
            const updatedWallet = updateRes.data || newWallet;
            console.log('Updated income data:', updatedWallet); // Debug log
            setWallet(updatedWallet);
          } catch (updateError) {
            console.error('Error updating income:', updateError);
            setWallet(newWallet);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wallet:', error.response?.data || error.message);
      setWallet((prev) => prev); // Retain previous state on error
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchWallet();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <BalanceContext.Provider value={{ wallet, fetchWallet }}>
      {children}
    </BalanceContext.Provider>
  );
};