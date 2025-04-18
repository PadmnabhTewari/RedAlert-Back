const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get all maintenance records
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Maintenance");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching maintenance records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new maintenance record
router.post("/", async (req, res) => {
  const { Vehicle_ID, Maintenance_Type, Date_Performed, Cost, Performed_By } = req.body;

  // Ensure required fields are provided
  if (!Vehicle_ID || !Maintenance_Type || !Date_Performed || !Cost || !Performed_By) {
    return res.status(400).json({ error: "⚠️ All fields are required!" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO Maintenance (Vehicle_ID, Maintenance_Type, Date_Performed, Cost, Performed_By) VALUES (?, ?, ?, ?, ?)",
      [Vehicle_ID, Maintenance_Type, Date_Performed, Cost, Performed_By]
    );
    res.json({ message: `✅ Maintenance record added for vehicle "${Vehicle_ID}"!`, id: result.insertId });
  } catch (error) {
    console.error("❌ Error adding maintenance record:", error);
    res.status(500).json({ error: "Failed to add maintenance record." });
  }
});

module.exports = router;
