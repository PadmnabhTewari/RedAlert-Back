const db = require("../config/db");

exports.getUserReports = async (req, res) => {
    try {
      console.log("User ID:", req.userId); // Debugging line
  
      const [reports] = await db.query(
        "SELECT * FROM Report WHERE User_ID = ? ORDER BY Report_Date_Time DESC",
        [req.userId]
      );
  
      console.log("Fetched Reports:", reports); // Debugging line
      res.json(reports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

// Add a new report
exports.addReport = async (req, res) => {
  try {
    const { Street_Address, Pincode, Description, Severity_Level } = req.body;

    if (!Street_Address || !Pincode || !Description || !Severity_Level) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await db.query(
      "INSERT INTO Report (Street_Address, Pincode, Description, Severity_Level, User_ID, Status) VALUES (?, ?, ?, ?, ?, 'Pending')",
      [Street_Address, Pincode, Description, Severity_Level, req.userId]
    );

    res.status(201).json({ message: "✅ Report added successfully!" });
  } catch (error) {
    console.error("Error adding report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
