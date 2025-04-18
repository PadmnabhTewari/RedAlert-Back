const db = require("../config/db");

// Get all reports (Admins only)
exports.getAllReports = async (req, res) => {
  try {
    const { severity, status } = req.query;
    let query = "SELECT * FROM Report WHERE 1=1";
    const params = [];

    if (severity) {
      query += " AND Severity_Level = ?";
      params.push(severity);
    }

    if (status) {
      query += " AND Status = ?";
      params.push(status);
    }

    query += " ORDER BY Report_Date_Time DESC";

    const [reports] = await db.query(query, params);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Fix: Use 'id' instead of 'reportId'
    const { Status } = req.body;

    console.log("🔍 Received Request to Update Status");
    console.log("📌 Report ID:", id);
    console.log("📌 New Status:", Status);

    if (!id || !Status) {
      console.log("❌ Missing Report ID or Status");
      return res.status(400).json({ error: "Report ID and Status are required" });
    }

    const [result] = await db.query(
      "UPDATE Report SET Status = ? WHERE Report_ID = ?",
      [Status, id] // ✅ Fix: Use 'id'
    );

    console.log("✅ SQL Update Result:", result);

    if (result.affectedRows === 0) {
      console.log("❌ No rows updated. Report ID may be incorrect.");
      return res.status(404).json({ error: "Report not found or status unchanged" });
    }

    res.json({ message: "✅ Report status updated successfully!" });
  } catch (error) {
    console.error("🚨 Error updating report status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
