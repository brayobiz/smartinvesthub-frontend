import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRecharges: 0,
    totalWithdrawals: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState({ pendingRecharges: [], pendingWithdrawals: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('http://localhost:8000/api/admin/dashboard/', {
          headers: { Authorization: `Token ${token}` },
        });
        console.log('API Response:', response.data);
        setStats(response.data.stats || {});
        setUsers(response.data.users || []);
        console.log('Set Users:', response.data.users || []);
        setAlerts(response.data.alerts || { pendingRecharges: [], pendingWithdrawals: [] });
      } catch (error) {
        console.error('Fetch Error:', error.message, error.response?.status, error.response?.data);
        setError(`Failed to fetch data: ${error.message} (Status: ${error.response?.status || 'Unknown'})`);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  const handleUserUpdate = async (userId, action) => {
    try {
      console.log(`Sending update request for user ${userId} with action: ${action}`);
      const response = await axios.post(
        'http://localhost:8000/api/admin/dashboard/',
        { user_id: userId, action },
        { headers: { Authorization: `Token ${token}` } }
      );
      console.log('Update Response:', response.data);
      if (response.data.user) {
        setUsers(prevUsers =>
          prevUsers.map(user => (user.id === userId ? response.data.user : user))
        );
      } else {
        console.error('No user data in response:', response.data);
        setError('Failed to update user: No user data returned');
      }
    } catch (error) {
      console.error('Update Error:', error.message, error.response?.status, error.response?.data);
      setError(`Update failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      console.log(`Approving ${type} with ID ${id}`);
      await axios.post(
        'http://localhost:8000/api/admin/approve-transaction/',
        { type, id, status: 'COMPLETED' },
        { headers: { Authorization: `Token ${token}` } }
      );
      setAlerts(prevAlerts => ({
        ...prevAlerts,
        [type]: prevAlerts[type].filter(item => item.id !== id),
      }));
    } catch (error) {
      console.error('Approve Error:', error.message, error.response?.status, error.response?.data);
      setError(`Approve failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleReject = async (type, id) => {
    try {
      console.log(`Rejecting ${type} with ID ${id}`);
      await axios.post(
        'http://localhost:8000/api/admin/approve-transaction/',
        { type, id, status: 'REJECTED' },
        { headers: { Authorization: `Token ${token}` } }
      );
      setAlerts(prevAlerts => ({
        ...prevAlerts,
        [type]: prevAlerts[type].filter(item => item.id !== id),
      }));
    } catch (error) {
      console.error('Reject Error:', error.message, error.response?.status, error.response?.data);
      setError(`Reject failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  console.log('Current Users:', currentUsers);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-overlay">
        <span className="spinner">Loading...</span>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" role="main" aria-label="Admin Dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="last-updated">Last Updated: {new Date('2025-05-15T02:06:00+03:00').toLocaleString()}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Recharges</h3>
          <p className="stat-value">{stats.totalRecharges.toFixed(2)} KSh</p>
          <span className="info-icon" title="Sum of all completed recharge transactions">ℹ️</span>
        </div>
        <div className="stat-card">
          <h3>Total Withdrawals</h3>
          <p className="stat-value">{stats.totalWithdrawals.toFixed(2)} KSh</p>
          <span className="info-icon" title="Sum of all completed withdrawal transactions">ℹ️</span>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-value">{stats.activeUsers}</p>
          <span className="info-icon" title="Number of active user accounts">ℹ️</span>
        </div>
      </div>

      <section className="section">
        <h2>User Management</h2>
        <div className="user-table-container">
          <table className="user-table" role="grid" aria-label="User Management">
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Staff</th>
                <th scope="col">Superuser</th>
                <th scope="col">Active</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user.id} role="row">
                    <td>{user.username || 'N/A'}</td>
                    <td>{typeof user.is_staff === 'boolean' ? user.is_staff.toString() : 'false'}</td>
                    <td>{typeof user.is_superuser === 'boolean' ? user.is_superuser.toString() : 'false'}</td>
                    <td>{typeof user.is_active === 'boolean' ? user.is_active.toString() : 'false'}</td>
                    <td>
                      <button
                        className={`action-btn ${user.is_staff ? 'active' : ''}`}
                        onClick={() => handleUserUpdate(user.id, 'toggle_staff')}
                        disabled={typeof user.id !== 'number'}
                        aria-label={user.is_staff ? 'Remove Staff' : 'Make Staff'}
                      >
                        {user.is_staff ? 'Remove Staff' : 'Make Staff'}
                      </button>
                      <button
                        className={`action-btn ${user.is_superuser ? 'active' : ''}`}
                        onClick={() => handleUserUpdate(user.id, 'toggle_superuser')}
                        disabled={typeof user.id !== 'number'}
                        aria-label={user.is_superuser ? 'Remove Superuser' : 'Make Superuser'}
                      >
                        {user.is_superuser ? 'Remove Superuser' : 'Make Superuser'}
                      </button>
                      <button
                        className={`action-btn ${user.is_active ? 'active' : ''}`}
                        onClick={() => handleUserUpdate(user.id, 'toggle_active')}
                        disabled={typeof user.id !== 'number'}
                        aria-label={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr role="row">
                  <td colSpan="5" className="no-data">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {users.length > usersPerPage && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={currentPage === number ? 'active' : ''}
                  aria-label={`Page ${number}`}
                >
                  {number}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section alerts">
        <h2>Alerts</h2>
        <div className="alert-section">
          <h3>Pending Recharges</h3>
          {alerts.pendingRecharges.length > 0 ? (
            <ul aria-label="Pending Recharges">
              {alerts.pendingRecharges.map((recharge) => (
                <li key={recharge.id}>
                  <span>
                    User: {recharge.user__username || 'Unknown'} | Amount: {(parseFloat(recharge.amount) || 0).toFixed(2)} KSh | Date: {recharge.date ? new Date(recharge.date).toLocaleString() : 'N/A'}
                  </span>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove('pendingRecharges', recharge.id)}
                    disabled={typeof recharge.id !== 'number'}
                    aria-label="Approve Recharge"
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject('pendingRecharges', recharge.id)}
                    disabled={typeof recharge.id !== 'number'}
                    aria-label="Reject Recharge"
                  >
                    Reject
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending recharges.</p>
          )}
        </div>
        <div className="alert-section">
          <h3>Pending Withdrawals</h3>
          {alerts.pendingWithdrawals.length > 0 ? (
            <ul aria-label="Pending Withdrawals">
              {alerts.pendingWithdrawals.map((withdrawal) => (
                <li key={withdrawal.id}>
                  <span>
                    User: {withdrawal.user__username || 'Unknown'} | Amount: {(parseFloat(withdrawal.amount) || 0).toFixed(2)} KSh | Date: {withdrawal.date ? new Date(withdrawal.date).toLocaleString() : 'N/A'}
                  </span>
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove('pendingWithdrawals', withdrawal.id)}
                    disabled={typeof withdrawal.id !== 'number'}
                    aria-label="Approve Withdrawal"
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject('pendingWithdrawals', withdrawal.id)}
                    disabled={typeof withdrawal.id !== 'number'}
                    aria-label="Reject Withdrawal"
                  >
                    Reject
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending withdrawals.</p>
          )}
        </div>
      </section>

      {error && (
        <div className="error-modal">
          <div className="error-content">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;