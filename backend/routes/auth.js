const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'shopwave_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = db.users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: `user-${uuidv4()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'customer',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff`,
      phone: phone || '',
      addresses: [],
      createdAt: new Date(),
      isActive: true,
    };

    db.users.push(user);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user.id),
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = db.users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user.id),
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, phone, avatar } = req.body;
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, message: 'Profile updated', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = db.users.find(u => u.id === req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password incorrect' });

    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    user.password = await bcrypt.hash(newPassword, 10);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/auth/address
router.post('/address', protect, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  const { name, street, city, state, zip, country, isDefault } = req.body;

  if (isDefault) user.addresses.forEach(a => a.isDefault = false);

  const address = {
    id: `addr-${uuidv4()}`,
    name, street, city, state, zip,
    country: country || 'US',
    isDefault: isDefault || user.addresses.length === 0,
  };
  user.addresses.push(address);

  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({ success: true, message: 'Address added', user: userWithoutPassword });
});

// @DELETE /api/auth/address/:id
router.delete('/address/:id', protect, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  user.addresses = user.addresses.filter(a => a.id !== req.params.id);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, message: 'Address removed', user: userWithoutPassword });
});

module.exports = router;
