const db = require('../config/db');

class Maintenance {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM Maintenance');
    return rows;
  }

  static async add(vehicleId, maintenanceType, cost, performedBy) {
    const [result] = await db.query(
      "INSERT INTO Maintenance (Vehicle_ID, Maintenance_Type, Cost, Performed_By) VALUES (?, ?, ?, ?)",
      [vehicleId, maintenanceType, cost, performedBy]
    );
    return result.insertId;
  }
}

module.exports = Maintenance;