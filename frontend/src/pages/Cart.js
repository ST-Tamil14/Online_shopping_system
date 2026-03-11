import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="empty-state">
        <div className="icon">🔐</div>
        <h3>Sign in to view your cart</h3>
        <p>Please login to access your shopping cart</p>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    </div>
  );

  if (cart.items?.length === 0) return (
    <div className="container" style={{ padding: '80px 24px' }}>
      <div className="empty-state">
        <div className="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32 }}>Shopping Cart</h1>
        <button onClick={clearCart} className="btn btn-ghost" style={{ color: 'var(--error)', fontSize: 14 }}>🗑️ Clear Cart</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {cart.items?.map(item => (
            <div key={item.productId} className="card" style={{ display: 'flex', gap: 20, padding: 20 }}>
              <Link to={`/products/${item.productId}`}>
                <img src={item.image} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} onError={e => e.target.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'} />
              </Link>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Link to={`/products/${item.productId}`} style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>
                    {item.name}
                  </Link>
                  <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--muted)' }}>✕</button>
                </div>

                {item.variant && (
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Variant: {JSON.stringify(item.variant)}</div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ width: 36, height: 36, background: 'var(--surface)', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: 44, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock} style={{ width: 36, height: 36, background: 'var(--surface)', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>${(item.price * item.quantity).toFixed(2)}</div>
                    {item.originalPrice > item.price && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'line-through' }}>${(item.originalPrice * item.quantity).toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, position: 'sticky', top: 80 }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {[
              { label: `Subtotal (${cart.itemCount} items)`, value: `$${cart.subtotal?.toFixed(2)}` },
              { label: 'Discount', value: cart.discount > 0 ? `-$${cart.discount?.toFixed(2)}` : '$0.00', color: cart.discount > 0 ? 'var(--success)' : undefined },
              { label: 'Shipping', value: cart.shipping === 0 ? '🎉 Free' : `$${cart.shipping?.toFixed(2)}`, color: cart.shipping === 0 ? 'var(--success)' : undefined },
              { label: 'Tax (8%)', value: `$${cart.tax?.toFixed(2)}` },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, color: color || 'var(--ink)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>${cart.total?.toFixed(2)}</span>
            </div>
          </div>

          {cart.shipping > 0 && (
            <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🚚 Add ${(100 - cart.subtotal).toFixed(2)} more for free shipping!
            </div>
          )}

          <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-full btn-lg" style={{ marginBottom: 12 }}>
            Proceed to Checkout →
          </button>
          <Link to="/products" className="btn btn-outline btn-full">Continue Shopping</Link>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, opacity: 0.5 }}>
            {['💳', '🏦', '📱', '🔒'].map((icon, i) => (
              <span key={i} style={{ fontSize: 20 }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 380px"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default Cart;
