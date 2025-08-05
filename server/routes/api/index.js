const router = require("express").Router();
const uploadAvatarRoutes = require("./upload_avatarRoutes");

// Prefix all upload routes with /upload
// e.g., POST /api/upload/single
router.use("/upload", uploadAvatarRoutes);

module.exports = router;
