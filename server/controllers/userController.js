const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const { AddUserSubscriptionPlan } = require("../models/user-subscription-plan-services");

const SendEmail = require("../utils/send-email");
const {
  AddNewUser,
  DeleteUser,
  GetUser,
  GetUsers,
  UpdateUser
} = require("../models/user-services");

const { JWT_TOKEN_EXPIRY_DATE } = require("../utils/constants");

const { CredentialsSyncedTemplated } = require('../utils/email-template');

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (validator.isEmpty(email)) {
      return res.json({
        errors: "Email is required.",
        status: false
      });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        errors: "Email is invalid.",
        status: false
      });
    }
    if (validator.isEmpty(password)) {
      return res.json({
        errors: "Password is required.",
        status: false
      });
    }
  
    const user = await GetUser({
      filterParams : { email }
    });

    if (!user)
      return res.json({ errors: "Incorrect Email", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ errors: "Incorrect Password", status: false });

    if (user.status === "pending") {
      try {
        jwt.verify(user.verificationToken, process.env.HASHING_SECRET_KEY);

        return res.json({
          message: "Verify your email. Check your inbox.",
          status: false
        });
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          const newVerificationToken = jwt.sign({ email }, process.env.HASHING_SECRET_KEY, { expiresIn: '48h' });

          await UpdateUser({
            filterParams: { email },
            updateParams: { verificationToken: newVerificationToken }
          });

          await SendEmail(
            email,
            'Resend: Verify your email',
            CredentialsSyncedTemplated({
              userName: `${user.firstName} ${user.lastName}`,
              token: newVerificationToken
            })
          );

          return res.json({
            message: "Your previous verification link has expired. A new link has been sent to your inbox to activate your account",
            status: false
          });
        }

        return res.json({ errors: "Invalid token", status: false });
      }
    }

    const payload = { id: user._id };
    const newUser = {...user._doc, id: user._doc._id}
    const token = jwt.sign(payload, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    return res.json({ accessToken: token, user: newUser, status: true });
  } catch (ex) {
    next(ex);
  }
};

