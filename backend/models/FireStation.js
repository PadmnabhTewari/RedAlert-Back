const db = require('../config/db');

class FireStation {
  static async create(stationData) {
    const { name, pincode, city, state, streetAddress, landmark, latitude, longitude, contactNumber } = stationData;
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Ensure pincode exists
      await connection.query(
        'INSERT IGNORE INTO PincodeMapping (Pincode, City, State) VALUES (?, ?, ?)',
        [pincode, city, state]
      );

      // 2. Create location
      const [locationResult] = await connection.query(
        `INSERT INTO StationLocation 
        (Pincode, Street_Address, Landmark, Latitude, Longitude) 
        VALUES (?, ?, ?, ?, ?)`,
        [pincode, streetAddress, landmark, latitude, longitude]
      );
      const locationId = locationResult.insertId;

      // 3. Create fire station
      const [stationResult] = await connection.query(
        `INSERT INTO FireStation 
        (Name, Location_ID, Contact_Number) 
        VALUES (?, ?, ?)`,
        [name, locationId, contactNumber]
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
      return stationId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const [rows] = await db.query(`
      SELECT 
        fs.Station_ID, 
        fs.Name, 
        fc.Contact_Value AS Contact_Number,
        fs.Status,
        fs.Establishment_Date,
        fs.Capacity,
        sl.Street_Address,
        sl.Landmark,
        sl.Latitude,
        sl.Longitude,
        pm.City,
        pm.State,
        pm.Pincode
      FROM FireStation fs
      JOIN StationLocation sl ON fs.Location_ID = sl.Location_ID
      JOIN PincodeMapping pm ON sl.Pincode = pm.Pincode
      LEFT JOIN FireStationContact fc ON fs.Station_ID = fc.Station_ID AND fc.Contact_Type = 'Primary'
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        fs.*,
        sl.*,
        pm.City,
        pm.State,
        GROUP_CONCAT(DISTINCT fsc.Contact_Value) AS Contact_Numbers
      FROM FireStation fs
      JOIN StationLocation sl ON fs.Location_ID = sl.Location_ID
      JOIN PincodeMapping pm ON sl.Pincode = pm.Pincode
      LEFT JOIN FireStationContact fsc ON fs.Station_ID = fsc.Station_ID
      WHERE fs.Station_ID = ?
      GROUP BY fs.Station_ID
    `, [id]);
    return rows[0] || null;
  }

  static async update(id, updateData) {
    const { name, contactNumber, streetAddress, landmark, latitude, longitude } = updateData;
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update fire station basic info
      if (name) {
        await connection.query(
          'UPDATE FireStation SET Name = ? WHERE Station_ID = ?',
          [name, id]
        );
      }

      // 2. Update primary contact if changed
      if (contactNumber) {
        await connection.query(
          `UPDATE FireStationContact 
          SET Contact_Value = ? 
          WHERE Station_ID = ? AND Contact_Type = 'Primary'`,
          [contactNumber, id]
        );
        
        // Also update main contact number in FireStation table
        await connection.query(
          'UPDATE FireStation SET Contact_Number = ? WHERE Station_ID = ?',
          [contactNumber, id]
        );
      }

      // 3. Update location info if provided
      if (streetAddress || landmark || latitude || longitude) {
        const station = await this.findById(id);
        const updateFields = [];
        const updateValues = [];
        
        if (streetAddress) {
          updateFields.push('Street_Address = ?');
          updateValues.push(streetAddress);
        }
        if (landmark) {
          updateFields.push('Landmark = ?');
          updateValues.push(landmark);
        }
        if (latitude) {
          updateFields.push('Latitude = ?');
          updateValues.push(latitude);
        }
        if (longitude) {
          updateFields.push('Longitude = ?');
          updateValues.push(longitude);
        }
        
        if (updateFields.length > 0) {
          await connection.query(
            `UPDATE StationLocation 
            SET ${updateFields.join(', ')} 
            WHERE Location_ID = ?`,
            [...updateValues, station.Location_ID]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    // No need for explicit deletion of related records due to ON DELETE CASCADE
    const [result] = await db.query(
      'DELETE FROM FireStation WHERE Station_ID = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = FireStation;