const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const fs = require('fs');

const {
  addStore,
  getStores,
  store_delete,
  getStore,
  store_update,
} = require("../controllers/storeController");

const { CatchResponse, FormatFileSize } = require('../utils/helpers');

const { MAX_FILE_SIZE } = require('../utils/constants');

const contentImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.params.id;
    const dir = path.join(__dirname, '..', 'images', 'content-images', id);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadContentImage = multer({
  storage: contentImagesStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
}).single('image');

router.get("/pull", getStores);
router.get("/:id", getStore);
router.post("/", addStore);
router.patch("/:id", store_update);
router.delete("/:id", store_delete);

router.post('/content-images/:id', async (req, res) => {
  try {
    uploadContentImage(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const fileSize = FormatFileSize(MAX_FILE_SIZE);
          return res.status(400).json({
            statusCode: 400,
            error: `File too large. Maximum size is ${fileSize} MB!`,
          });
        }
        return res.status(400).json({
          statusCode: 400,
          error: `Multer error: ${err.message}`,
        });
      } else if (err) {
        return res.status(500).json({
          statusCode: 500,
          error: `Server error: ${err.message}!`,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          statusCode: 400,
          error: 'No image file provided!',
        });
      }

      res.status(200).json({
        message: 'Image saved successfully!',
      });
    });
  } catch (error) {
    CatchResponse({
      res,
      err: error
    });
  }
});

module.exports = router;