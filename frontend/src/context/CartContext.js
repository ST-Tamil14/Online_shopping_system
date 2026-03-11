import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 }); return; }
    try {
      const res = await cartAPI.get();
      setCart(res.data.cart);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, variant = null) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    setLoading(true);
    try {
      const res = await cartAPI.add({ productId, quantity, variant });
      setCart(res.data.cart);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await cartAPI.update({ productId, quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartAPI.remove(productId);
      setCart(res.data.cart);
      toast.success('Removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], subtotal: 0, total: 0, itemCount: 0 });
    } catch {}
  };

  const isInCart = (productId) => cart.items.some(i => i.productId === productId);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
