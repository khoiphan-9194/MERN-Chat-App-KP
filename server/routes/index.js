const router = require("express").Router();
const uploadRoutes = require("./upload_avatarRoutes");

// Prefix the upload route
router.use("/upload", uploadRoutes);

// Example: this makes POST /api/upload/single available on server
module.exports = router;