module.exports.googleLogin = async (req, res, next) => {
  try {
    console.log('\n\n req.body: ', req.body);
    const { userId, user, accessToken, refreshToken, expires } = req.body;

    // const { email, firstName, lastName, image } = user;

    // if (validator.isEmpty(email)) {
    //   return res.json({
    //     errors: "Email is required.",
    //     status: false
    //   });
    // }
    // if (!validator.isEmail(email)) {
    //   return res.json({
    //     errors: "Email is invalid.",
    //     status: false
    //   });
    // }

    let userDetails = await GetUser({
      filterParams: { _id: userId }
    });

    console.log('user details : ', userDetails);

    if (userDetails) {
      const payload = { id: userDetails._id };
      const newUser = { ...userDetails._doc, id: userDetails._doc._id }
      const token = jwt.sign(payload, process.env.HASHING_SECRET_KEY, {
        expiresIn: JWT_TOKEN_EXPIRY_DATE
      });

      return res.json({ accessToken: token, user: newUser, status: true });
    } else {
      const error = new Error()
      error.status = 500;
      error.message = "user not found!"
    }
    // if (!userDetails) {
    //   userDetails = await AddNewUser({
    //     firstName,
    //     lastName,
    //     email,
    //     isVerified: true,
    //     status: 'accepted',
    //     accessToken,
    //     refreshToken,
    //     expires,
    //     // image,
    //     loginWithGoogle: true
    //   });
    // } else {
    //   const updateUserRes = await UpdateUser({
    //     filterParams: { _id: userDetails._id },
    //     updateParams: {
    //       firstName,
    //       lastName,
    //       // image,
    //       accessToken,
    //       expires
    //     }
    //   });
    // }

    // const payload = { id: userDetails._id };
    // const newUser = { ...userDetails._doc, id: userDetails._doc._id }
    // const token = jwt.sign(payload, process.env.HASHING_SECRET_KEY, {
    //   expiresIn: '1d'
    // });
    // return res.json({ accessToken: token, user: newUser, status: true });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (validator.isEmpty(firstName) || validator.isEmpty(lastName) || validator.isEmpty(email) || validator.isEmpty(password)) {
      return res.json({ errors: "All fields are required", status: false });
    }

    if (!validator.isEmail(email)) {
      return res.json({ errors: "Invalid email", status: false });
    }

    const emailCheck = await GetUser({
      filterParams: { email }
    });


    if (emailCheck) {
      if (!emailCheck.isVerified) {
        try {
          jwt.verify(emailCheck.verificationToken, process.env.HASHING_SECRET_KEY);

          await SendEmail(
            email,
            'Resend: Verify your email',
            CredentialsSyncedTemplated({
              userName: `${emailCheck.firstName} ${emailCheck.lastName}`,
              token: emailCheck.verificationToken
            })
          );

          return res.json({
            message: "Account already exists but not activated. Verification email has been resent. Please check your inbox.",
            status: false
          });
        } catch (err) {
          console.log('error: ', err);
          if (err.name === 'TokenExpiredError') {
            const newVerificationToken = jwt.sign({ email }, process.env.HASHING_SECRET_KEY, { expiresIn: '48h' });

            await UpdateUser({
              filterParams: { email },
              updateParams: { verificationToken: newVerificationToken }
            });
  

            await SendEmail(
              email,
              'Resend: Verify your email',
              CredentialsSyncedTemplated({
                userName: `${emailCheck.firstName} ${emailCheck.lastName}`,
                token: newVerificationToken
              })
            );

            return res.json({
              message: "Your previous verification link has expired. A new link has been sent to your inbox.",
              status: false
            });
          }

          return res.json({ errors: "Invalid token", status: false });
        }
      }

      return res.json({ errors: "Email is already in use", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.HASHING_SECRET_KEY, { expiresIn: '48h' });

    const user = await AddNewUser({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    });

    await SendEmail(
      email,
      'Verify your email',
      CredentialsSyncedTemplated({
        userName: `${user.firstName} ${user.lastName}`,
        token: verificationToken
      })
    );

    return res.json({ message: "Account created. Please check your email to verify.", status: true });

  } catch (ex) {
    next(ex);
  }
};

module.exports.reset = async (req, res, next) => {
  try {
    const errors = "";
    const { password, token } = req.body;
    console.log("token", token);

    if (validator.isEmpty(password)) {
      return res.json({
        errors: "Password is required.",
        status: false
      });
    }

    const user = await GetUser({
      filterParams: { password: token }
    });

    if (!user) {
      return res.json({ errors: "User doesn't exist", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UpdateUser({
      filterParams: { password: token },
      updateParams: { password: hashedPassword }
    });
    
    return res.json({ status: true });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await GetUsers();
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const param = req.params;
    const payload = jwt.verify(param.token,process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    console.log(payload);
    const user = await GetUser({
      filterParams: { _id: payload.id }
    });

    if (!user) throw "User Not Found";
    return res.json(user);
  } catch (e) {
    return res.status(400).send(e.message);
  }
};

// module.exports.acceptUser = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     console.log(req.body);
//     const usernameCheck = await User.findById(id);
//     if (!usernameCheck) {
//       return res.status(404).send("User not found");
//     }
//     if (usernameCheck.state === 0) {
//       await User.updateOne({ _id: id }, { $set: { state: 1 } });
//       res.send("User accepted");
//     } else {
//       await User.updateOne({ _id: id }, { $set: { state: 0 } });
//       res.send("User rejected");
//     }
//   } catch (ex) {
//     next(ex);
//   }
// };

module.exports.acceptUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(req.body);
    
    const user = await GetUser({
      filterParams: { _id: id}
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    let updateFields = {
      status: req.body.status ,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      role: req.body.role
    };

    await UpdateUser({
      filterParams: { _id: id },
      updateParams: updateFields
    });

    res.send(`User ${user.status === "active" ? 'accepted' : 'rejected'}`);
  } catch (ex) {
    next(ex);
  }
};

module.exports.user_delete = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await GetUser({
      filterParams: { _id: userId }
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    await DeleteUser({
      filterParams: { _id: userId }
    });

    return res.status(200).json("User deleted");
  } catch (err) {
    return res.status(400).send("User delete failed.");
  }
};


module.exports.verifyUser = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ errors: "Token is required", status: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.HASHING_SECRET_KEY);
      const user = await GetUser({
        filterParams: { email: decoded.email }
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found", status: false });
      }

      if (user.isVerified) {
        return res.status(200).json({ message: "Email already verified", status: true });
      }

      await AddUserSubscriptionPlan({
        userId: user._id
      });
      await UpdateUser({
        filterParams: { email: decoded.email },
        updateParams: {
          isVerified: true,
          verificationToken: null,
          status: 'accepted'
        }
      });

      return res.status(200).json({ message: "Email successfully verified", status: true });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).json({
          errors: "Verification link has expired. Try registration again",
          status: false,
        });
      }

      return res.status(400).json({ errors: "Invalid token", status: false });
    }
  } catch (ex) {
    next(ex);
  }
};
