const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const getOrCreateWishlist = (userId) => {
  let wishlist = db.wishlists.find(w => w.userId === userId);
  if (!wishlist) { wishlist = { userId, productIds: [] }; db.wishlists.push(wishlist); }
  return wishlist;
};

// @GET /api/wishlist
router.get('/', protect, (req, res) => {
  const wishlist = getOrCreateWishlist(req.user.id);
  const products = db.products.filter(p => wishlist.productIds.includes(p.id));
  res.json({ success: true, wishlist: { ...wishlist, products } });
});

// @POST /api/wishlist/:productId
router.post('/:productId', protect, (req, res) => {
  const product = db.products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const wishlist = getOrCreateWishlist(req.user.id);
  if (!wishlist.productIds.includes(req.params.productId)) {
    wishlist.productIds.push(req.params.productId);
  }
  res.json({ success: true, message: 'Added to wishlist', productIds: wishlist.productIds });
});

// @DELETE /api/wishlist/:productId
router.delete('/:productId', protect, (req, res) => {
  const wishlist = getOrCreateWishlist(req.user.id);
  wishlist.productIds = wishlist.productIds.filter(id => id !== req.params.productId);
  res.json({ success: true, message: 'Removed from wishlist', productIds: wishlist.productIds });
});

module.exports = router;
