import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: 'var(--ink)', color: 'rgba(255,255,255,0.8)', marginTop: 'auto' }}>
    <div className="container" style={{ padding: '64px 24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>S</span>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'white' }}>ShopWave</span>
          </div>
          <p style={{ lineHeight: 1.7, fontSize: 14, maxWidth: 280, marginBottom: 24 }}>
            Your premier destination for electronics, fashion, and everything in between. Quality products, unbeatable prices.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {['📘', '🐦', '📸', '▶️'].map((icon, i) => (
              <button key={i} style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >{icon}</button>
            ))}
          </div>
        </div>

        {[
          { title: 'Shop', links: [{ to: '/products', label: 'All Products' }, { to: '/products?category=Electronics', label: 'Electronics' }, { to: '/products?category=Fashion', label: 'Fashion' }, { to: '/products?isBestSeller=true', label: 'Best Sellers' }, { to: '/products?isNew=true', label: 'New Arrivals' }] },
          { title: 'Account', links: [{ to: '/account', label: 'My Profile' }, { to: '/orders', label: 'My Orders' }, { to: '/wishlist', label: 'Wishlist' }, { to: '/cart', label: 'Shopping Cart' }] },
          { title: 'Support', links: [{ to: '#', label: 'Help Center' }, { to: '#', label: 'Contact Us' }, { to: '#', label: 'Shipping Info' }, { to: '#', label: 'Return Policy' }, { to: '#', label: 'Track Order' }] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 20, fontSize: 16 }}>{title}</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          © 2024 ShopWave. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
            <Link key={label} to="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >{label}</Link>
          ))}
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 480px) {
        footer > div > div:first-child { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </footer>
);

export default Footer;
