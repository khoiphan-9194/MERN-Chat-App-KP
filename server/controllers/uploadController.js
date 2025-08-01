const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadAvatar = async (req, res) => {
  //this avatarDir is the directory where the uploaded files will be stored
  const avatarDir = path.join(__dirname, "../../client/public/userAvatar");
  console.log("Avatar directory:", avatarDir);

  // Check if the directory exists, if not, create it
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    },
  });

  const upload = multer({ storage }).single("file");

  upload(req, res, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }

    console.log("Uploaded:", req.file);

    return res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  });
};

module.exports = { uploadAvatar };
