const db = require('../config/db');

exports.getMaintenanceData = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Maintenance');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching maintenance data' });
  }
};

exports.addMaintenanceRecord = async (req, res) => {
  const { Vehicle_ID, Maintenance_Type, Cost, Performed_By } = req.body;

  if (!Vehicle_ID || !Maintenance_Type || !Cost || !Performed_By) {
    return res.status(400).json({ error: "⚠️ Vehicle ID, Maintenance Type, Cost, and Performed By are required!" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO Maintenance (Vehicle_ID, Maintenance_Type, Cost, Performed_By) VALUES (?, ?, ?, ?)",
      [Vehicle_ID, Maintenance_Type, Cost, Performed_By]
    );
    res.json({ message: `✅ Maintenance record added!`, id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add maintenance record." });
  }
};