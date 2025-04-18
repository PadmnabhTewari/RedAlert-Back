const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    // Example: Fetch total staff, vehicles, and reports for the dashboard
    const [staffCount] = await db.query('SELECT COUNT(*) AS totalStaff FROM staff');
    const [vehicleCount] = await db.query('SELECT COUNT(*) AS totalVehicles FROM vehicles');
    const [reportCount] = await db.query('SELECT COUNT(*) AS totalReports FROM reports');

    res.json({
      totalStaff: staffCount[0].totalStaff,
      totalVehicles: vehicleCount[0].totalVehicles,
      totalReports: reportCount[0].totalReports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};