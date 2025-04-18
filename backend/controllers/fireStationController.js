const FireStation = require('../models/FireStation');
const PincodeMapping = require('../models/PincodeMapping');
const StationLocation = require('../models/StationLocation');

exports.createFireStation = async (req, res) => {
  try {
    const { name, contactNumber, pincode, city, state, streetAddress, landmark, latitude, longitude } = req.body;
    
    // Start transaction for multiple table operations
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Ensure pincode exists
      await PincodeMapping.create({ pincode, city, state });
      
      // 2. Create location
      const locationId = await StationLocation.create({
        pincode,
        streetAddress,
        landmark,
        latitude,
        longitude
      });
      
      // 3. Create fire station
      const stationId = await FireStation.create({
        name,
        locationId,
        contactNumber
      });

      // 4. Create primary contact record
      await FireStationContact.create({
        stationId,
        contactType: 'Primary',
        contactValue: contactNumber
      });

      await connection.commit();
      res.status(201).json({ id: stationId });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating fire station' });
  }
};

exports.getFireStations = async (req, res) => {
  try {
    const stations = await db.query(`
      SELECT 
        fs.Station_ID, 
        fs.Name, 
        fc.Contact_Value AS ContactNumber,
        fs.Status,
        sl.Street_Address,
        sl.Landmark,
        sl.Latitude,
        sl.Longitude,
        pm.City,
        pm.State,
        pm.Pincode,
        (SELECT COUNT(*) FROM Staff s WHERE s.Station_ID = fs.Station_ID) AS StaffCount,
        (SELECT COUNT(*) FROM FireStationVehicle fsv WHERE fsv.Station_ID = fs.Station_ID) AS VehicleCount
      FROM FireStation fs
      JOIN StationLocation sl ON fs.Location_ID = sl.Location_ID
      JOIN PincodeMapping pm ON sl.Pincode = pm.Pincode
      LEFT JOIN FireStationContact fc ON fs.Station_ID = fc.Station_ID AND fc.Contact_Type = 'Primary'
      ORDER BY fs.Name
    `);

    res.json(stations[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching fire stations' });
  }
};