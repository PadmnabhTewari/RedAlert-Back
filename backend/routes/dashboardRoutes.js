const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get dashboard statistics
router.get("/", async (req, res) => {
  try {
    const [[{ fireStations }]] = await pool.query("SELECT COUNT(*) AS fireStations FROM FireStation");
    const [[{ vehicles }]] = await pool.query("SELECT COUNT(*) AS vehicles FROM Vehicle");
    const [[{ staff }]] = await pool.query("SELECT COUNT(*) AS staff FROM Staff");
    const [[{ reports }]] = await pool.query("SELECT COUNT(*) AS reports FROM Report");

    res.json({ fireStations, vehicles, staff, reports });
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
