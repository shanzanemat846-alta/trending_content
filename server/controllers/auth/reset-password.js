const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isEmpty } = require("lodash");

const { UpdateUser, GetUser } = require('../../models/user-services');

const ResetPassword = async ({ token, password }) => {
  try {
    const decoded = jwt.verify(token, process.env.HASHING_SECRET_KEY);

    if (!decoded) {
      const err = new Error();
      err.error = 'Invalid token!';
      err.statusCode = 400;
      throw err;
    }
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      const err = new Error();
      err.error = 'Token has expired';
      err.statusCode = 401;
      throw err;
    }
    if (!decoded.userId) {
      const err = new Error();
      err.error = 'Invalid token payload!';
      err.statusCode = 400;
      throw err;
    }
    if (isEmpty(password)) {
      const err = new Error();
      err.error = 'Password is required!';
      err.statusCode = 400;
      throw err;
    }
    const user = await GetUser({ filterParams: { _id: decoded.userId } });

    if (!user) {
      const err = new Error();
      err.error = 'User does not exist';
      err.statusCode = 400;
      throw err;
    }

    const { resetPasswordToken } = user;
    if (isEmpty(resetPasswordToken)) {
      const err = new Error();
      err.error = 'The link has been expired!';
      err.statusCode = 400;
      throw err;
    }
    if (resetPasswordToken && token.trim() !== resetPasswordToken.trim()) {
      const err = new Error();
      err.error = 'Token is invalid!';
      err.statusCode = 400;
      throw err;
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 10);
    await UpdateUser({
      filterParams: { _id: decoded.userId },
      updateParams: { password: hashedPassword },
      unsetParams: { resetPasswordToken: 1 }
    });

    return { message: 'Password Updated Successfully!' };

  } catch (error) {
    console.error('Reset Password Error:', error);

    // Handle JWT errors explicitly
    if (error instanceof jwt.JsonWebTokenError) {
      const err = new Error();
      err.error = 'Invalid or tampered token!';
      err.statusCode = 400;
      throw err;
    } else if (error instanceof jwt.TokenExpiredError) {
      const err = new Error();
      err.error = 'Token has expired!';
      err.statusCode = 401;
      throw err;
    }

    const err = new Error();
    err.error = error.error || 'Internal server error';
    err.statusCode = error.statusCode || 500;
    throw err;
  }
};

module.exports =  ResetPassword;
