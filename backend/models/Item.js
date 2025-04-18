const db = require('../config/db');

class Item {
  static async create(item) {
    const { Name, Category } = item;
    
    try {
      const [result] = await db.query(
        'INSERT INTO Item (Name, Category) VALUES (?, ?)',
        [Name, Category]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const [rows] = await db.query(`
      SELECT 
        i.Item_ID,
        i.Name,
        i.Category,
        COUNT(DISTINCT si.Supplier_ID) as Total_Suppliers,
        GROUP_CONCAT(DISTINCT s.Name) as Suppliers
      FROM Item i
      LEFT JOIN SupplierItem si ON i.Item_ID = si.Item_ID
      LEFT JOIN Supplier s ON si.Supplier_ID = s.Supplier_ID
      GROUP BY i.Item_ID
      ORDER BY i.Name
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        i.Item_ID,
        i.Name,
        i.Category,
        COUNT(DISTINCT si.Supplier_ID) as Total_Suppliers,
        GROUP_CONCAT(DISTINCT s.Name) as Suppliers
      FROM Item i
      LEFT JOIN SupplierItem si ON i.Item_ID = si.Item_ID
      LEFT JOIN Supplier s ON si.Supplier_ID = s.Supplier_ID
      WHERE i.Item_ID = ?
      GROUP BY i.Item_ID
    `, [id]);
    return rows[0];
  }

  static async update(id, item) {
    const { Name, Category } = item;
    
    try {
      await db.query(
        'UPDATE Item SET Name = ?, Category = ? WHERE Item_ID = ?',
        [Name, Category, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Delete from SupplierItem first (due to foreign key constraint)
      await db.query('DELETE FROM SupplierItem WHERE Item_ID = ?', [id]);
      // Then delete from Item
      await db.query('DELETE FROM Item WHERE Item_ID = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getItemSuppliers(itemId) {
    const [rows] = await db.query(`
      SELECT 
        si.Item_ID,
        si.Supplier_ID,
        si.Price,
        s.Name as Supplier_Name,
        s.Contact_Phone,
        s.Email
      FROM SupplierItem si
      JOIN Supplier s ON si.Supplier_ID = s.Supplier_ID
      WHERE si.Item_ID = ?
      ORDER BY s.Name
    `, [itemId]);
    return rows;
  }
}

module.exports = Item; 