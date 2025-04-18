const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authController = {
  // User signup
  signup: async (req, res) => {
    try {
      const { username, password, name, email, contact, address } = req.body;

      // Check if username already exists
      const [existingUser] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const [result] = await db.query(
        'INSERT INTO User (Username, Password, Name, Email, Contact, Address) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, name, email, contact, address]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: result.insertId
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ success: false, message: 'Error registering user' });
    }
  },

  // User signin
  signin: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if user exists
      const [users] = await db.query('SELECT * FROM User WHERE Username = ?', [username]);
      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.User_ID, role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        role: 'user',
        userId: user.User_ID
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ success: false, message: 'Error signing in' });
    }
  },

  // Admin signin
  adminSignin: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Check if admin exists
      const [admins] = await db.query('SELECT * FROM Admin WHERE Username = ?', [username]);
      if (admins.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const admin = admins[0];

      // Check password
      const isMatch = await bcrypt.compare(password, admin.Password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: admin.Admin_ID, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        role: 'admin',
        userId: admin.Admin_ID
      });
    } catch (error) {
      console.error('Admin signin error:', error);
      res.status(500).json({ success: false, message: 'Error signing in' });
    }
  },

  // Verify token middleware
  verifyToken: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  },

  // Check admin role middleware
  checkAdminRole: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    next();
  }
};

module.exports = authController;