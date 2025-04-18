const express = require("express");
const router = express.Router();
const { getUserReports, addReport } = require("../controllers/userReportController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getUserReports);
router.post("/", authenticateToken, addReport);

module.exports = router;
