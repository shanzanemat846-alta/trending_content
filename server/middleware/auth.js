const jwt = require('jsonwebtoken');

const {
  HASHING_SECRET_KEY
} = process.env;

const GenerateTokenForPasswordResetLink = ({
  userId,
  email,
  name
},
verify = false) => {
  const expiryTime = '1d';
  return {
    token: jwt.sign({ userId, email, name }, HASHING_SECRET_KEY, {
      expiresIn: expiryTime
    }),
    userId
  };
};

const GenerateTokenForInviteUser = ({
  userId,
  email,
  name
},
verify = false) => {
  const expiryTime = '1d';
  return {
    token: jwt.sign({ userId, email, name }, HASHING_SECRET_KEY, {
      expiresIn: expiryTime
    })
  };
};

module.exports = {
  GenerateTokenForPasswordResetLink,
  GenerateTokenForInviteUser
};
