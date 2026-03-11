const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/products
router.get('/', (req, res) => {
  let products = [...db.products];
  const {
    category, search, minPrice, maxPrice,
    sort, page = 1, limit = 12,
    featured, isNew, isBestSeller, inStock
  } = req.query;

  if (category) products = products.filter(p => p.category === category || p.categoryName.toLowerCase() === category.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (minPrice) products = products.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= parseFloat(maxPrice));
  if (featured === 'true') products = products.filter(p => p.featured);
  if (isNew === 'true') products = products.filter(p => p.isNew);
  if (isBestSeller === 'true') products = products.filter(p => p.isBestSeller);
  if (inStock === 'true') products = products.filter(p => p.stock > 0);

  switch (sort) {
    case 'price_asc': products.sort((a, b) => a.price - b.price); break;
    case 'price_desc': products.sort((a, b) => b.price - a.price); break;
    case 'rating': products.sort((a, b) => b.rating - a.rating); break;
    case 'newest': products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    case 'popular': products.sort((a, b) => b.sold - a.sold); break;
    default: products.sort((a, b) => b.featured - a.featured);
  }

  const total = products.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginated = products.slice(startIndex, startIndex + parseInt(limit));

  res.json({
    success: true,
    products: paginated,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// @GET /api/products/featured
router.get('/featured', (req, res) => {
  const products = db.products.filter(p => p.featured).slice(0, 8);
  res.json({ success: true, products });
});

// @GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const reviews = db.reviews.filter(r => r.productId === product.id);
  const related = db.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  res.json({ success: true, product: { ...product, reviews }, related });
});

// @POST /api/products (admin)
router.post('/', protect, adminOnly, (req, res) => {
  try {
    const {
      name, description, price, originalPrice, category,
      stock, images, tags, specs, featured, isNew, isBestSeller
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, description, price, and category are required' });
    }

    const catObj = db.categories.find(c => c.id === category);
    const discountVal = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;

    const product = {
      id: `prod-${uuidv4()}`,
      name, description,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price),
      discount: discountVal,
      category,
      categoryName: catObj ? catObj.name : category,
      stock: parseInt(stock) || 0,
      sold: 0,
      images: images || [],
      rating: 0, reviewCount: 0,
      tags: tags || [],
      specs: specs || {},
      featured: featured || false,
      isNew: isNew !== undefined ? isNew : true,
      isBestSeller: isBestSeller || false,
      createdAt: new Date(),
    };

    db.products.push(product);
    if (catObj) catObj.productCount++;

    res.status(201).json({ success: true, message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @PUT /api/products/:id (admin)
router.put('/:id', protect, adminOnly, (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const allowed = ['name', 'description', 'price', 'originalPrice', 'stock', 'images', 'tags', 'specs', 'featured', 'isNew', 'isBestSeller'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) product[key] = req.body[key];
  });
  if (product.originalPrice > product.price) {
    product.discount = Math.round((1 - product.price / product.originalPrice) * 100);
  }

  res.json({ success: true, message: 'Product updated', product });
});

// @DELETE /api/products/:id (admin)
router.delete('/:id', protect, adminOnly, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  db.products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted' });
});

// @POST /api/products/:id/review
router.post('/:id/review', protect, (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const existing = db.reviews.find(r => r.productId === req.params.id && r.userId === req.user.id);
  if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this product' });

  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

  const review = {
    id: `rev-${uuidv4()}`,
    productId: req.params.id,
    userId: req.user.id,
    userName: req.user.name,
    rating: parseInt(rating),
    comment: comment || '',
    createdAt: new Date(),
    helpful: 0,
  };

  db.reviews.push(review);

  const productReviews = db.reviews.filter(r => r.productId === req.params.id);
  product.rating = +(productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1);
  product.reviewCount = productReviews.length;

  res.status(201).json({ success: true, message: 'Review added', review });
});

module.exports = router;
