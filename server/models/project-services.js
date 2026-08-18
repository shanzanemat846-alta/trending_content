const Project = require('./project.model');

const { ThrowMissingParamsError } = require('../utils/throw-missing-params-error');

const GetProject = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Project.findOne(filterParams).select(selectParams);

  return response;
};

const GetProjects = async ({ filterParams, selectParams = {} }) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Project.find(filterParams).select(selectParams);

  return response;
};

const UpdateProject = async ({
  filterParams,
  updateParams
}) => {
  ThrowMissingParamsError([filterParams]);

  const response = await Project.updateOne({
    ...filterParams
  }, {
    $set: {
      ...updateParams
    }
  });  

  return response;
}

const BulkWriteProject = async (bulkWriteData) => {
  ThrowMissingParamsError([bulkWriteData]);

  const response = await Project.bulkWrite(bulkWriteData);

  return response;
};

module.exports = {
  BulkWriteProject,
  GetProject,
  GetProjects,
  UpdateProject
};
