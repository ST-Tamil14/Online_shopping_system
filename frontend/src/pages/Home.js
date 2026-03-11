import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsAPI.getFeatured(),
          categoriesAPI.getAll(),
        ]);
        setFeaturedProducts(prodRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, #1e1e3f 50%, #0a0a2e 100%)',
        color: 'white', overflow: 'hidden', position: 'relative', minHeight: 600,
        display: 'flex', alignItems: 'center',
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,0,0.15) 0%, transparent 70%)', top: -200, right: -100 }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,149,255,0.1) 0%, transparent 70%)', bottom: -100, left: 100 }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ animation: 'fadeIn 0.6s ease forwards' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,77,0,0.15)', border: '1px solid rgba(255,77,0,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, fontSize: 13, fontWeight: 600 }}>
                <span>🔥</span> New Collection 2024
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.1, marginBottom: 24, fontFamily: 'var(--font-display)' }}>
                Shop the Future,<br />
                <span style={{ color: 'var(--accent)' }}>Today.</span>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: 40, maxWidth: 480 }}>
                Discover thousands of premium products across electronics, fashion, home decor, and more — all at unbeatable prices.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now →
                </Link>
                <Link to="/products?featured=true" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                  Featured Items
                </Link>
              </div>

              <div style={{ display: 'flex', gap: 40, marginTop: 48 }}>
                {[
                  { value: '50K+', label: 'Products' },
                  { value: '99%', label: 'Satisfaction' },
                  { value: '24/7', label: 'Support' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{value}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=80', label: 'MacBook Pro' },
                { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80', label: 'Nike Air Max' },
                { img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', label: 'Sony XM5' },
                { img: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&q=80', label: 'Apple Watch' },
              ].map(({ img, label }, i) => (
                <div key={i} style={{
                  borderRadius: 16, overflow: 'hidden', position: 'relative',
                  height: 180, border: '1px solid rgba(255,255,255,0.1)',
                  animation: `fadeIn 0.6s ease ${i * 0.1 + 0.2}s both`,
                }}>
                  <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                    padding: '16px 12px 12px',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`@media(max-width:768px){section > div > div:last-child > div:nth-child(2){display:none !important}}`}</style>
      </section>

      {/* Features Bar */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
            {[
              { icon: '🚚', title: 'Free Shipping', sub: 'On orders over $100' },
              { icon: '↩️', title: 'Easy Returns', sub: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', sub: '256-bit SSL encryption' },
              { icon: '🎧', title: '24/7 Support', sub: 'Always here to help' },
            ].map(({ icon, title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, marginBottom: 12 }}>Shop by Category</h2>
            <p style={{ color: 'var(--muted)', fontSize: 16 }}>Explore our wide selection across all categories</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.name}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '24px 16px', borderRadius: 16, border: '1.5px solid var(--border)',
                  background: 'white', transition: 'all 0.2s', textDecoration: 'none',
                  gap: 10,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: 36 }}>{cat.icon}</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.productCount} items</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 36, marginBottom: 8 }}>Featured Products</h2>
              <p style={{ color: 'var(--muted)' }}>Hand-picked for quality and value</p>
            </div>
            <Link to="/products" className="btn btn-outline">View All →</Link>
          </div>

          {loading ? (
            <div className="grid-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                    <div className="skeleton" style={{ height: 18, width: '90%' }} />
                    <div className="skeleton" style={{ height: 14, width: '40%' }} />
                    <div className="skeleton" style={{ height: 36 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-4">
              {featuredProducts.map((product, i) => (
                <div key={product.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #ff8c00 100%)',
        color: 'white', padding: '80px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 48, marginBottom: 16 }}>🎉 Special Offer</h2>
          <p style={{ fontSize: 20, marginBottom: 40, opacity: 0.9 }}>
            Get up to 30% off on Electronics this week only!
          </p>
          <Link to="/products?category=Electronics" className="btn btn-lg" style={{ background: 'white', color: 'var(--accent)', fontWeight: 700 }}>
            Shop Electronics
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
            <div>
              <h2 style={{ fontSize: 36, marginBottom: 8 }}>Best Sellers</h2>
              <p style={{ color: 'var(--muted)' }}>Our most popular products</p>
            </div>
            <Link to="/products?isBestSeller=true" className="btn btn-outline">See All</Link>
          </div>
          <div className="grid-4">
            {featuredProducts.filter(p => p.isBestSeller).slice(0, 4).map((product, i) => (
              <div key={product.id} style={{ animation: `fadeIn 0.4s ease ${i * 0.05}s both` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
