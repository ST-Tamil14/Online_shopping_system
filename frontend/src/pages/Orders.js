import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const statusColors = {
  pending: { bg: '#fff7ed', color: '#c05621', label: '⏳ Pending' },
  processing: { bg: '#eff6ff', color: '#1d4ed8', label: '⚙️ Processing' },
  shipped: { bg: '#f0fdf4', color: '#15803d', label: '🚚 Shipped' },
  delivered: { bg: '#f0fdf4', color: '#15803d', label: '✅ Delivered' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c', label: '❌ Cancelled' },
};

export const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    ordersAPI.getAll().then(res => setOrders(res.data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h2>Please <Link to="/login" style={{ color: 'var(--accent)' }}>login</Link> to view orders</h2>
  </div>;

  if (loading) return <div className="container" style={{ padding: '48px 24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
    </div>
  </div>;

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 860 }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const status = statusColors[order.status] || statusColors.pending;
            return (
              <Link key={order.id} to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>#{order.id}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      {order.items.slice(0,3).map(item => (
                        <img key={item.productId} src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                      ))}
                      {order.items.length > 3 && <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)' }}>+{order.items.length - 3}</div>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>${order.total.toFixed(2)}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getById(id).then(res => setOrder(res.data.order)).catch(() => navigate('/orders')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await ordersAPI.cancel(id);
      setOrder(res.data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  if (loading) return <div className="container" style={{ padding: '48px 24px' }}>Loading...</div>;
  if (!order) return null;

  const status = statusColors[order.status] || statusColors.pending;

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link to="/orders" style={{ color: 'var(--muted)', fontSize: 14 }}>← Back to Orders</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Order #{order.id}</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ padding: '5px 14px', borderRadius: 100, background: status.bg, color: status.color, fontWeight: 600, fontSize: 14 }}>{status.label}</span>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        {['pending', 'processing'].includes(order.status) && (
          <button onClick={handleCancel} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Cancel Order</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: 16 }}>
                  <img src={item.image} alt={item.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.productId}`} style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink)' }}>{item.name}</Link>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>${item.lineTotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 20 }}>Order Tracking</h3>
            <div style={{ position: 'relative' }}>
              {order.tracking.map((track, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i === order.tracking.length - 1 ? 0 : 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--surface)', border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                      {i === 0 ? '●' : '○'}
                    </div>
                    {i < order.tracking.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 24, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{track.status}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{track.message}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{new Date(track.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Summary */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
            {[
              { label: 'Subtotal', value: `$${order.subtotal.toFixed(2)}` },
              { label: 'Shipping', value: order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}` },
              { label: 'Tax', value: `$${order.tax.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Shipping Address</h3>
            <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.7 }}>
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Payment</h3>
            <div style={{ fontSize: 14, color: 'var(--slate)' }}>
              <div style={{ marginBottom: 4 }}>Method: {order.paymentMethod === 'card' ? '💳 Credit Card' : order.paymentMethod === 'paypal' ? '🅿️ PayPal' : '💵 Cash on Delivery'}</div>
              <div style={{ color: 'var(--success)', fontWeight: 600 }}>✅ {order.paymentStatus}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 320px"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default Orders;
