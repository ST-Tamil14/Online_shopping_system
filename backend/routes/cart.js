const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const getOrCreateCart = (userId) => {
  let cart = db.carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [], updatedAt: new Date() };
    db.carts.push(cart);
  }
  return cart;
};

const calculateCartTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  return {
    subtotal: +subtotal.toFixed(2),
    discount: +discount.toFixed(2),
    shipping: +shipping.toFixed(2),
    tax: +tax.toFixed(2),
    total: +total.toFixed(2),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

// @GET /api/cart
router.get('/', protect, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  const totals = calculateCartTotals(cart.items);
  res.json({ success: true, cart: { ...cart, ...totals } });
});

// @POST /api/cart/add
router.post('/add', protect, (req, res) => {
  const { productId, quantity = 1, variant } = req.body;
  const product = db.products.find(p => p.id === productId);

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

  const cart = getOrCreateCart(req.user.id);
  const existingItem = cart.items.find(i => i.productId === productId && JSON.stringify(i.variant) === JSON.stringify(variant));

  if (existingItem) {
    const newQty = existingItem.quantity + parseInt(quantity);
    if (newQty > product.stock) return res.status(400).json({ success: false, message: 'Exceeds available stock' });
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      productId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      quantity: parseInt(quantity),
      variant: variant || null,
      stock: product.stock,
    });
  }
  cart.updatedAt = new Date();

  const totals = calculateCartTotals(cart.items);
  res.json({ success: true, message: 'Added to cart', cart: { ...cart, ...totals } });
});

// @PUT /api/cart/update
router.put('/update', protect, (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getOrCreateCart(req.user.id);
  const item = cart.items.find(i => i.productId === productId);

  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  if (quantity <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  } else {
    const product = db.products.find(p => p.id === productId);
    if (product && quantity > product.stock) return res.status(400).json({ success: false, message: 'Exceeds available stock' });
    item.quantity = parseInt(quantity);
  }
  cart.updatedAt = new Date();

  const totals = calculateCartTotals(cart.items);
  res.json({ success: true, cart: { ...cart, ...totals } });
});

// @DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  cart.updatedAt = new Date();
  const totals = calculateCartTotals(cart.items);
  res.json({ success: true, message: 'Item removed', cart: { ...cart, ...totals } });
});

// @DELETE /api/cart/clear
router.delete('/clear', protect, (req, res) => {
  const cart = getOrCreateCart(req.user.id);
  cart.items = [];
  cart.updatedAt = new Date();
  res.json({ success: true, message: 'Cart cleared', cart: { ...cart, items: [], subtotal: 0, total: 0, itemCount: 0 } });
});

module.exports = router;
