const express = require('express');
const router = express.Router();
const supplierRoutes = require('./supplierRoutes');
const itemRoutes = require('./itemRoutes');
const supplyTransactionRoutes = require('./supplyTransactionRoutes');

// Mount routes
router.use('/suppliers', supplierRoutes);
router.use('/items', itemRoutes);
router.use('/supply-transactions', supplyTransactionRoutes);

module.exports = router; 