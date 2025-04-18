const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const db = require('../config/db');

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1');
    res.json({ success: true, message: 'Database connection successful', result });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// User routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// Admin routes
router.post('/admin/signin', authController.adminSignin);

// Protected routes example
router.get('/protected', authController.verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

router.get('/admin/protected', authController.verifyToken, authController.checkAdminRole, (req, res) => {
  res.json({ message: 'This is an admin-only route', user: req.user });
});

module.exports = router;
