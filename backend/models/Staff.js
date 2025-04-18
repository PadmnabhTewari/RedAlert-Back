const db = require('../config/db');

class Staff {
  static async create(staff) {
    const { Name, Designation, Contact, Email, Station_ID, Shift, Shift_Date } = staff;
    
    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // First check if the station exists
      const [station] = await connection.query(
        'SELECT Station_ID FROM FireStation WHERE Station_ID = ?',
        [Station_ID]
      );

      if (!station || station.length === 0) {
        throw new Error('Invalid Station_ID: Station does not exist');
      }

      // Insert into Staff table
      const [result] = await connection.query(
        'INSERT INTO Staff (Name, Designation, Contact, Email, Station_ID) VALUES (?, ?, ?, ?, ?)',
        [Name, Designation, Contact, Email, Station_ID]
      );
      const staffId = result.insertId;

      // Insert into StaffShift table with date in YYYY-MM-DD format
      await connection.query(
        'INSERT INTO StaffShift (Staff_ID, Shift, Shift_Date) VALUES (?, ?, ?)',
        [staffId, Shift, Shift_Date]
      );

      await connection.commit();
      return staffId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll(shift) {
    let query = `
      SELECT 
        s.Staff_ID,
        s.Name,
        s.Designation,
        s.Contact,
        s.Email,
        s.Station_ID,
        ss.Shift,
        DATE_FORMAT(ss.Shift_Date, '%Y-%m-%d') as Shift_Date,
        ss.Shift_ID
      FROM Staff s
      JOIN StaffShift ss ON s.Staff_ID = ss.Staff_ID
    `;
    const params = [];

    if (shift) {
      query += ` WHERE ss.Shift = ?`;
      params.push(shift);
    }

    query += ` ORDER BY ss.Shift_Date DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query(`
      SELECT 
        s.Staff_ID,
        s.Name,
        s.Designation,
        s.Contact,
        s.Email,
        s.Station_ID,
        ss.Shift,
        DATE_FORMAT(ss.Shift_Date, '%Y-%m-%d') as Shift_Date,
        ss.Shift_ID
      FROM Staff s
      JOIN StaffShift ss ON s.Staff_ID = ss.Staff_ID
      WHERE s.Staff_ID = ?
      ORDER BY ss.Shift_Date DESC
      LIMIT 1
    `, [id]);
    return rows[0];
  }

  static async update(id, staff) {
    const { Name, Designation, Contact, Email, Station_ID, Shift, Shift_Date } = staff;
    
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if staff exists
      const [existingStaff] = await connection.query(
        'SELECT Staff_ID FROM Staff WHERE Staff_ID = ?',
        [id]
      );

      if (!existingStaff || existingStaff.length === 0) {
        throw new Error('Staff member not found');
      }

      // Check if new station exists
      const [station] = await connection.query(
        'SELECT Station_ID FROM FireStation WHERE Station_ID = ?',
        [Station_ID]
      );

      if (!station || station.length === 0) {
        throw new Error('Invalid Station_ID: Station does not exist');
      }

      // Update Staff table
      await connection.query(
        'UPDATE Staff SET Name = ?, Designation = ?, Contact = ?, Email = ?, Station_ID = ? WHERE Staff_ID = ?',
        [Name, Designation, Contact, Email, Station_ID, id]
      );

      // Update StaffShift table with date in YYYY-MM-DD format
      await connection.query(
        'UPDATE StaffShift SET Shift = ?, Shift_Date = ? WHERE Staff_ID = ?',
        [Shift, Shift_Date, id]
      );

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
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Check if staff exists
      const [existingStaff] = await connection.query(
        'SELECT Staff_ID FROM Staff WHERE Staff_ID = ?',
        [id]
      );

      if (!existingStaff || existingStaff.length === 0) {
        throw new Error('Staff member not found');
      }

      // Delete from StaffShift first (due to foreign key constraint)
      await connection.query('DELETE FROM StaffShift WHERE Staff_ID = ?', [id]);
      // Then delete from Staff
      await connection.query('DELETE FROM Staff WHERE Staff_ID = ?', [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Staff;