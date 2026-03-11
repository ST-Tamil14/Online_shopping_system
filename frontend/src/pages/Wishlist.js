import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const { user } = useAuth();

  if (!user) return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="empty-state">
        <div className="icon">❤️</div>
        <h3>Sign in to view your wishlist</h3>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>My Wishlist</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 40 }}>{wishlist.products?.length || 0} saved items</p>

      {!wishlist.products?.length ? (
        <div className="empty-state">
          <div className="icon">🤍</div>
          <h3>Your wishlist is empty</h3>
          <p>Save items you love to buy them later</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid-4">
          {wishlist.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
