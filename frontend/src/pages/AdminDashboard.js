import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', color: color || 'var(--ink)' }}>{value}</p>
      </div>
      <div style={{ width: 50, height: 50, borderRadius: 12, background: `${color || 'var(--accent)'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user || !isAdmin) { navigate('/'); return; }
    adminAPI.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, isAdmin, navigate]);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.adminGetAll();
      setOrders(res.data.orders);
    } catch {}
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users);
    } catch {}
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersAPI.adminUpdateStatus(orderId, { status });
      toast.success('Order status updated');
      loadOrders();
    } catch { toast.error('Failed to update order'); }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await adminAPI.toggleUser(userId);
      toast.success(res.data.message);
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  };

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontSize: 18 }}>
      ⏳ Loading dashboard...
    </div>
  );

  const statusColors = {
    pending: '#f5a623', processing: '#0095ff', shipped: '#00a878', delivered: '#00a878', cancelled: '#e53e3e',
  };

  const tabs = [
    { key: 'overview', icon: '📊', label: 'Overview' },
    { key: 'orders', icon: '📦', label: 'Orders' },
    { key: 'users', icon: '👥', label: 'Users' },
  ];

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Welcome back, {user?.name.split(' ')[0]}</p>
        </div>
        <Link to="/products" className="btn btn-primary">Visit Store →</Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        {tabs.map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: activeTab === key ? 700 : 500,
            color: activeTab === key ? 'var(--accent)' : 'var(--muted)',
            borderBottom: `2px solid ${activeTab === key ? 'var(--accent)' : 'transparent'}`,
            transition: 'all 0.2s', marginBottom: -1, fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid-4" style={{ marginBottom: 32 }}>
            <StatCard icon="💰" label="Total Revenue" value={`$${stats.stats.totalRevenue.toLocaleString()}`} color="var(--accent)" />
            <StatCard icon="📦" label="Total Orders" value={stats.stats.totalOrders} color="var(--info)" />
            <StatCard icon="🛍️" label="Products" value={stats.stats.totalProducts} color="var(--success)" />
            <StatCard icon="👥" label="Customers" value={stats.stats.totalUsers} color="#7c3aed" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* Order Status */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>Orders by Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] || 'var(--muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 14, textTransform: 'capitalize', color: 'var(--slate)' }}>{status}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 6,
                        width: `${stats.stats.totalOrders > 0 ? (count / stats.stats.totalOrders) * 80 : 0}px`,
                        background: statusColors[status] || 'var(--muted)',
                        borderRadius: 3, minWidth: 4,
                      }} />
                      <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24 }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>Revenue (Last 6 Months)</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100 }}>
                {stats.revenueByMonth.map(({ month, revenue }) => {
                  const maxRev = Math.max(...stats.revenueByMonth.map(r => r.revenue), 1);
                  return (
                    <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: '100%',
                        height: `${Math.max((revenue / maxRev) * 80, 4)}px`,
                        background: 'var(--accent)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s',
                      }} title={`$${revenue}`} />
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Orders + Top Products */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18 }}>Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="btn btn-ghost btn-sm">View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stats.recentOrders.map(order => (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>#{order.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{order.userName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>${order.total.toFixed(2)}</div>
                      <div style={{ fontSize: 11, color: statusColors[order.status], fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</div>
                    </div>
                  </div>
                ))}
                {stats.recentOrders.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>No orders yet</p>}
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>Top Products</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stats.topProducts.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{i + 1}</span>
                    <img src={p.images[0]} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display = 'none'} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>{p.sold} sold</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>${p.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: 20 }}>All Orders</h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--surface)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{order.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{order.userName}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{order.userEmail}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{order.items.length}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>${order.total.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={order.status} onChange={e => handleStatusUpdate(order.id, e.target.value)}
                        style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, background: 'white', cursor: 'pointer' }}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>View</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ marginBottom: 20 }}>All Users</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src={u.avatar} alt={u.name} style={{ width: 44, height: 44, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {u.name}
                    {u.role === 'admin' && <span className="badge badge-accent" style={{ fontSize: 10 }}>Admin</span>}
                    {!u.isActive && <span className="badge" style={{ background: 'var(--error)', color: 'white', fontSize: 10 }}>Inactive</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </div>
                {u.role !== 'admin' && (
                  <button onClick={() => handleToggleUser(u.id)} className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ fontSize: 12, borderColor: u.isActive ? 'var(--error)' : undefined, color: u.isActive ? 'var(--error)' : undefined }}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@media(max-width:768px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
};

export default AdminDashboard;
