import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('shopwave_token'));

  const loadUser = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('shopwave_token', newToken);
    localStorage.setItem('shopwave_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.name.split(' ')[0]}!`);
    return newUser;
  };

  const register = async (name, email, password, phone) => {
    const res = await authAPI.register({ name, email, password, phone });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('shopwave_token', newToken);
    localStorage.setItem('shopwave_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    toast.success('Account created successfully!');
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('shopwave_token');
    localStorage.removeItem('shopwave_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('shopwave_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
