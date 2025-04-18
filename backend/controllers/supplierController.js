const Supplier = require('../models/Supplier');

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { Name, Contact_Phone, Email, Address } = req.body;

    // Validate required fields
    if (!Name || !Contact_Phone || !Email || !Address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const supplierId = await Supplier.create(req.body);
    const supplier = await Supplier.findById(supplierId);
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const { sortByTotalItems, order } = req.query;

    let suppliers;
    if (sortByTotalItems === 'true') {
      suppliers = await Supplier.findAllSortedByTotalItems(order || 'ASC');
    } else {
      suppliers = await Supplier.findAll();
    }

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { Name, Contact_Phone, Email, Address } = req.body;

    // Validate required fields
    if (!Name || !Contact_Phone || !Email || !Address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const success = await Supplier.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    const supplier = await Supplier.findById(req.params.id);
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const success = await Supplier.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};

exports.getSupplierItems = async (req, res) => {
  try {
    const items = await Supplier.getSupplierItems(req.params.id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching supplier items:', error);
    res.status(500).json({ error: 'Failed to fetch supplier items' });
  }
};

exports.addSupplierItem = async (req, res) => {
  try {
    const { Item_ID, Price } = req.body;
    const Supplier_ID = req.params.id;

    if (!Item_ID || !Price) {
      return res.status(400).json({ error: 'Item ID and Price are required' });
    }

    await Supplier.addSupplierItem(Supplier_ID, Item_ID, Price);
    const items = await Supplier.getSupplierItems(Supplier_ID);
    res.status(201).json(items);
  } catch (error) {
    console.error('Error adding supplier item:', error);
    res.status(500).json({ error: 'Failed to add supplier item' });
  }
};

exports.updateSupplierItem = async (req, res) => {
  try {
    const { Item_ID, Price } = req.body;
    const Supplier_ID = req.params.id;

    if (!Item_ID || !Price) {
      return res.status(400).json({ error: 'Item ID and Price are required' });
    }

    await Supplier.updateSupplierItem(Supplier_ID, Item_ID, Price);
    const items = await Supplier.getSupplierItems(Supplier_ID);
    res.json(items);
  } catch (error) {
    console.error('Error updating supplier item:', error);
    res.status(500).json({ error: 'Failed to update supplier item' });
  }
};

exports.deleteSupplierItem = async (req, res) => {
  try {
    const { Item_ID } = req.params;
    const Supplier_ID = req.params.id;

    await Supplier.deleteSupplierItem(Supplier_ID, Item_ID);
    const items = await Supplier.getSupplierItems(Supplier_ID);
    res.json(items);
  } catch (error) {
    console.error('Error deleting supplier item:', error);
    res.status(500).json({ error: 'Failed to delete supplier item' });
  }
};

exports.getAllSupplierItems = async (req, res) => {
  try {
    const items = await Supplier.getAllSupplierItems();
    res.json(items);
  } catch (error) {
    console.error('Error fetching all supplier items:', error);
    res.status(500).json({ error: 'Failed to fetch all supplier items' });
  }
};
