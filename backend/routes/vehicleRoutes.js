const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get all vehicles with model details
router.get("/", async (req, res) => {
  const { sort } = req.query; // Get the sort query parameter
  let sortQuery = "";

  if (sort === "maintenance_asc") {
    sortQuery = "ORDER BY v.Last_Maintenance_Date ASC";
  } else if (sort === "maintenance_desc") {
    sortQuery = "ORDER BY v.Last_Maintenance_Date DESC";
  }

  try {
    const [rows] = await pool.query(`
      SELECT v.Vehicle_ID, vm.Type AS Model_Type, v.Status, v.Last_Maintenance_Date,
             fsv.Station_ID, fs.Name AS Station_Name
      FROM Vehicle v
      JOIN VehicleModel vm ON v.Model_ID = vm.Model_ID
      LEFT JOIN FireStationVehicle fsv ON v.Vehicle_ID = fsv.Vehicle_ID
      LEFT JOIN FireStation fs ON fsv.Station_ID = fs.Station_ID
      ${sortQuery}
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all vehicle models
router.get("/models", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT Model_ID, Type FROM VehicleModel");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching vehicle models:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new vehicle
router.post("/", async (req, res) => {
  console.log("🚀 Vehicle request received:", req.body);

  const { model_id, status, last_maintenance_date, station_id } = req.body;

  if (!model_id || !status) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Ensure the vehicle model exists
    const [modelCheck] = await connection.query(
      "SELECT * FROM VehicleModel WHERE Model_ID = ?",
      [model_id]
    );

    if (modelCheck.length === 0) {
      console.log("❌ Vehicle model does not exist");
      await connection.rollback();
      return res.status(400).json({ error: "Invalid vehicle model. Please add the model first." });
    }

    // Insert into Vehicle table
    const [result] = await connection.query(
      "INSERT INTO Vehicle (Model_ID, Status, Last_Maintenance_Date) VALUES (?, ?, ?)",
      [model_id, status, last_maintenance_date || new Date()]
    );

    // If station_id is provided, insert into FireStationVehicle junction table
    if (station_id) {
      await connection.query(
        "INSERT INTO FireStationVehicle (Station_ID, Vehicle_ID) VALUES (?, ?)",
        [station_id, result.insertId]
      );
    }

    await connection.commit();
    console.log("✅ Vehicle added to database, ID:", result.insertId);
    res.json({ message: "✅ Vehicle added", id: result.insertId });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Failed to add vehicle." });
  } finally {
    connection.release();
  }
});

module.exports = router;
