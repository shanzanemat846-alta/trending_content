const Prompt = require("../models/prompt.model");
const User = require("../models/User.model");
const UserSubscriptionPlan = require('../models/user-subscription-plan.model');
const validator = require("validator");
const jwt = require("jsonwebtoken");

const { JWT_TOKEN_EXPIRY_DATE, SUBSCRIPTION_PLANS } = require("../utils/constants");

module.exports.addPrompt = async (req, res, next) => {
  try {
     const tokenwithBear = req.headers.authorization;
     const token = tokenwithBear.replace('Bearer ', ''); 
     if (!token) {
      return res.status(400).json({ errors: "Invalid User" });
    }
    const {  title, content } = req.body;
    if (validator.isEmpty(content)) {
      return res.json({
        errors: "content is required.",
        status: false,
      });
    }
    const payload = jwt.verify(token, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    const user = await User.findById(payload.id);
    if (!user) {
      throw new Error("Invalid User");
    }
    const userid = user._id;
    const promptCheck = await Prompt.findOne({ title,userid });
    if (promptCheck)
      return res.json({ errors: "prompt already existed", status: false });
    console.log(res.json.errors )
    const prompt = await Prompt.create({
      userid,
      title,
      content,
    });
    return res.json({ status: true, prompt });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getPrompts = async (req, res, next) => {
  try {
    const token = req.headers.authorization; 
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token not provided" });
    }
    const tokenWithoutBearer = token.replace('Bearer ', ''); // Remove 'Bearer ' from the token
    const decodedToken = jwt.verify(tokenWithoutBearer, process.env.HASHING_SECRET_KEY, {
      expiresIn: JWT_TOKEN_EXPIRY_DATE
    });
    const userId = decodedToken.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let prompts;

    if (user.role === "admin") {
      prompts = await Prompt.find({ userid: userId }).sort({ date: -1 });
    } else {
      const userSubscription = await UserSubscriptionPlan.findOne({ userId });
      if (!userSubscription) return res.status(403).json({ error: "User does not have a userSubscription plan" });
      if (userSubscription.subscriptionPlan === SUBSCRIPTION_PLANS.FREE) {
        prompts = await Prompt.find({ userid: userId }).sort({ date: -1 });
      } else {
        const adminIds = await User.find({ role: "admin" }).distinct("_id");
        prompts = await Prompt.find({ userid: { $in: [userId, ...adminIds] } }).sort({ date: -1 });
      }
    }
    res.json(prompts);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = await Prompt.findById(id);
    return res.json(prompt);
  } catch (e) {
    throw e;
  }
};

module.exports.prompt_update = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    // console.log("id", id);
    const prompt = await Prompt.findByIdAndUpdate(id, req.body);
    // console.log("updateProject", project);
    return res.json({ prompt });
  } catch (e) {
    throw e;
  }
};

module.exports.prompt_delete = (req, res) => {
  Prompt.findById(req.params.id, function (err, prompt) {
    if (!prompt) {
      res.status(404).send("Prompt not found");
    } else {
      Prompt.findByIdAndRemove(req.params.id)
        .then(function () {
          res.status(200).json("prompt deleted");
        })
        .catch(function (err) {
          res.status(400).send("prompt delete failed.");
        });
    }
  });
};
