const db = require('../config/db');

class Report {
  static async create(report) {
    const {
      Street_Address,
      City,
      State,
      Pincode,
      Description,
      Severity_Level,
      User_ID,
      Action_Taken,
      Action_Date_Time,
      Admin_ID,
      Assigned_Vehicle,
      Assigned_Staff,
    } = report;
    const [result] = await db.query(
      'INSERT INTO Report (Street_Address, City, State, Pincode, Description, Severity_Level, User_ID, Action_Taken, Action_Date_Time, Admin_ID, Assigned_Vehicle, Assigned_Staff) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        Street_Address,
        City,
        State,
        Pincode,
        Description,
        Severity_Level,
        User_ID,
        Action_Taken,
        Action_Date_Time,
        Admin_ID,
        Assigned_Vehicle,
        Assigned_Staff,
      ]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM Report');
    return rows;
  }
}

module.exports = Report;