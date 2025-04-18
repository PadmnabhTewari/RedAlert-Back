const db = require('../config/db');

class Inventory {
  static async create(inventory) {
    const { Item_Name, Quantity, Station_ID, Supplier_ID } = inventory;
    const [result] = await db.query(
      'INSERT INTO Inventory (Item_Name, Quantity, Station_ID, Supplier_ID) VALUES (?, ?, ?, ?)',
      [Item_Name, Quantity, Station_ID, Supplier_ID]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM Inventory');
    return rows;
  }
}

module.exports = Inventory;