const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { protect } = require('../middleware/auth');

// CATEGORIES
// @GET /api/categories
router.get('/', (req, res) => {
  res.json({ success: true, categories: db.categories });
});

module.exports = router;
