const { isEmpty, extend } = require('lodash');
const User = require('../models/User.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const AddNewUser = async ({
  firstName,
  lastName,
  email,
  password,
  isVerified,
  verificationToken,
  status,
  accessToken,
  refreshToken,
  expires,
  image,
  loginWithGoogle 
}) => {

  const user = {
    firstName,
    lastName,
    email,
    password,
    isVerified
  }

  if (!isEmpty(status)) extend(user, { status });
  if (!isEmpty(accessToken)) extend(user, { accessToken });
  if (!isEmpty(refreshToken)) extend(user, { refreshToken });
  if (!isEmpty(expires)) extend(user, { expires });
  if (!isEmpty(image)) extend(user, { image });
  if (!isEmpty(verificationToken)) extend(user, { verificationToken });
  if (loginWithGoogle === true) extend(user, { loginWithGoogle });

  const newUser = new User({
    ...user
  });

  await newUser.save();

  return newUser;
}


const GetUser = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await User
    .findOne(filterParams)
    .select(selectParams);

  return response;
};

const DeleteUser = async ({
  filterParams = {}
}) => {
  await User.deleteOne({
    ...filterParams
  });
};

const GetUsers = async ({
  filterParams = {},
  selectParams = {},
  skip,
  limit,
  sortParams
}) => {

  const users = await User
    .find(filterParams)
    .skip(Number(skip))
    .limit(Number(limit))
    .sort(sortParams)
    .select(selectParams)
    .lean();

  return users;
};

const UpdateUser = async ({
  filterParams,
  updateParams,
  unsetParams = {}
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await User.updateOne({
    ...filterParams
  }, {
    $set: {
      ...updateParams
    },
    $unset: {
      ...unsetParams
    }
  });  

  return response;
}

const CountOfUsers = async ({ filterParams }) => {
  ThrowMissingParamsError([filterParams]);

  return await User.find(filterParams).countDocuments();
};

const DeleteUsers = async ({
  filterParams = {}
}) => {
  await User.deleteMany(filterParams);
};

const BulkWriteUser = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await User.bulkWrite(bulkWriteData);

  return response;
};

module.exports = {
  AddNewUser,
  BulkWriteUser,
  CountOfUsers,
  DeleteUser,
  DeleteUsers,
  GetUser,
  GetUsers,
  UpdateUser,
};
