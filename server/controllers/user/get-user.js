const { GetUser: GetUserDetail } = require('../../models/user-services');

const GetUser = async ({
  userId
}) => {
  const userDetails = await GetUserDetail({ filterParams: { _id: userId } });

  return {
    userDetails
  }
};

module.exports = GetUser;
