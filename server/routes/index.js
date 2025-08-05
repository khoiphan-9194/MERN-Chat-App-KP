const router = require("express").Router();
const apiRoutes = require("./api");

// All API routes will be prefixed with /api
router.use("/api", apiRoutes);
// If no API routes are hit, send the React app
// Optional: Add 404 fallback for unknown routes
// router.use((req, res) => {
//   res.status(404).json({ error: "Wrong route! from routes/index.js" });
// });

module.exports = router;
