const jwt = require("jsonwebtoken");

const { JWT_TOKEN_EXPIRY_DATE } = require("../utils/constants");

const AuthenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });

    req.userId = decoded.id;

    next();
  } catch (error) {
    const err = new Error();
    err.statusCode = 403;
    err.error = 'Forbidden';

    throw err;
  }
};

module.exports = AuthenticateToken;
