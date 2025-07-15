const router = require("express").Router();
const uploadAvatarRoutes = require("./upload_avatarRoutes");

router.use("/upload/single", uploadAvatarRoutes); // makes POST /api/upload/single

module.exports = router;
