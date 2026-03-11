const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/orders (user orders)
router.get('/', protect, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  let orders = db.orders.filter(o => o.userId === req.user.id);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = orders.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  orders = orders.slice(startIndex, startIndex + parseInt(limit));

  res.json({ success: true, orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
});

// @GET /api/orders/:id
router.get('/:id', protect, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  res.json({ success: true, order });
});

// @POST /api/orders
router.post('/', protect, (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });
    if (!shippingAddress) return res.status(400).json({ success: false, message: 'Shipping address required' });

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity: item.quantity,
        image: product.images[0],
        variant: item.variant || null,
        lineTotal,
      });

      product.stock -= item.quantity;
      product.sold += item.quantity;
    }

    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const trackingStatuses = [
      { status: 'Order Placed', timestamp: new Date(), message: 'Your order has been received and is being processed.' }
    ];

    const order = {
      id: `ORD-${uuidv4().split('-')[0].toUpperCase()}`,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid',
      status: 'processing',
      subtotal: +subtotal.toFixed(2),
      shipping: +shipping.toFixed(2),
      tax: +tax.toFixed(2),
      total: +total.toFixed(2),
      notes: notes || '',
      tracking: trackingStatuses,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.orders.push(order);

    // Clear cart
    const cartIdx = db.carts.findIndex(c => c.userId === req.user.id);
    if (cartIdx !== -1) db.carts[cartIdx].items = [];

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @PUT /api/orders/:id/cancel
router.put('/:id/cancel', protect, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });
  if (!['processing', 'pending'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
  }

  order.status = 'cancelled';
  order.tracking.push({ status: 'Cancelled', timestamp: new Date(), message: 'Order cancelled by customer.' });

  // Restore stock
  order.items.forEach(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (product) { product.stock += item.quantity; product.sold -= item.quantity; }
  });

  res.json({ success: true, message: 'Order cancelled', order });
});

// @GET /api/orders/admin/all (admin)
router.get('/admin/all', protect, adminOnly, (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  let orders = [...db.orders];
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = orders.length;
  const paginated = orders.slice((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit));

  res.json({ success: true, orders: paginated, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
});

// @PUT /api/orders/admin/:id/status (admin)
router.put('/admin/:id/status', protect, adminOnly, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status, message } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  order.status = status;
  order.updatedAt = new Date();
  order.tracking.push({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    timestamp: new Date(),
    message: message || `Order ${status}`,
  });

  res.json({ success: true, message: 'Order status updated', order });
});

module.exports = router;
