import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--ink)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--ink)' }}>
            Shop<span style={{ color: 'var(--accent)' }}>Wave</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
          {[
            { to: '/', label: 'Home' },
            { to: '/products', label: 'Products' },
            { to: '/products?category=Electronics', label: 'Electronics' },
            { to: '/products?category=Fashion', label: 'Fashion' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: location.pathname + location.search === to ? 'var(--accent)' : 'var(--slate)',
              background: location.pathname + location.search === to ? 'var(--accent-light)' : 'transparent',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (location.pathname + location.search !== to) e.target.style.background = 'var(--surface)'; }}
              onMouseLeave={e => { if (location.pathname + location.search !== to) e.target.style.background = 'transparent'; }}
            >{label}</Link>
          ))}
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: '0 1 320px', position: 'relative' }} className="search-form">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '9px 40px 9px 16px',
              border: '1.5px solid var(--border)', borderRadius: 10,
              fontSize: 14, outline: 'none', background: 'var(--surface)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button type="submit" style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)',
            fontSize: 16,
          }}>🔍</button>
        </form>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-icon" title="Wishlist">
                ❤️
                {wishlist.productIds?.length > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'var(--accent)', color: 'white',
                    width: 16, height: 16, borderRadius: '50%',
                    fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{wishlist.productIds.length}</span>
                )}
              </button>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" style={{ position: 'relative' }}>
            <button className="btn btn-ghost btn-icon" title="Cart">
              🛒
              {cart.itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--accent)', color: 'white',
                  width: 18, height: 18, borderRadius: '50%',
                  fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{cart.itemCount}</span>
              )}
            </button>
          </Link>

          {/* User */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 10, border: '1.5px solid var(--border)',
                  background: 'white', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>▼</span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'white', border: '1px solid var(--border)',
                  borderRadius: 12, padding: 8, minWidth: 200,
                  boxShadow: 'var(--shadow-lg)', zIndex: 100,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
                  </div>
                  {[
                    { to: '/account', icon: '👤', label: 'My Account' },
                    { to: '/orders', icon: '📦', label: 'My Orders' },
                    { to: '/wishlist', icon: '❤️', label: 'Wishlist' },
                    ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin Dashboard' }] : []),
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, fontSize: 14,
                      color: 'var(--slate)', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <span>{icon}</span> {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                    <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, fontSize: 14,
                      color: 'var(--error)', border: 'none', background: 'transparent',
                      cursor: 'pointer', width: '100%', transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-ghost btn-icon mobile-menu-btn"
            style={{ display: 'none' }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid var(--border)',
          padding: 16, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ marginBottom: 8 }}
            />
          </form>
          {[
            { to: '/', label: 'Home' },
            { to: '/products', label: 'All Products' },
            { to: '/products?category=Electronics', label: 'Electronics' },
            { to: '/products?category=Fashion', label: 'Fashion' },
            { to: '/cart', label: `Cart (${cart.itemCount || 0})` },
            ...(user ? [
              { to: '/account', label: 'My Account' },
              { to: '/orders', label: 'My Orders' },
            ] : [
              { to: '/login', label: 'Sign In' },
              { to: '/register', label: 'Sign Up' },
            ]),
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '10px 12px', borderRadius: 8, fontSize: 15,
              color: 'var(--ink)', display: 'block',
            }}>{label}</Link>
          ))}
          {user && (
            <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
              style={{ padding: '10px 12px', color: 'var(--error)', textAlign: 'left', background: 'none', border: 'none', fontSize: 15 }}>
              Sign Out
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .search-form { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
