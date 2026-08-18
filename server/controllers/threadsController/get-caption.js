const { isEmpty, extend } = require('lodash');

const { GetCaption, InsertCaptions } = require('../../models/caption-services');
const { GetThread } = require('../../models/thread-services');

const { GetYoutubeVideoCaptions } = require('../../utils/helpers');

const GetVideoCaptions = async ({ threadId }) => {
  console.log('\n\n threadId: ', threadId);

  const threadDetails = await GetThread({ filterParams: { _id: threadId }, selectParams: { url : 1, platform: 1 } });

  const { url, platform } = threadDetails;

  console.log('\n\n ', {
    url, platform
  });

  const captions = await GetCaption({
    filterParams: {
      platform,
      url
    }
  });

  if (!isEmpty(captions)) {
    return { captions };
  }

  const { captions: transcriptions, engCaptionsNotAvailable, matches = [], captionTrackNotFound } = await GetYoutubeVideoCaptions({ url });

  const insertParams = {
    url,
    platform,
    captions: !engCaptionsNotAvailable ? transcriptions : []
  };

  if (captionTrackNotFound) {
    extend(insertParams, { captionTrackNotFound: true });
  } else if (engCaptionsNotAvailable) {
    extend(insertParams, { matches, engCaptionsNotAvailable: true });
  }

  const saveCaptions = await InsertCaptions({ insertParams });

  return { captions: saveCaptions };
};

module.exports = GetVideoCaptions;
