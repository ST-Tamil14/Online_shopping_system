import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const StarRating = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{
          color: s <= Math.round(rating) ? 'var(--gold)' : 'var(--border)',
          fontSize: 12,
        }}>★</span>
      ))}
    </div>
    <span style={{ fontSize: 12, color: 'var(--muted)' }}>({count})</span>
  </div>
);

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const wishlisted = isWishlisted(product.id);

  return (
    <div className="card" style={{
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'visible',
    }}>
      {/* Badges */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 6 }}>
        {product.discount > 0 && (
          <span className="badge badge-accent">-{product.discount}%</span>
        )}
        {product.isNew && <span className="badge badge-new">New</span>}
        {product.isBestSeller && <span className="badge" style={{ background: '#7c3aed', color: 'white' }}>Bestseller</span>}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(product.id)}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          width: 36, height: 36, borderRadius: '50%',
          background: 'white', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s', fontSize: 16,
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {wishlisted ? '❤️' : '🤍'}
      </button>

      {/* Image */}
      <Link to={`/products/${product.id}`}>
        <div style={{
          height: 220, overflow: 'hidden', borderRadius: '12px 12px 0 0',
          position: 'relative', background: 'var(--surface)',
        }}>
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=60'; }}
          />
          {product.stock === 0 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px 12px 0 0',
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {product.categoryName}
        </div>

        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink)'}
          >
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.rating} count={product.reviewCount} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <span className="price">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock === 0 || loading}
          className="btn btn-primary btn-sm btn-full"
          style={{ marginTop: 4 }}
        >
          {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
