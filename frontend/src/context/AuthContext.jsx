import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const res = await api.get('/auth/user');
        setUser(res.data);
      } catch (err) {
        Cookies.remove('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('token', res.data.token, { expires: 7 });
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    Cookies.set('token', res.data.token, { expires: 7 });
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    setUser(res.data);
    return res.data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  const exportAllData = async () => {
    const res = await api.get('/auth/export-data');
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        exportAllData,
        refreshUser: fetchCurrentUser,
        currencySymbol: user?.currencySymbol || '₹'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
