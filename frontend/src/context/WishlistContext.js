import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ productIds: [], products: [] });
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist({ productIds: [], products: [] }); return; }
    try {
      const res = await wishlistAPI.get();
      setWishlist(res.data.wishlist);
    } catch {}
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Please login to save items'); return; }
    const isWishlisted = wishlist.productIds.includes(productId);
    try {
      if (isWishlisted) {
        const res = await wishlistAPI.remove(productId);
        setWishlist(prev => ({ ...prev, productIds: res.data.productIds, products: prev.products.filter(p => p.id !== productId) }));
        toast.success('Removed from wishlist');
      } else {
        const res = await wishlistAPI.add(productId);
        setWishlist(prev => ({ ...prev, productIds: res.data.productIds }));
        toast.success('Saved to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = (productId) => wishlist.productIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
