const express = require('express');

const { GetUser } = require('../models/user-services');

const { GetUsers } = require('../controllers/user');
const { DeleteUsers, UpdateUserByAdmin, GetUserCreditHistory, GetTopDemographicsHistory, UpdateUserSubscriptionByAdmin, GetCreditsHistory } = require('../controllers/admin');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');

const AuthenticateToken = require('../middleware/auth-token');
const { CheckUserRole } = require('../middleware/check-user-role');

const router = express.Router();

router.get(ENDPOINTS.ADMIN.USERS, AuthenticateToken, async (req, res) => {
  try {
    const {
      query: {
        skip,
        limit,
        sortBy
      }
    } = req;

    let { query: { filters } } = req;

    if (filters) {
      filters = JSON.parse(filters);
    }

    const { totalUsers = 0, users = [] } = await GetUsers({
      skip,
      limit,
      filters,
      sortBy
    });

    TryResponse({
      res,
      message: "Users data",
      data: {
        totalUsers, users
      }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.patch(ENDPOINTS.ADMIN.USER, AuthenticateToken, async (req, res) => {
  try {
    const { 
      params: { userId },
      body: { updateParams }
     } = req;

    const { updatedUserDetails, message } = await UpdateUserByAdmin({
      userId,
      updateParams
    });

    TryResponse({
      res,
      message,
      data: {
        updatedUserDetails
      }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.patch(ENDPOINTS.ADMIN.UPDATE_USER_SUBSCRIPTION, AuthenticateToken, async (req, res) => {
  try {
    const { 
      params: { userId },
      body: { updateParams }
     } = req;

    const addedBy = req.userId;

    console.log({
      userId,
      updateParams
    });

    const { updatedUserDetails, message } = await UpdateUserSubscriptionByAdmin({
      userId,
      updateParams,
      addedBy
    });

    TryResponse({
      res,
      message,
      data: {
        updatedUserDetails
      }
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.delete(ENDPOINTS.ADMIN.USERS, AuthenticateToken, async (req, res) => {
  try {
    const { usersIdList } = req.body;

    console.log('here the user list: ', usersIdList);
    const { message } = await DeleteUsers({
      usersIdList
    });

    TryResponse({
      res,
      message
    });
  } catch (err) {
    CatchResponse({
      res,
      err
    });
  }
});

router.get(ENDPOINTS.CREDIT_HISTORY.GET_CREDIT_HISTORY, AuthenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return TryResponse({
        res,
        message: 'userId is required',
        status: 400
      });
    }

    const creditHistory = await GetUserCreditHistory({ userId, startDate, endDate });

    TryResponse({
      res,
      message: 'Credit history breakdown fetched successfully',
      data: {
        chartData: creditHistory
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

router.get(ENDPOINTS.CREDIT_HISTORY.GET_TOP_DEMOGRAPHICS, AuthenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const list = await GetTopDemographicsHistory({ startDate, endDate });

    TryResponse({
      res,
      message: 'Top demographics fetched successfully',
      data: {
       demographicsList: list
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

router.get(ENDPOINTS.CREDIT_HISTORY.GET_CREDITS_HISTORY, AuthenticateToken, async (req, res) => {
  try {
    let { filters } = req.query;

    filters = JSON.parse(filters);
    console.log('filters: ', filters);

    const { creditsHistory } = await GetCreditsHistory({ filters });

    TryResponse({
      res,
      data: {
       creditsHistory: creditsHistory
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});


router.get(ENDPOINTS.ADMIN.GET_ADMIN_DEFAULT_MODEL, AuthenticateToken, async (req, res) => {
  try {

    const adminData = await GetUser({
      filterParams: { role: "admin" },
      selectParams: { openAI: 1, }
    });

    const defaultModel = adminData.openAI.model;
    TryResponse({
      res,
      message: 'Top demographics fetched successfully',
      data: {
       adminDefaultKey: defaultModel
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

module.exports = router;
