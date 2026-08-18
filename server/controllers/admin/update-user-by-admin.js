const { isEmpty, extend } = require('lodash');

const { UpdateUser } = require('../../models/user-services');

const UpdateUserByAdmin = async ({
  userId,
  updateParams: data
}) => {
  const updateParams = {};

  const { status } = data;

  if (!isEmpty(status)) {
    extend(updateParams, { status  })
  }

  await UpdateUser({
    filterParams: { _id: userId },
    updateParams
  });

  return {
    message: 'User details updated successfully!',
    updatedUserDetails: { userId, updateParams }
  }
};

module.exports = UpdateUserByAdmin;
