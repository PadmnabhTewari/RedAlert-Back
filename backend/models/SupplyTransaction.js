const pool = require('../config/db');

class SupplyTransaction {
  static async create(transactionData) {
    const { Supplier_ID, Item_ID, Quantity, Price, Transaction_Date } = transactionData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO SupplyTransaction (Supplier_ID, Item_ID, Quantity, Price, Transaction_Date) VALUES (?, ?, ?, ?, ?)',
        [Supplier_ID, Item_ID, Quantity, Price, Transaction_Date]
      );
      
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          st.*,
          s.Name as Supplier_Name,
          i.Name as Item_Name
        FROM SupplyTransaction st
        JOIN Supplier s ON st.Supplier_ID = s.Supplier_ID
        JOIN Item i ON st.Item_ID = i.Item_ID
        ORDER BY st.Transaction_Date DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          st.*,
          s.Name as Supplier_Name,
          i.Name as Item_Name
        FROM SupplyTransaction st
        JOIN Supplier s ON st.Supplier_ID = s.Supplier_ID
        JOIN Item i ON st.Item_ID = i.Item_ID
        WHERE st.Transaction_ID = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, transactionData) {
    const { Supplier_ID, Item_ID, Quantity, Price, Transaction_Date } = transactionData;
    
    try {
      const [result] = await pool.query(
        'UPDATE SupplyTransaction SET Supplier_ID = ?, Item_ID = ?, Quantity = ?, Price = ?, Transaction_Date = ? WHERE Transaction_ID = ?',
        [Supplier_ID, Item_ID, Quantity, Price, Transaction_Date, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM SupplyTransaction WHERE Transaction_ID = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getSupplierTransactions(supplierId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          st.*,
          i.Name as Item_Name
        FROM SupplyTransaction st
        JOIN Item i ON st.Item_ID = i.Item_ID
        WHERE st.Supplier_ID = ?
        ORDER BY st.Transaction_Date DESC
      `, [supplierId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getItemTransactions(itemId) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          st.*,
          s.Name as Supplier_Name
        FROM SupplyTransaction st
        JOIN Supplier s ON st.Supplier_ID = s.Supplier_ID
        WHERE st.Item_ID = ?
        ORDER BY st.Transaction_Date DESC
      `, [itemId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SupplyTransaction; 