import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();

  // Handle login
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/login`, {
        username,
        password,
      });
      alert(response.data.message);

      // Store token securely in localStorage
      localStorage.setItem('token', response.data.token);

      // Optionally, navigate or update the UI state
      console.log('Login successful, token stored');

      navigate('/admin/EditGameDuration');
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/reset-password`, {
        username,
        newPassword,
      });
      alert(response.data.message);
      setIsResettingPassword(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Password reset failed');
    }
  };

  // Handle creating a new admin
  const handleCreateAdmin = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token

      if (!token) {
        alert('You must be logged in as an admin to create another admin');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/create`,
        {
          username,
          password,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send token in the Authorization header
        }
      );
      alert(response.data.message);
      setIsCreatingAdmin(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Admin creation failed');
    }
  };

  // Logout function (clear token)
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    alert('Logged out successfully');
    navigate('../');
  };

  return (
    <div className="admin-login-container">
      <h1>Admin Panel</h1>
      <input
        type="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {!isResettingPassword && !isCreatingAdmin ? (
        <>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setIsResettingPassword(true)}>Forgot Password?</button>
          <button onClick={() => setIsCreatingAdmin(true)}>Create Admin</button>
        </>
      ) : isResettingPassword ? (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword}>Reset Password</button>
          <button onClick={() => setIsResettingPassword(false)}>Cancel</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleCreateAdmin}>Create Admin</button>
          <button onClick={() => setIsCreatingAdmin(false)}>Cancel</button>
        </>
      )}
      <br />
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  );
};

export default AdminLogin;
