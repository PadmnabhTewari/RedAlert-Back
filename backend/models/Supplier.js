const db = require('../config/db');

class Supplier {
  static async create(supplier) {
    const { Name, Contact_Phone, Email, Address } = supplier;
    
    try {
      const [result] = await db.query(
        'INSERT INTO Supplier (Name, Contact_Phone, Email, Address) VALUES (?, ?, ?, ?)',
        [Name, Contact_Phone, Email, Address]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    const [rows] = await db.query(`
      SELECT 
        s.Supplier_ID,
        s.Name,
        s.Contact_Phone,
        s.Email,
        s.Address,
        GROUP_CONCAT(DISTINCT i.Name) as Items,
        COUNT(DISTINCT si.Item_ID) as Total_Items
      FROM Supplier s
      LEFT JOIN SupplierItem si ON s.Supplier_ID = si.Supplier_ID
      LEFT JOIN Item i ON si.Item_ID = i.Item_ID
      GROUP BY s.Supplier_ID
      ORDER BY s.Name
    `);
    return rows;
  }

  static async findAllSortedByTotalItems(order = 'ASC') {
    const [rows] = await db.query(`
      SELECT 
        s.Supplier_ID,
        s.Name,
        s.Contact_Phone,
        s.Email,
        s.Address,
        GROUP_CONCAT(DISTINCT i.Name) as Items,
        COUNT(DISTINCT si.Item_ID) as Total_Items
      FROM Supplier s
      LEFT JOIN SupplierItem si ON s.Supplier_ID = si.Supplier_ID
      LEFT JOIN Item i ON si.Item_ID = i.Item_ID
      GROUP BY s.Supplier_ID
      ORDER BY Total_Items ${order}
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        s.Supplier_ID,
        s.Name,
        s.Contact_Phone,
        s.Email,
        s.Address,
        GROUP_CONCAT(DISTINCT i.Name) as Items,
        COUNT(DISTINCT si.Item_ID) as Total_Items
      FROM Supplier s
      LEFT JOIN SupplierItem si ON s.Supplier_ID = si.Supplier_ID
      LEFT JOIN Item i ON si.Item_ID = i.Item_ID
      WHERE s.Supplier_ID = ?
      GROUP BY s.Supplier_ID
    `, [id]);
    return rows[0];
  }

  static async update(id, supplier) {
    const { Name, Contact_Phone, Email, Address } = supplier;
    
    try {
      await db.query(
        'UPDATE Supplier SET Name = ?, Contact_Phone = ?, Email = ?, Address = ? WHERE Supplier_ID = ?',
        [Name, Contact_Phone, Email, Address, id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Delete from SupplierItem first (due to foreign key constraint)
      await db.query('DELETE FROM SupplierItem WHERE Supplier_ID = ?', [id]);
      // Then delete from Supplier
      await db.query('DELETE FROM Supplier WHERE Supplier_ID = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getSupplierItems(supplierId) {
    const [rows] = await db.query(`
      SELECT 
        si.Supplier_ID,
        si.Item_ID,
        si.Price,
        i.Name as Item_Name,
        i.Category
      FROM SupplierItem si
      JOIN Item i ON si.Item_ID = i.Item_ID
      WHERE si.Supplier_ID = ?
      ORDER BY i.Name
    `, [supplierId]);
    return rows;
  }

  static async addSupplierItem(supplierId, itemId, price) {
    try {
      await db.query(
        'INSERT INTO SupplierItem (Supplier_ID, Item_ID, Price) VALUES (?, ?, ?)',
        [supplierId, itemId, price]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateSupplierItem(supplierId, itemId, price) {
    try {
      await db.query(
        'UPDATE SupplierItem SET Price = ? WHERE Supplier_ID = ? AND Item_ID = ?',
        [price, supplierId, itemId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async deleteSupplierItem(supplierId, itemId) {
    try {
      await db.query(
        'DELETE FROM SupplierItem WHERE Supplier_ID = ? AND Item_ID = ?',
        [supplierId, itemId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getAllSupplierItems() {
    const [rows] = await db.query(`
      SELECT 
        si.Supplier_ID,
        si.Item_ID,
        si.Price,
        s.Name as Supplier_Name,
        i.Name as Item_Name,
        i.Category
      FROM SupplierItem si
      JOIN Supplier s ON si.Supplier_ID = s.Supplier_ID
      JOIN Item i ON si.Item_ID = i.Item_ID
      ORDER BY s.Name, i.Name
    `);
    return rows;
  }
}

module.exports = Supplier;
