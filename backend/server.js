const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const fireStationRoutes = require("./routes/fireStationRoutes");
const authRoutes = require("./routes/authRoutes");
const adminReportRoutes = require("./routes/adminReportRoutes"); // ✅ Admin Reports
const userReportRoutes = require("./routes/userReportRoutes");   // ✅ User Reports
const staffRoutes = require("./routes/staffRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const supplierRoutes = require('./routes/supplierRoutes');
const maintenanceRoutes = require('./routes/maintainanceRoutes');
const itemRoutes = require('./routes/itemRoutes');


dotenv.config();
const app = express();

app.use(cors({ origin: "*" })); 
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/reports", adminReportRoutes);  // ✅ Admin reports
app.use("/api/user/reports", userReportRoutes);    // ✅ User reports
app.use("/api/staff", staffRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/fire-stations", fireStationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/items', itemRoutes);  // ✅ Added Items routes


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});