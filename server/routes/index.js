const router = require("express").Router();
const apiRoutes = require("./api");

// All API routes will be prefixed with /api
router.use("/api", apiRoutes);

module.exports = router;
