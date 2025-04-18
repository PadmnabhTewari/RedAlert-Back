const db = require('../config/db');

class Vehicle {
  static async create(vehicle) {
    const { Model_ID, Status, Last_Maintenance_Date, Station_ID } = vehicle;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert into Vehicle table
      const [result] = await connection.query(
        'INSERT INTO Vehicle (Model_ID, Status, Last_Maintenance_Date) VALUES (?, ?, ?)',
        [Model_ID, Status, Last_Maintenance_Date]
      );
      
      // If Station_ID is provided, insert into FireStationVehicle junction table
      if (Station_ID) {
        await connection.query(
          'INSERT INTO FireStationVehicle (Station_ID, Vehicle_ID) VALUES (?, ?)',
          [Station_ID, result.insertId]
        );
      }
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    const [rows] = await db.query(
      `SELECT v.Vehicle_ID, v.Status, v.Last_Maintenance_Date, 
              vm.Type AS Model_Type,
              fsv.Station_ID,
              fs.Name AS Station_Name
       FROM Vehicle v
       JOIN VehicleModel vm ON v.Model_ID = vm.Model_ID
       LEFT JOIN FireStationVehicle fsv ON v.Vehicle_ID = fsv.Vehicle_ID
       LEFT JOIN FireStation fs ON fsv.Station_ID = fs.Station_ID`
    );
    return rows;
  }
}

module.exports = Vehicle;