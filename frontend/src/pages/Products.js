import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
    isNew: searchParams.get('isNew') || '',
    isBestSeller: searchParams.get('isBestSeller') || '',
    featured: searchParams.get('featured') || '',
    inStock: searchParams.get('inStock') || '',
  });
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) };
      const res = await productsAPI.getAll(params);
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch {}
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '', sort: '', isNew: '', isBestSeller: '', featured: '', inStock: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const SidebarContent = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18 }}>Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Category</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={() => updateFilter('category', '')} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, background: !filters.category ? 'var(--accent-light)' : 'transparent', color: !filters.category ? 'var(--accent)' : 'var(--slate)', fontWeight: !filters.category ? 600 : 400, transition: 'all 0.2s' }}>
            All Categories
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => updateFilter('category', cat.name)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, background: filters.category === cat.name ? 'var(--accent-light)' : 'transparent', color: filters.category === cat.name ? 'var(--accent)' : 'var(--slate)', fontWeight: filters.category === cat.name ? 600 : 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
              <span>{cat.icon} {cat.name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cat.productCount}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Price Range</h4>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="form-control" style={{ padding: '8px 12px', fontSize: 14 }} />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="form-control" style={{ padding: '8px 12px', fontSize: 14 }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 28 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Filter By</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'isNew', label: '🆕 New Arrivals' },
            { key: 'isBestSeller', label: '⭐ Best Sellers' },
            { key: 'featured', label: '🔥 Featured' },
            { key: 'inStock', label: '✅ In Stock Only' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={filters[key] === 'true'} onChange={e => updateFilter(key, e.target.checked ? 'true' : '')} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          {filters.search ? `Results for "${filters.search}"` : filters.category || 'All Products'}
        </h1>
        <p style={{ color: 'var(--muted)' }}>{pagination.total || 0} products found</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: 80, background: 'white', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }} className="desktop-sidebar">
          <SidebarContent />
        </aside>

        {/* Main */}
        <div>
          {/* Sort bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {filters.category && (
                <span style={{ padding: '4px 12px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 100, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {filters.category}
                  <button onClick={() => updateFilter('category', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--accent)' }}>✕</button>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-outline btn-sm mobile-filter-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'none' }}>
                🔧 Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="form-control" style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: 14 }}>
                <option value="">Sort: Featured</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ height: 220 }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 14, width: '60%' }} />
                    <div className="skeleton" style={{ height: 18, width: '90%' }} />
                    <div className="skeleton" style={{ height: 36 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="btn btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {products.map((product, i) => (
                  <div key={product.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.04}s both` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm">← Prev</button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-outline'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn btn-outline btn-sm">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Products;
