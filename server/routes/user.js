const express = require('express');
const { isEmpty, extend } = require('lodash');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { UpdateUser: UpdateUserDetail,  } = require('../models/user-services');

const {
  GetUser,
  UpdateUser
} = require('../controllers/user');

const { CatchResponse, TryResponse, FileReNamer, DeleteFile } = require('../utils/helpers');

const { ENDPOINTS, MAX_FILE_SIZE } = require('../utils/constants');

const AuthenticateToken = require('../middleware/auth-token');
const { CheckUserRole } = require('../middleware/check-user-role');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const type = req.body.type;
      console.log('type: ', type);

      let storagePath;

      if (type === 'profileImage') {
        storagePath = path.join(__dirname, '../images', 'userProfiles');
      } else if (type === 'coverImage') {
        storagePath = path.join(__dirname, '../images', 'userCover');
      } else {
        return cb(new Error('Invalid type specified'), null);
      }

      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }

      cb(null, storagePath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      cb(null, `${timestamp}-${file.originalname}`);
    } catch (error) {
      cb(error, null);
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'));
    }
  },
});

router.get(ENDPOINTS.USER.GET_USER, AuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id && isEmpty(id)) {
      const err = new Error();
      err.statusCode = 400;
      err.error = 'UserId is required!';
      throw err;
    }

    const response = await GetUser({
      userId: id
    });

    const { userDetails } = response;

    TryResponse({
      res,
      data: { userDetails }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.patch(ENDPOINTS.USER.UPDATE_USER, AuthenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id && isEmpty(id)) {
      const err = new Error();
      err.statusCode = 400;
      err.error = 'UserId is required!';
      throw err;
    }

    const { updateParams } = req.body;
  
    const response = await UpdateUser({
      userId: id,
      updateParams
    });

    const { userDetails, message } = response;

    TryResponse({
      res,
      message,
      data: {  userDetails }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post(ENDPOINTS.USER.UPDATE_MEDIA, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('req : ', req.file)
    if (!req.file) {
      const error = new Error();
      error.statusCode = 500;
      error.error = 'No file uploaded!';
      throw error;
    }
  
    const { userId } = req.params;
    const { type } = req.body;
    console.log('here the ', type);

    let storagePath;
    if (type === 'profileImage') {
      storagePath = path.join(__dirname, '../images', 'userProfiles');
    } else if (type === 'coverImage') {
      storagePath = path.join(__dirname, '../images', 'userCover');
    } else {
      throw new Error(`Invalid type: ${type}`);
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const newFileName = `${userId}-${timestamp}${path.extname(req.file.originalname)}`;
    const newFilePath = path.join(storagePath, newFileName);

    fs.renameSync(req.file.path, newFilePath);

    fs.readdirSync(storagePath).forEach((file) => {
      if (file.startsWith(userId) && file !== newFileName) {
        fs.unlinkSync(path.join(storagePath, file));
      }
    });

    const updateParams = {};
    let message= "";

    if (type === 'profileImage') {
      extend(updateParams, { image: newFileName });
      message = 'Profile image uploaded successfully!';
    } else if (type === 'coverImage') {
      extend(updateParams, { coverImage: newFileName });
      message = 'Cover changed successfully!';
    }

    await UpdateUserDetail({
      filterParams: { _id: userId },
      updateParams
    });
    
    const data = { type };

    if (fs.existsSync(newFilePath)) {
      const fileBuffer = fs.readFileSync(newFilePath);
      const base64Image = fileBuffer.toString('base64');
      const mimeType = `image/${path.extname(newFilePath).substring(1)}`;

      extend(data, { base64Image, mimeType });
    } 

    TryResponse({
      res,
      message,
      data
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    CatchResponse({
      res,
      err: error
    });
  }
});

router.get(ENDPOINTS.USER.MEDIA, async (req, res) => {
  try {
    const userId = req.params.userId;

    const { type } = req.query;
    console.log('type: get', type);
    const { userDetails: user } = await GetUser({ userId });
    
    const data = {
      base64Image: null,
      mimeType: null,
      type
    };

    if (isEmpty(user)) {
      const error = new Error();
      error.error = 'User not found!';
      error.statusCode = 500;
      throw error;
    }

    if (!isEmpty(user) && !isEmpty(user.image) && type === 'profileImage') {
      const profilePath = user.image;
      const absolutePath = path.join(__dirname, '../images', 'userProfiles', profilePath);

      if (fs.existsSync(absolutePath)) {
        const fileBuffer = fs.readFileSync(absolutePath);
        const base64Image = fileBuffer.toString('base64');
        const mimeType = `image/${path.extname(profilePath).substring(1)}`;

        extend(data, { base64Image, mimeType });
      } 
    } else if (!isEmpty(user) && !isEmpty(user.coverImage) && type === 'coverImage') { 
      const coverPath = user.coverImage;
      const absolutePath = path.join(__dirname, '../images', 'userCover', coverPath);

      if (fs.existsSync(absolutePath)) {
        const fileBuffer = fs.readFileSync(absolutePath);
        const base64Image = fileBuffer.toString('base64');
        const mimeType = `image/${path.extname(coverPath).substring(1)}`;

        extend(data, { base64Image, mimeType });
      } 
    }
    
    TryResponse({
      res,
      data
    });

  } catch (error) {
    CatchResponse({
      res,
      err: error
    });
  }
});

router.delete(ENDPOINTS.USER.DELETE_MEDIA, async (req, res) => {
  try {
    const userId = req.params.userId;

    const { type } = req.query;
    console.log("type", type);

    const { userDetails: user } = await GetUser({ userId });
    
    if (!user) {
      const error = new Error();
      error.error = 'User not found!';
      error.statusCode = 500;
      throw error;
    }
   
    const updateParams = {};
    let absolutePath = "";
    let message= "";
  
    if (type === 'profileImage') {
      absolutePath = path.join(__dirname, '../images', 'userProfiles', user.image);
      extend(updateParams, { image: null });
      message= 'Profile image remove successfully!';
    } else if (type === 'coverImage') {
      absolutePath = path.join(__dirname, '../images', 'userCover', user.coverImage);
      extend(updateParams, { coverImage: null });
      message= 'Cover image remove successfully!';
    } else {
      throw new Error(`Invalid type: ${type}`);
    }

    try {
      const deleteFile = await DeleteFile(absolutePath);
      console.log('deleteFile : ', deleteFile);

      const response = await UpdateUserDetail({
        filterParams: { _id: userId },
        updateParams
      });
    } catch (err) {
      console.error('File not accessible:', err);
      const error = new Error();
      error.error = 'File not accessible!';
      error.statusCode = 500;
      throw error;
    }
   
    TryResponse({
      res,
      message,
      data: {
        type
      }
    });
  } catch (error) {
    CatchResponse({
      res,
      err: error
    });
  }
});

module.exports = router;
