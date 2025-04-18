const express = require("express");
const router = express.Router();
const { getAllReports, updateReportStatus } = require("../controllers/adminReportController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getAllReports);
router.patch("/:id/status", authenticateToken, updateReportStatus);

module.exports = router;
