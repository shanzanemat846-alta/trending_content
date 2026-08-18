const express = require('express');

const { SaveOpenAIModel, GetOpenAIModelsDetails, DeleteOpenAIModel, UpdateOpenAIModelDetails } = require('../controllers/openAIModel');

const { CatchResponse, TryResponse } = require('../utils/helpers');

const { ENDPOINTS } = require('../utils/constants');

const AuthenticateToken = require('../middleware/auth-token');

const router = express.Router();

router.post(ENDPOINTS.MODELS.SAVE_OPEN_AI_MODEL, AuthenticateToken, async (req, res) => {
  try {

    const { modelName, apiKey } = req.body;
    const modelDetails = await SaveOpenAIModel({
      modelName,
      apiKey
    });

    TryResponse({
      res,
      message: 'Model added successfully',
      data: {
         modelDetails
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

router.get(ENDPOINTS.MODELS.OPEN_AI_MODELS, AuthenticateToken, async (req, res) => {
  try {

    const { openAIModelsList } = await GetOpenAIModelsDetails();

    TryResponse({
      res,
      message: 'Model fetched successfully',
      data: { openAIModelsList }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

router.delete(ENDPOINTS.MODELS.DELETE_OPEN_AI_MODEL, AuthenticateToken, async (req, res) => {
  try {

    const { _id } = req.body;
    const deleteResponse = await DeleteOpenAIModel({
      _id
    });

    TryResponse({
      res,
      message: 'Model deleted successfully',
      data: {
         response: deleteResponse
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

router.put(ENDPOINTS.MODELS.UPDATE_OPEN_AI_MODEL, AuthenticateToken, async (req, res) => {
  console.log("🚀 ~ req:", req)
  try {
    
    const { _id, updateParams } = req.body;
    const updateResponse = await UpdateOpenAIModelDetails({
      _id,
      updateParams
    });

    TryResponse({
      res,
      message: 'Model updated successfully',
      data: {
         response: updateResponse
      }
    });
  } catch (err) {
    CatchResponse({ res, err });
  }
});

module.exports = router;
