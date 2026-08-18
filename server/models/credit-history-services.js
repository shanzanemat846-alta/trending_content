const mongoose = require('mongoose');
const { isEmpty, extend } = require("lodash");

const { CREDIT_TYPE_LABELS } = require('../utils/constants');

const CreditHistory = require('../models/credit-history.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const SaveCreditHistory = async ({
  userId,
  type,
  campaignId,
  storeId,
  projectId,
  deductionAmount,
  title,
  platformErrors,
  gptConsumedTokens,
  chatId,
  campaignReSynced,
  actualTokenConsumed,
  additionalCredits,
  prevCredits,
  addedBy
}) => {
  const saveParams = {
    userId,
    type,
    deductionAmount,
  };

  if (campaignId) {
    extend(saveParams, { campaignId });
  }
  if (storeId) {
    extend(saveParams, { storeId });
  }
  if (projectId) {
    extend(saveParams, { projectId });
  }
  if (chatId) {
    extend(saveParams, { chatId, contentModification: true });
  }
  if (!isEmpty(title)) {
    extend(saveParams, { title });
  }
  if (!isEmpty(platformErrors)) {
    extend(saveParams, { platformErrors });
  }
  if (gptConsumedTokens !== null || gptConsumedTokens !== undefined) {
    extend(saveParams, { gptConsumedTokens });
  }
  if (campaignReSynced) {
    extend(saveParams, { campaignReSynced });
  }
  if (actualTokenConsumed !== null || actualTokenConsumed !== undefined) {
    extend(saveParams, { actualTokenConsumed });
  }
  if (additionalCredits && additionalCredits > 0) {
    extend(saveParams, { additionalCredits, prevCredits });
  }
  if (!isEmpty(addedBy)) {
    extend(saveParams, { addedBy });
  }

  const newCreditHistory = new CreditHistory(saveParams);
  await newCreditHistory.save();

  return newCreditHistory;
}

const GetCreditHistoryByAggregate = async ({ userId, startDate, endDate }) => {

  const start = new Date(startDate); 
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const result = await CreditHistory.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: start,
          $lte: end
        }
      }
    },
    {
      $group: {
        _id: "$type",
        totalDeductionAmount: { $sum: "$deductionAmount" }
      }
    },
    {
      $sort: { totalDeductionAmount: -1 }
    },
    {
      $project: {
        type: "$_id",
        totalDeductionAmount: 1,
        _id: 0
      }
    }
  ]);

  if (!result || result.length === 0) {
    return {
      labels: [],
      series: []
    };
  }

  const chartData = {
    labels: [],
    series: []
  };

  for (const record of result) {
    chartData.labels.push(CREDIT_TYPE_LABELS[record.type] || record.type);
    chartData.series.push(parseFloat(record.totalDeductionAmount.toFixed(2)));
  }

  return chartData;
};

const GetTopDemographics = async ({ startDate, endDate }) => {
  
  const start = new Date(startDate); 
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const users = await CreditHistory.aggregate([
    {
      $match: {
        timestamp: {
          $gte: start,
          $lte: end
        }
      }
    },
    {
      $group: {
        _id: "$userId",
        totalDeductionAmount: { $sum: "$deductionAmount" },
        records: { $push: { type: "$type", amount: "$deductionAmount" } }
      }
    },
    {
      $sort: { totalDeductionAmount: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true
      }
    }
  ]);

  const updateList = users.map((user) => {
    const counts = {
      GPT: 0,
      MULTI_PLATFORM_CAMPAIGN: 0,
      YOUTUBE_CAMPAIGN: 0,
      REDDIT_CAMPAIGN: 0,
      SAVE_CONTENT: 0
    };

    for (const record of user.records || []) {
      const type = record.type;
      if (counts.hasOwnProperty(type)) {
        counts[type] += record.amount;
      }
    }

    return {
      firstName: user.user?.firstName || "",
      lastName: user.user?.lastName || "",
      email: user.user?.email || "",
      totalDeductionAmount: user.totalDeductionAmount,
      ...counts
    };
  });

  return updateList;
};

const CreditHistoryAggregate = async ({ pipeline }) => {
  const response = await CreditHistory.aggregate(pipeline);

  return response;
};

const GetCreditHistory = async ({
  filterParams,
  selectParams = {},
  sortBy = { createdAt: -1 },
  limit,
  populate,
  selectPopulatedParams
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await CreditHistory
    .find(filterParams)
    .select(selectParams)
    .sort(sortBy)
    .limit(limit)
    .populate(populate, selectPopulatedParams);

  return response;
};

module.exports = {
  CreditHistoryAggregate,
  SaveCreditHistory,
  GetCreditHistoryByAggregate,
  GetTopDemographics,
  GetCreditHistory
};
