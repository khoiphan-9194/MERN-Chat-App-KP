const router = require("express").Router();
const uploadAvatarRoutes = require("./upload_avatarRoutes");

// This makes POST /api/upload/single available
router.use("/upload", uploadAvatarRoutes);

module.exports = router;
