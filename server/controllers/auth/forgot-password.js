const { trim } = require('lodash');

const { GetUser, UpdateUser } = require('../../models/user-services');

const { GenerateTokenForPasswordResetLink } = require('../../middleware/auth');

const { ResetPasswordTemplate } = require('../../utils/email-template');
const SendEmail = require('../../utils/send-email');

const { USER_STATUS } = require('../../utils/constants');

const ForgotPassword = async ({ email }) => {
  email = trim(email);

  const userExists = await GetUser({
    filterParams: {
      email,
      status: USER_STATUS.ACCEPTED
    }
  });

  if (userExists) {
    const {
      _id: userId,
      firstName,
      lastName
    } = userExists;

    const name =  `${firstName} ${' '} ${lastName}`;
    const { token } = GenerateTokenForPasswordResetLink({
      userId,
      email,
      name
    });

    await SendEmail(email, 'Password Reset Link!', ResetPasswordTemplate(token, name));

    await UpdateUser({
      filterParams: { email },
      updateParams: { resetPasswordToken: token }
    });
    return {
      message: 'Password Reset link has been sent to your mail.'
    };
  }

  const err = new Error();
  err.error = 'User does not exist with this email address!';
  err.statusCode = 400;
  throw err;
};

module.exports =  ForgotPassword;
