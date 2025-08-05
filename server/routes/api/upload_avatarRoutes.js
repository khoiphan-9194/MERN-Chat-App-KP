const router = require("express").Router();
const { uploadAvatar } = require("../../controllers/uploadController");

router.post("/single", uploadAvatar); // This handles POST /api/upload/single

module.exports = router;
