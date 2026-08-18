const bcrypt = require("bcrypt");

const { isEmpty, extend } = require('lodash');

const { UpdateUser: UpdateUserDetail, GetUser } = require('../../models/user-services');

const UpdateUser = async ({
  userId,
  updateParams: data
}) => {
  const updateParams = {};

  console.log('userId: ', userId)
  const userDetails = await GetUser({
    filterParams: { _id: userId },
    selectParams: { password: 1 }
  });

  const {
    firstName,
    lastName,
    currentPassword,
    newPassword,
    globalOpenAIKey,
    accessToken,
    refreshToken,
    expires,
    image,
    guideUserAboutAppOverView,
    openAI
  } = data;

  console.log('\n\n data: ', data);

  if (!isEmpty(firstName)) {
    extend(updateParams, { firstName })
  }
  if (!isEmpty(lastName)) {
    extend(updateParams, { lastName })
  }
  if (!isEmpty(newPassword)) {
    if (!userDetails.loginWithGoogle && !isEmpty(userDetails.password)) {
      const isPasswordValid = await bcrypt.compare(currentPassword, userDetails.password);
      if (!isPasswordValid) {
        const error = new Error();
        error.statusCode = 400;
        error.error = 'Current password mismatched!';
  
        throw error;
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    extend(updateParams, { password: hashedPassword });
  }

  if (!isEmpty(openAI) && !isEmpty(openAI.model) && !isEmpty(openAI.apiKey)) {

    
    console.log('here the update: ', openAI)

    extend(updateParams, { openAI });
  }

  if (!isEmpty(globalOpenAIKey)) {
    const last4Digit = globalOpenAIKey.slice(-4);

    extend(updateParams, { globalOpenAI: { key: globalOpenAIKey, last4Digit} });
  } else {
    console.log('here the update empty key: ')
    extend(updateParams, { globalOpenAI: { key: '', last4Digit: '' } });
  }

  // extend(updateParams, { basicOpenAIKey });

  // extend(updateParams, { advancedOpenAIKey });

  if (!isEmpty(accessToken)) {
    extend(updateParams, { accessToken })
  }

  if (!isEmpty(refreshToken)) {
    extend(updateParams, { refreshToken })
  }

  if (!isEmpty(expires)) {
    extend(updateParams, { expires })
  }

  if (!isEmpty(image)) {
    extend(updateParams, { image })
  }

  if (guideUserAboutAppOverView === false) {
    extend(updateParams, { guideUserAboutAppOverView: false })
  }

  await UpdateUserDetail({
    filterParams: { _id: userId },
    updateParams,
  });

  const updatedUser = await GetUser({
    filterParams: { _id: userId }
  });

  return {
    message: 'User details updated successfully!',
    userDetails: updatedUser
  }
};

module.exports = UpdateUser;
