const express = require('express');
const router = express.Router();
const supplyTransactionController = require('../controllers/supplyTransactionController');

// Get all transactions
router.get('/', supplyTransactionController.getTransactions);

// Get a single transaction
router.get('/:id', supplyTransactionController.getTransactionById);

// Create a new transaction
router.post('/', supplyTransactionController.createTransaction);

// Update a transaction
router.put('/:id', supplyTransactionController.updateTransaction);

// Delete a transaction
router.delete('/:id', supplyTransactionController.deleteTransaction);

// Get supplier transactions
router.get('/supplier/:id', supplyTransactionController.getSupplierTransactions);

// Get item transactions
router.get('/item/:id', supplyTransactionController.getItemTransactions);

module.exports = router; 