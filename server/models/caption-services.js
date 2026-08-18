const { isEmpty } = require('lodash');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const Captions = require('./caption');

const GetCaption = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Captions.findOne(filterParams).select(selectParams);

  return response;
};

const GetCaptions = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Captions.find(filterParams).select(selectParams);

  return response;
};

const InsertCaptions = async ({ insertParams  }) => {
  const { url , platform } = insertParams;

  if (isEmpty(url) || isEmpty(platform)) {
    const error = new Error();
    error.statusCode = 400;
    error.error = 'Url  and Platform is required!';

    throw error;
  }

  const caption = new Captions({ ...insertParams });

  const response = await caption.save();

  return response;
};

const BulkWriteCaptions = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await Captions.bulkWrite(bulkWriteData);

  return response;
};


module.exports = {
  BulkWriteCaptions,
  GetCaptions,
  GetCaption,
  InsertCaptions
};
