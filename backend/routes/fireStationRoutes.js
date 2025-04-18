const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Get all fire stations with complete location details
router.get("/", async (req, res) => {
  try {
    const { sortBy = 'Name', sortOrder = 'ASC' } = req.query;
    
    // Validate sort parameters
    const validSortFields = ['Name', 'Total_Staff', 'Total_Vehicles'];
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }
    if (!['ASC', 'DESC'].includes(sortOrder)) {
      return res.status(400).json({ error: "Invalid sort order" });
    }

    let orderByClause;
    switch(sortBy) {
      case 'Name':
        orderByClause = 'fs.Name';
        break;
      case 'Total_Staff':
        orderByClause = '(SELECT COUNT(*) FROM Staff s WHERE s.Station_ID = fs.Station_ID)';
        break;
      case 'Total_Vehicles':
        orderByClause = '(SELECT COUNT(*) FROM FireStationVehicle fsv WHERE fsv.Station_ID = fs.Station_ID)';
        break;
      default:
        orderByClause = 'fs.Name';
    }

    const query = `
      SELECT * FROM (
        SELECT 
          fs.Station_ID, 
          fs.Name, 
          fs.Contact_Number,
          fs.Status,
          fs.Establishment_Date,
          fs.Capacity,
          sl.Street_Address,
          sl.Landmark,
          sl.Latitude,
          sl.Longitude,
          pm.City,
          pm.State,
          pm.Pincode,
          (SELECT COUNT(*) FROM Staff s WHERE s.Station_ID = fs.Station_ID) AS Total_Staff,
          (SELECT COUNT(*) FROM FireStationVehicle fsv WHERE fsv.Station_ID = fs.Station_ID) AS Total_Vehicles,
          GROUP_CONCAT(DISTINCT fsc.Contact_Value) AS Additional_Contacts
        FROM FireStation fs
        JOIN StationLocation sl ON fs.Location_ID = sl.Location_ID
        JOIN PincodeMapping pm ON sl.Pincode = pm.Pincode
        LEFT JOIN FireStationContact fsc ON fs.Station_ID = fsc.Station_ID
        GROUP BY fs.Station_ID
      ) AS derived_table
      ORDER BY 
        CASE 
          WHEN ? = 'Name' THEN Name
          WHEN ? = 'Total_Staff' THEN CAST(Total_Staff AS SIGNED)
          WHEN ? = 'Total_Vehicles' THEN CAST(Total_Vehicles AS SIGNED)
        END ${sortOrder}
    `;

    console.log('Executing query with order by:', orderByClause, sortOrder);
    const [rows] = await pool.query(query, [sortBy, sortBy, sortBy]);
    console.log('Query executed successfully, returning', rows.length, 'rows');
    console.log('First few rows:', rows.slice(0, 3).map(row => ({
      name: row.Name,
      staff: row.Total_Staff,
      vehicles: row.Total_Vehicles
    })));
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching fire stations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new fire station with complete location details
router.post("/", async (req, res) => {
  const { 
    name, 
    contactNumber, 
    pincode, 
    city, 
    state, 
    streetAddress, 
    landmark, 
    latitude, 
    longitude,
    status = 'Active',
    establishmentDate,
    capacity
  } = req.body;

  // Validate required fields
  if (!name || !contactNumber || !pincode || !city || !state || !streetAddress) {
    return res.status(400).json({ 
      error: "⚠️ Name, contact number, pincode, city, state, and street address are required!" 
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Ensure pincode exists
    await connection.query(
      `INSERT INTO PincodeMapping (Pincode, City, State) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE City = VALUES(City), State = VALUES(State)`,
      [pincode, city, state]
    );

    // 2. Create location
    const [locationResult] = await connection.query(
      `INSERT INTO StationLocation 
      (Pincode, Street_Address, Landmark, Latitude, Longitude) 
      VALUES (?, ?, ?, ?, ?)`,
      [pincode, streetAddress, landmark || null, latitude || null, longitude || null]
    );
    const locationId = locationResult.insertId;

    // 3. Create fire station
    const [stationResult] = await connection.query(
      `INSERT INTO FireStation 
      (Name, Location_ID, Contact_Number, Status, Establishment_Date, Capacity) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, locationId, contactNumber, status, establishmentDate || null, capacity || null]
    );
    const stationId = stationResult.insertId;

    // 4. Create primary contact record
    await connection.query(
      `INSERT INTO FireStationContact 
      (Station_ID, Contact_Type, Contact_Value) 
      VALUES (?, 'Primary', ?)`,
      [stationId, contactNumber]
    );

    await connection.commit();
    res.status(201).json({ 
      message: `✅ Fire station "${name}" added successfully!`, 
      id: stationId 
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error adding fire station:", error);
    res.status(500).json({ 
      error: "Failed to add fire station.",
      details: error.message 
    });
  } finally {
    connection.release();
  }
});

// Get stations for dropdown (minimal data)
router.get("/dropdown", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT Station_ID, Name
      FROM FireStation
      WHERE Status = 'Active'
      ORDER BY Name
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching stations for dropdown:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;