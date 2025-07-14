const router = require("express").Router();
const upload_avatarRoutes = require("./upload_avatarRoutes");

router.use("/upload/single", upload_avatarRoutes);
module.exports = router;