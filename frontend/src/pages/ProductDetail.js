import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const StarRating = ({ rating, count, large }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating) ? 'var(--gold)' : 'var(--border)', fontSize: large ? 20 : 14 }}>★</span>
      ))}
    </div>
    <span style={{ fontSize: large ? 16 : 13, color: 'var(--muted)' }}>{rating} ({count} reviews)</span>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data.product);
        setRelated(res.data.related);
        setSelectedImage(0);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    load();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (await addToCart(product.id, quantity)) {}
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    const success = await addToCart(product.id, quantity);
    if (success) navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(product.id, reviewForm);
      toast.success('Review submitted!');
      const res = await productsAPI.getById(id);
      setProduct(res.data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div className="skeleton" style={{ height: 480, borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 24, width: i === 0 ? '30%' : i === 1 ? '80%' : '50%' }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div>
      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)', marginBottom: 32, alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: 'var(--muted)' }}>Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.categoryName}`} style={{ color: 'var(--muted)' }}>{product.categoryName}</Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{product.name}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginBottom: 64 }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, background: 'var(--surface)', height: 480, position: 'relative' }}>
              <img src={product.images[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {product.discount > 0 && (
                <span className="badge badge-accent" style={{ position: 'absolute', top: 16, left: 16, fontSize: 14, padding: '6px 14px' }}>-{product.discount}% OFF</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: `2px solid ${selectedImage === i ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color 0.2s', padding: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>{product.categoryName}</span>
              <h1 style={{ fontSize: 32, marginTop: 8, marginBottom: 12, lineHeight: 1.2 }}>{product.name}</h1>
              <StarRating rating={product.rating} count={product.reviewCount} large />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="price" style={{ fontSize: 36 }}>${product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="price-original" style={{ fontSize: 20 }}>${product.originalPrice.toFixed(2)}</span>
              )}
              {product.discount > 0 && (
                <span style={{ background: 'var(--success)', color: 'white', padding: '4px 10px', borderRadius: 100, fontSize: 13, fontWeight: 700 }}>
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <p style={{ color: 'var(--slate)', lineHeight: 1.8, fontSize: 15 }}>{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, fontSize: 12, color: 'var(--slate)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.stock > 0 ? 'var(--success)' : 'var(--error)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: product.stock > 10 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--error)' }}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
              {product.stock > 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>• {product.sold} sold</span>}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, background: 'var(--surface)', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ width: 48, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, background: 'var(--surface)', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleAddToCart} disabled={product.stock === 0 || cartLoading} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                🛒 Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
                ⚡ Buy Now
              </button>
              <button onClick={() => toggleWishlist(product.id)} className="btn btn-outline btn-lg btn-icon" style={{ width: 56, height: 56 }}>
                {isWishlisted(product.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              {[
                { icon: '🚚', text: 'Free shipping over $100' },
                { icon: '↩️', text: '30-day return policy' },
                { icon: '🔒', text: 'Secure checkout' },
                { icon: '🎁', text: 'Gift wrapping available' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '12px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: activeTab === key ? 700 : 500, color: activeTab === key ? 'var(--accent)' : 'var(--muted)', borderBottom: `2px solid ${activeTab === key ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.2s', marginBottom: -1, fontFamily: 'var(--font-body)' }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p style={{ lineHeight: 1.9, color: 'var(--slate)', fontSize: 16, maxWidth: 800 }}>{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div style={{ maxWidth: 600 }}>
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', padding: '14px 0', borderBottom: '1px solid var(--surface)' }}>
                  <span style={{ width: 180, fontWeight: 600, color: 'var(--slate)', fontSize: 14, textTransform: 'capitalize' }}>{key}</span>
                  <span style={{ color: 'var(--ink)', fontSize: 14 }}>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ maxWidth: 800 }}>
              {product.reviews?.map(review => (
                <div key={review.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName)}&background=0f172a&color=fff`} alt={review.userName} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{review.userName}</div>
                      <div style={{ display: 'flex', gap: 1 }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 12, color: s <= review.rating ? 'var(--gold)' : 'var(--border)' }}>★</span>)}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--slate)', lineHeight: 1.7, fontSize: 14 }}>{review.comment}</p>
                </div>
              ))}

              {user && (
                <form onSubmit={handleReviewSubmit} style={{ marginTop: 32, padding: 24, background: 'var(--surface)', borderRadius: 16 }}>
                  <h3 style={{ marginBottom: 20 }}>Write a Review</h3>
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, transition: 'transform 0.1s' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        >
                          <span style={{ color: s <= reviewForm.rating ? 'var(--gold)' : 'var(--border)' }}>★</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} className="form-control" rows={4} placeholder="Share your experience with this product..." />
                  </div>
                  <button type="submit" disabled={submittingReview} className="btn btn-primary">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: 28, marginBottom: 32 }}>Related Products</h2>
            <div className="grid-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default ProductDetail;
