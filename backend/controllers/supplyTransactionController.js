const SupplyTransaction = require('../models/SupplyTransaction');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await SupplyTransaction.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await SupplyTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { Supplier_ID, Item_ID, Quantity, Price, Transaction_Date } = req.body;

    // Validate required fields
    if (!Supplier_ID || !Item_ID || !Quantity || !Price || !Transaction_Date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transactionId = await SupplyTransaction.create(req.body);
    const transaction = await SupplyTransaction.findById(transactionId);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { Supplier_ID, Item_ID, Quantity, Price, Transaction_Date } = req.body;

    // Validate required fields
    if (!Supplier_ID || !Item_ID || !Quantity || !Price || !Transaction_Date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const success = await SupplyTransaction.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const transaction = await SupplyTransaction.findById(req.params.id);
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const success = await SupplyTransaction.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

exports.getSupplierTransactions = async (req, res) => {
  try {
    const transactions = await SupplyTransaction.getSupplierTransactions(req.params.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching supplier transactions:', error);
    res.status(500).json({ error: 'Failed to fetch supplier transactions' });
  }
};

exports.getItemTransactions = async (req, res) => {
  try {
    const transactions = await SupplyTransaction.getItemTransactions(req.params.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    res.status(500).json({ error: 'Failed to fetch item transactions' });
  }
}; 