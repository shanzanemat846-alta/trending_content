const { CreditHistoryAggregate } = require("../../models/credit-history-services"); // import your CreditHistory model

const GetCreditsHistory = async ({ filters }) => {
  console.log("filterParams in the controller: ", filters);

  let {
    startDate,
    endDate,
    type,
    searchByKeyWords = { keys: [], value: "" },
  } = filters;

  const matchStage = { type: "MANUAL_CREDITS" };

  if (type) matchStage.type = type;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    matchStage.timestamp = { $gte: start, $lte: end };
  }

  // Base pipeline
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedByUser",
      },
    },
    {
      $unwind: {
        path: "$addedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (searchByKeyWords.keys.length && searchByKeyWords.value) {
    const regex = new RegExp(searchByKeyWords.value, "i");
    pipeline.push({
      $match: {
        $or: searchByKeyWords.keys.map((k) => ({
          [`user.${k}`]: regex,
        })),
      },
    });
  }

  pipeline.push({
    $project: {
      type: 1,
      timestamp: 1,
      prevCredits: 1,
      additionalCredits: 1,
      "user.firstName": 1,
      "user.lastName": 1,
      "user.email": 1,
      "user.role": 1,
      "addedByUser.firstName": 1,
      "addedByUser.lastName": 1,
      "addedByUser.email": 1,
      "addedByUser.role": 1,
    },
  });

  const creditsHistory = await CreditHistoryAggregate({ pipeline });

  return { creditsHistory };
};

module.exports = GetCreditsHistory;
