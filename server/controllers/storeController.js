const path = require('path');
const { GetProject } = require('../models/project-services');

const Store = require("../models/store.model");

const { 
  CalculateCreditDeduction,
  ClearDirectory,
  DeductCreditsAndLogHistory,
  ExtractImageFileName,
  ExtractImageUrls,
} = require('../utils/helpers');

const { COSTING_TYPES } = require('../utils/constants');

module.exports.addStore = async (req, res, next) => {
  try {
    const { userId, projectid, title, content, image } = req.body;
    const projectDetails = await GetProject({ filterParams: { _id: projectid} });

    const storeCheck = await Store.findOne({ projectid, title });
    if (storeCheck)
      return res.json({ errors: "Content already existed", status: false });

    const { deductionAmount } = await CalculateCreditDeduction({ 
      type: COSTING_TYPES.SAVE_CONTENT,
      userId: projectDetails.userid
    });

    const store = await Store.create({
     userId,
     projectid,
     title,
     content,
     image,
    });

    await DeductCreditsAndLogHistory({
      type: COSTING_TYPES.SAVE_CONTENT,
      userId: projectDetails.userid,
      storeId: store._id,
      deductionAmount
    });
    return res.json({ status: true, store, message: `${deductionAmount} credit used.` });
  } catch (ex) {
    next(ex);
  }
};


module.exports.getStores = async (req, res, next) => {
  try {
    const { projectid } = req.query; // Assuming projectid is passed as a query parameter
    console.log("projectid", projectid);
    // Check if projectid is provided
    if (!projectid) {
      return res.status(400).json({ errors: "Project ID is required" });
    }

    // Find stores for the specified projectid
    const stores = await Store.find({ projectid }).sort({ date: -1 });
    // console.log("stores", stores);

    return res.json(stores);
  } catch (ex) {
    next(ex);
  }
};

module.exports.store_update = async (req, res) => {
  try {
    const { id } = req.params;
    const {  title } = req.body;
    console.log('\n\n', req.body);

    if (title === " ") {
      return res.json({ errors: "Title required", status: false });
    }

    const imgUrls = ExtractImageUrls({ htmlString: req.body.content });
    const imagesFile = ExtractImageFileName({ imagesList: imgUrls });

    const store = await Store.findByIdAndUpdate(id, req.body);

    if (imagesFile.length) {
      const dir = path.join(__dirname, '../images/content-images', id); 
      ClearDirectory({ dir , keepFiles: imagesFile });
    }

    return res.json({ store });
  } catch (e) {
    throw e;
  }
};

module.exports.getStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);
    return res.json(store);
  } catch (e) {
    throw e;
  }
};

module.exports.store_delete = (req, res) => {
  Store.findById(req.params.id, function (err, store) {
    if (!store) {
      res.status(404).send("store not found");
    } else {
      Store.findByIdAndRemove(req.params.id)
        .then(function () {
          res.status(200).json("store deleted");
        })
        .catch(function (err) {
          res.status(400).send("store delete failed.");
        });
    }
  });
};

