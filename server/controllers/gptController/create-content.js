const { Types } = require('mongoose');

const { GetChat, InsertChat } = require('../../models/chatgpt-services');
const { GetPrompt } = require('../../models/prompt-services');
const { GetUserSubscriptionPlan } = require("../../models/user-subscription-plan-services");

const { GetAssistantResponse } = require('../../services/chatgpt');

const YoutubeInstructionsForGPT = require('./youtube-instructions-for-gpt');
const RedditInstructionsForGPT = require('./reddit-instructions-for-gpt');

const { CalculateCreditDeduction, DeductCreditsAndLogHistory, BuildUserMessage } = require('../../utils/helpers');


const { COSTING_TYPES, PLATFORMS } = require('../../utils/constants');

const CreateContent = async ({
  userId,
  platform,
  promptId,
  contentCreationParams
}) => {
  console.log('here the params: ', {
    userId,
    platform,
    promptId,
    contentCreationParams: JSON.stringify(contentCreationParams, null, 4)
  });

  const { additionCredits } = await GetUserSubscriptionPlan({ filterParams: { userId }});

  const promptDetails = await GetPrompt({
    filterParams: { _id: promptId }
  });

  const { content: promptContent } = promptDetails;

  if (platform === PLATFORMS.YOUTUBE) {
    const { selectedYoutubeThreadsList } = contentCreationParams;

    const {
      projectId,
      combineThreadTitles,
      canCreateContent,
      injectionContent,
      videoTitlesWithNoCaptions
    } = await YoutubeInstructionsForGPT({
      selectedYoutubeThreadsList
    });

     // In your main function:
     const messageForGPT = BuildUserMessage(
      promptContent,
      null,
      injectionContent || null
    );

    const alreadyChat = await GetChat({
      filterParams: { projectid: projectId, title: combineThreadTitles }
    });

    const chatList = [];

    if (!alreadyChat) {
      chatList.push({ user: "user", message: messageForGPT });
    } else {
      const error = new Error();
      error.statusCode = 400;
      error.error = 'Chat already existed, edit the content!';

      throw error;
    }

    const messages = [
      { role: 'system', content: 'Respond only using valid HTML tags (<h1>, <p>, <strong>, <ul>, <li>, <code>, etc.) where needed. Do not include <html>, <head>, or <body>. Return only the HTML fragment, ready for rendering.'  },
      { role: 'user', content: messageForGPT },
    ];

    console.log('\n\n canCreateContent: ', canCreateContent);

    if (!canCreateContent) {
      const error = new Error();
      error.statusCode = 400;
      error.error = 'Captions for selected videos are not available'

      throw error;
    }

    const { deductionAmount, gptConsumedTokens}  = await CalculateCreditDeduction({
      userId,
      projectId,
      type: COSTING_TYPES.GPT,
      words: messageForGPT,
      additionCredits
    });

    const { assistantResponse, tokenUsage } = await GetAssistantResponse({
      messages,
      projectId,
      userId
    });

    chatList.push({ user: "assistant", message: assistantResponse });

    const saveChat = await InsertChat({
      projectId,
      title: combineThreadTitles,
      chat: chatList
    });

    await DeductCreditsAndLogHistory({
      userId,
      type: COSTING_TYPES.GPT,
      deductionAmount,
      projectId,
      title: combineThreadTitles,
      gptConsumedTokens,
      actualTokenConsumed: tokenUsage
    });

    let message = `Success! Instructions received and proceed. ${deductionAmount} credit used.`;

    if (videoTitlesWithNoCaptions.length) message += `Note: A few selected videos were skipped because they don't have captions.`;
    return {
      message,
      assistantResponse,
      chat: saveChat
    };
  } else if (platform === PLATFORMS.MULTIPLE_PLATFORMS) {

    const { 
      selectedYoutubeThreadsList,
      selectedRedditThreadsList
    } = contentCreationParams;

    const {
      projectId,
      combineThreadTitles: combineThreadTitlesOfTY,
      canCreateContent,
      injectionContent: youtubeInjectionContent,
      videoTitlesWithNoCaptions
    } = await YoutubeInstructionsForGPT({
      selectedYoutubeThreadsList
    });

    if (!canCreateContent) {
      const error = new Error();
      error.statusCode = 400;
      error.error = 'Captions for selected videos are not available'

      throw error;
    }

    const {
      combineThreadTitles: combineThreadTitlesOfReddit,
      injectionContent: redditInjectionContent,
    } = await RedditInstructionsForGPT({
      selectedYoutubeThreadsList,
      selectedRedditThreadsList
    });
   
    const combineTitle = combineThreadTitlesOfReddit + combineThreadTitlesOfTY;


    const alreadyChat = await GetChat({
      filterParams: { projectid: projectId, title: combineTitle }
    });
    
    const chatList = [];

    // In your main function:
    const messageForGPT = BuildUserMessage(
      promptContent,
      redditInjectionContent || null,
      youtubeInjectionContent || null
    );

    if (!alreadyChat) {
      chatList.push({ user: "user", message: messageForGPT });
    } else {
      const error = new Error();
      error.statusCode = 400;
      error.error = 'Chat already existed, edit the content!';

      throw error;
    }

    const messages = [
      { role: 'system', content: 'Respond only using valid HTML tags (<h1>, <p>, <strong>, <ul>, <li>, <code>, etc.) where needed. Do not include <html>, <head>, or <body>. Return only the HTML fragment, ready for rendering.'  },
      { role: 'user', content: messageForGPT }
    ];

    const { deductionAmount, gptConsumedTokens} = await CalculateCreditDeduction({
      userId,
      projectId,
      type: COSTING_TYPES.GPT,
      words: messageForGPT,
      additionCredits
    });

    const { assistantResponse, tokenUsage } = await GetAssistantResponse({
      messages,
      projectId,
      userId,
    });

    chatList.push({ user: "assistant", message: assistantResponse });

    const saveChat = await InsertChat({
      projectId,
      title: combineTitle,
      chat: chatList
    });

    await DeductCreditsAndLogHistory({
      userId,
      type: COSTING_TYPES.GPT,
      deductionAmount,
      projectId,
      title: combineTitle,
      gptConsumedTokens,
      actualTokenConsumed: tokenUsage
    });

    let message = `Success! Instructions received and proceed. ${deductionAmount} credit used.`;

    if (videoTitlesWithNoCaptions.length) message += `Note: A few selected videos were skipped because they don't have captions.`;
    
    return {
      message,
      assistantResponse,
      chat: saveChat
    };
  }
};

module.exports = CreateContent;
