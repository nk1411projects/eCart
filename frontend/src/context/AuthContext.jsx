import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth state on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getMe();
        setUser(response.user);
        if (response.seller) {
          setSeller(response.seller);
        }
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login({ email, password });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      // If logging in as seller, fetch seller info
      if (data.user.role === 'seller') {
        const profile = await authAPI.getMe();
        if (profile.seller) {
          setSeller(profile.seller);
        }
      }
      return data.user;
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return data.user;
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error on backend', err);
    }
    setUser(null);
    setSeller(null);
    localStorage.removeItem('token');
  };

  const addAddress = async (addressData) => {
    const data = await authAPI.addAddress(addressData);
    setUser(prev => ({
      ...prev,
      addresses: data.addresses
    }));
  };

  const deleteAddress = async (addressId) => {
    const data = await authAPI.deleteAddress(addressId);
    setUser(prev => ({
      ...prev,
      addresses: data.addresses
    }));
  };

  const refreshSellerProfile = async () => {
    if (user && user.role === 'seller') {
      const profile = await authAPI.getMe();
      if (profile.seller) {
        setSeller(profile.seller);
      }
    }
  };

  const updateWallet = (newBalance) => {
    setUser(prev => ({
      ...prev,
      walletBalance: newBalance
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      seller,
      loading,
      login,
      register,
      logout,
      addAddress,
      deleteAddress,
      refreshSellerProfile,
      updateWallet
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
