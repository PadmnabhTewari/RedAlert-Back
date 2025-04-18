const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { Name, Category } = req.body;

    // Validate required fields
    if (!Name || !Category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const itemId = await Item.create(req.body);
    const item = await Item.findById(itemId);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { Name, Category } = req.body;

    // Validate required fields
    if (!Name || !Category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const success = await Item.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const item = await Item.findById(req.params.id);
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const success = await Item.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

exports.getItemSuppliers = async (req, res) => {
  try {
    const suppliers = await Item.getItemSuppliers(req.params.id);
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching item suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch item suppliers' });
  }
}; 