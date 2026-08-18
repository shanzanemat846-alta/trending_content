const { isEmpty, extend } = require('lodash');

const { UpdateProject: UpdateProjectDetail, GetProject } = require('../../models/project-services');

const UpdateUser = async ({
  projectId,
  updateParams: data,
  action = "addThreads"
}) => {
  const { selectedThreadsList } = data;

  let updateParams = {};

  const projectDetails = await GetProject({
    filterParams: {
      _id: projectId
    }
  });

  let message = 'Selected Threads saved successfully!';

  if (action === "addThreads") {
    const { selectedThreadsList: prevSelectedThreadsList = {} } = projectDetails || {};
  
    const { 
      redditThreadsIds: prevRedditThreadsIds = [], 
      youtubeThreadsIds: prevYoutubeThreadsIds = [] 
    } = prevSelectedThreadsList || {};


    const { redditThreadsIds, youtubeThreadsIds } = selectedThreadsList;

    const newThreadsListReddit = [...prevRedditThreadsIds, ...redditThreadsIds]
    const newThreadsListYoutube = [...prevYoutubeThreadsIds, ...youtubeThreadsIds]
    
    extend(updateParams, {
      selectedThreadsList: {
        redditThreadsIds: newThreadsListReddit,
        youtubeThreadsIds: newThreadsListYoutube
      }
    });
  } else if (action === "saveThreads") {
    const { selectedThreadsList } = data;
    const { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList || {};

    extend(updateParams, {
      selectedThreadsList: {
        redditThreadsIds,
        youtubeThreadsIds
      }
    });
  } else if (action === 'deleteSaveThreads') {
    console.log('coming in this delete save threads')
    const { selectedThreadsList: prevSelectedThreadsList = {} } = projectDetails || {};

    const {
      redditThreadsIds: prevRedditThreadsIds = [],
      youtubeThreadsIds: prevYoutubeThreadsIds = []
    } = prevSelectedThreadsList || {};

    const { redditThreadsIds = [], youtubeThreadsIds = [] } = selectedThreadsList || {};

    const updatedRedditThreadsIds = prevRedditThreadsIds.filter(
      row => !redditThreadsIds.includes(row.threadId)
    );
    const updatedYoutubeThreadsIds = prevYoutubeThreadsIds.filter(
      row => !youtubeThreadsIds.includes(row.threadId)
    );

    extend(updateParams, {
      selectedThreadsList: {
        redditThreadsIds: updatedRedditThreadsIds,
        youtubeThreadsIds: updatedYoutubeThreadsIds
      }
    });

    message = "Save thread removed successfully!"
  }

  await UpdateProjectDetail({
    filterParams: { _id: projectId },
    updateParams
  });

  return {
    message
  }
};

module.exports = UpdateUser;
