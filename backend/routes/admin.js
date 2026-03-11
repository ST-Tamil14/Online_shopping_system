const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/dashboard
router.get('/dashboard', protect, adminOnly, (req, res) => {
  const totalRevenue = db.orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = db.orders.length;
  const totalProducts = db.products.length;
  const totalUsers = db.users.filter(u => u.role === 'customer').length;

  const recentOrders = db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const ordersByStatus = {
    pending: db.orders.filter(o => o.status === 'pending').length,
    processing: db.orders.filter(o => o.status === 'processing').length,
    shipped: db.orders.filter(o => o.status === 'shipped').length,
    delivered: db.orders.filter(o => o.status === 'delivered').length,
    cancelled: db.orders.filter(o => o.status === 'cancelled').length,
  };

  const topProducts = [...db.products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  // Revenue by month (last 6 months)
  const revenueByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    const revenue = db.orders
      .filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + o.total, 0);
    revenueByMonth.push({ month, revenue: +revenue.toFixed(2) });
  }

  res.json({
    success: true,
    stats: {
      totalRevenue: +totalRevenue.toFixed(2),
      totalOrders,
      totalProducts,
      totalUsers,
    },
    ordersByStatus,
    recentOrders,
    topProducts,
    revenueByMonth,
  });
});

// @GET /api/admin/users
router.get('/users', protect, adminOnly, (req, res) => {
  const users = db.users.map(u => { const { password: _, ...rest } = u; return rest; });
  res.json({ success: true, users });
});

// @PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', protect, adminOnly, (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
  user.isActive = !user.isActive;
  const { password: _, ...rest } = user;
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: rest });
});

module.exports = router;
