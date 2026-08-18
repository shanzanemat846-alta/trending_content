const {
  login,
  googleLogin,
  register,
  getAllUsers,
  acceptUser,
  getUser,
  forgetPassword,
  user_delete,
  reset,
  verifyUser
} = require("../controllers/userController");
const {
  ForgotPassword,
  ResetPassword
} = require('../controllers/auth');

const { GetUser } = require('../models/user-services');

const AuthenticateToken = require('../middleware/auth-token');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');
const router = require("express").Router();

router.get('/user', AuthenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await GetUser({ filterParams: { _id: userId } });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 403;
      throw err;
    }

    TryResponse({
      res,
      message: 'User details',
      data: { user }
    });
  } catch (error) {
    CatchResponse({
      res,
      err: error
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      const err = new Error('Email is required!');
      err.statusCode = 403;
      throw err; 
    }

    const response = await ForgotPassword({ email });
    const {
      message
    } = response;

    await TryResponse({
      res,
      message
    });
  } catch (err) {
    await CatchResponse({
      res,
      err
    });
  }
});

router.patch('/reset-password', async (req, res) => {
  try {
    const {
      password,
      token
    } = req.body;

    if (!token) {
      const err = new Error('Token is required!');
      err.statusCode = 403;
      throw err; 
    }
    if (!password) {
      const err = new Error('Password is required!');
      err.statusCode = 403;
      throw err; 
    }

    const response = await ResetPassword({
      token,
      password
    });

    const {
      message
    } = response;

    TryResponse({
      res,
      message
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/register", register);
router.get("/allusers", getAllUsers);
router.patch("/changeState/:id", acceptUser);
router.get("/verify", verifyUser);
router.get("/:token", getUser);
// router.post("/foregetpassword", forgetPassword);
router.post("/reset", reset);
router.delete("/:id", user_delete);

module.exports = router;
