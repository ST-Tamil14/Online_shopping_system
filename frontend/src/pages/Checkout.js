import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';

const steps = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || {};
  const [shipping, setShipping] = useState({
    name: user?.name || '',
    street: defaultAddress.street || '',
    city: defaultAddress.city || '',
    state: defaultAddress.state || '',
    zip: defaultAddress.zip || '',
    country: defaultAddress.country || 'US',
    phone: user?.phone || '',
  });

  const [payment, setPayment] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  if (!user) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h2>Please <Link to="/login" style={{ color: 'var(--accent)' }}>login</Link> to checkout</h2>
  </div>;

  if (!cart.items?.length) return <div className="container" style={{ padding: '80px 24px' }}>
    <div className="empty-state">
      <div className="icon">🛒</div>
      <h3>Your cart is empty</h3>
      <Link to="/products" className="btn btn-primary">Shop Now</Link>
    </div>
  </div>;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({ productId: item.productId, quantity: item.quantity, variant: item.variant })),
        shippingAddress: shipping,
        paymentMethod: payment.method,
      };
      const res = await ordersAPI.create(orderData);
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Checkout</h1>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, background: i <= step ? 'var(--accent)' : 'var(--surface)', color: i <= step ? 'white' : 'var(--muted)', border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`, transition: 'all 0.3s' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--accent)' : 'var(--muted)' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s', margin: '0 8px', marginTop: -16 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
        <div>
          {/* Step 1: Shipping */}
          {step === 0 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 24 }}>Shipping Information</h2>
              <div className="grid-2">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000' },
                ].map(({ key, label, type, placeholder }) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input type={type} value={shipping[key]} onChange={e => setShipping(p => ({ ...p, [key]: e.target.value }))} className="form-control" placeholder={placeholder} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" value={shipping.street} onChange={e => setShipping(p => ({ ...p, street: e.target.value }))} className="form-control" placeholder="123 Main St, Apt 4B" />
              </div>
              <div className="grid-3">
                {[
                  { key: 'city', label: 'City', placeholder: 'San Francisco' },
                  { key: 'state', label: 'State', placeholder: 'CA' },
                  { key: 'zip', label: 'ZIP Code', placeholder: '94102' },
                ].map(({ key, label, placeholder }) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <input type="text" value={shipping[key]} onChange={e => setShipping(p => ({ ...p, [key]: e.target.value }))} className="form-control" placeholder={placeholder} />
                  </div>
                ))}
              </div>
              {user?.addresses?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Or select saved address:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {user.addresses.map(addr => (
                      <button key={addr.id} onClick={() => setShipping({ name: addr.name, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, phone: user.phone })} style={{ padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'left', background: 'white', fontSize: 14, transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <strong>{addr.name}</strong> — {addr.street}, {addr.city}, {addr.state} {addr.zip}
                        {addr.isDefault && <span className="badge badge-accent" style={{ marginLeft: 8, fontSize: 10 }}>Default</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => setStep(1)} disabled={!shipping.name || !shipping.street || !shipping.city} className="btn btn-primary btn-lg" style={{ marginTop: 24, width: '100%' }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 1 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 24 }}>Payment Method</h2>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {[
                  { value: 'card', label: '💳 Credit/Debit Card' },
                  { value: 'paypal', label: '🅿️ PayPal' },
                  { value: 'cod', label: '💵 Cash on Delivery' },
                ].map(({ value, label }) => (
                  <button key={value} onClick={() => setPayment(p => ({ ...p, method: value }))} style={{ flex: 1, padding: '14px 12px', border: `2px solid ${payment.method === value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: payment.method === value ? 'var(--accent-light)' : 'white', color: payment.method === value ? 'var(--accent)' : 'var(--ink)', fontWeight: payment.method === value ? 700 : 500, fontSize: 13, transition: 'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" value={payment.cardNumber} onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }))} className="form-control" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" value={payment.cardName} onChange={e => setPayment(p => ({ ...p, cardName: e.target.value }))} className="form-control" placeholder="John Doe" />
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))} className="form-control" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" value={payment.cvv} onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.slice(0,4) }))} className="form-control" placeholder="123" maxLength={4} />
                    </div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: 8, fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    🔒 Your payment info is encrypted and secure. This is a demo — no real charges.
                  </div>
                </div>
              )}

              {payment.method === 'paypal' && (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--surface)', borderRadius: 12 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🅿️</div>
                  <p style={{ color: 'var(--muted)' }}>You'll be redirected to PayPal to complete payment</p>
                </div>
              )}

              {payment.method === 'cod' && (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--surface)', borderRadius: 12 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💵</div>
                  <p style={{ color: 'var(--muted)' }}>Pay when your order arrives at your door</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(0)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
                <button onClick={() => setStep(2)} className="btn btn-primary" style={{ flex: 2 }}>Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ marginBottom: 24 }}>Review Your Order</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {cart.items.map(item => (
                  <div key={item.productId} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--surface)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
                <h4 style={{ marginBottom: 8, fontSize: 14 }}>Shipping to:</h4>
                <p style={{ fontSize: 14, color: 'var(--slate)' }}>{shipping.name}, {shipping.street}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                <h4 style={{ marginTop: 12, marginBottom: 4, fontSize: 14 }}>Payment:</h4>
                <p style={{ fontSize: 14, color: 'var(--slate)' }}>{payment.method === 'card' ? `💳 Card ending in ${payment.cardNumber.slice(-4) || 'xxxx'}` : payment.method === 'paypal' ? '🅿️ PayPal' : '💵 Cash on Delivery'}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 2 }}>
                  {loading ? '⏳ Placing Order...' : '✅ Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: 24, position: 'sticky', top: 80 }}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {cart.items?.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Subtotal', value: `$${cart.subtotal?.toFixed(2)}` },
              { label: 'Shipping', value: cart.shipping === 0 ? 'Free' : `$${cart.shipping?.toFixed(2)}`, color: cart.shipping === 0 ? 'var(--success)' : undefined },
              { label: 'Tax', value: `$${cart.tax?.toFixed(2)}` },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ color: color }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '2px solid var(--border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent)' }}>${cart.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 340px"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default Checkout;
