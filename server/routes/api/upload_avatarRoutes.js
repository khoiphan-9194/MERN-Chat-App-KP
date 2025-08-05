const router = require("express").Router();
const { uploadAvatar } = require("../../controllers/uploadController");

// POST /api/upload/single
router.post("/single", uploadAvatar);

module.exports = router;
