const { GetProject: GetProjectDetail } = require('../../models/project-services');

const GetProject = async ({
  projectId
}) => {
  const project = await GetProjectDetail({ filterParams: { _id: projectId } });

  return {
    project
  }
};

module.exports = GetProject;
