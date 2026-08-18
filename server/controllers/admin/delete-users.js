const { DeleteUsers } = require('../../models/user-services');

const DeleteUserByAdmin = async ({
  usersIdList,
}) => {
  await DeleteUsers({
      filterParams: { _id: { $in: usersIdList } }
  });

  return {
    message: 'User deleted successfully!',
  }
};

module.exports = DeleteUserByAdmin;
