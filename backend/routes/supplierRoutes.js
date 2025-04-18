const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// Get all suppliers
router.get('/', supplierController.getSuppliers);

// Get all supplier items
router.get('/items/all', supplierController.getAllSupplierItems);

// Get a single supplier
router.get('/:id', supplierController.getSupplierById);

// Create a new supplier
router.post('/', supplierController.createSupplier);

// Update a supplier
router.put('/:id', supplierController.updateSupplier);

// Delete a supplier
router.delete('/:id', supplierController.deleteSupplier);

// Get supplier items
router.get('/:id/items', supplierController.getSupplierItems);

// Add item to supplier
router.post('/:id/items', supplierController.addSupplierItem);

// Update supplier item
router.put('/:id/items/:Item_ID', supplierController.updateSupplierItem);

// Delete supplier item
router.delete('/:id/items/:Item_ID', supplierController.deleteSupplierItem);

module.exports = router;
