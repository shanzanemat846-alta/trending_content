const axios = require('axios');
const { isEmpty } = require('lodash');

const { GetProject } = require('../models/project-services');
const { GetUser } = require('../models/user-services');
const { GetOpenAIModel } = require('../models/open-ai-models-services');

const { CHAT_GPT_ENDPOINTS, DEFAULT_GPT_MODEL } = require('../utils/constants');
const { GetDecodedOpenAIKey } = require('../utils/open-ai-encryption');


const GetSemanticWordsByGPT = async ({ instructionPrompt, keyword, projectId, userId, platform = 'reddit' }) => {
  console.log('keyword: ', keyword);

  const messages = [
    {
      role: 'system',
      content: 
      `You are an advanced semantic search query analyzer and generator for searching on the ${platform} platform 
      (e.g., Reddit or YouTube). 

      Your job is to take a user query, deeply understand its intent, and expand it into multiple search-ready variations 
      across three specificity levels. The goal is to maximize relevant search results on ${platform}, 
      while staying natural and context-appropriate.

      CORE ANALYSIS REQUIREMENTS:
      1. **Semantic Understanding**: Go beyond keywords — understand whether the query is about comparisons, reviews, 
        recommendations, opinions, tutorials, or general information.
      2. **Entity Recognition**: Identify and extract:
        - Core subjects, products, or services
        - Comparative elements (vs, versus, comparison, head-to-head)
        - Qualifiers (best, budget, affordable, top-rated, new, 2025, etc.)
        - Locations, brands, price ranges, timeframes
      3. **Context Preservation**: Keep all entities and qualifiers intact in the variations while adjusting tone/phrasing naturally.

      QUERY EXPANSION RULES:
      1. **Level 1 (Direct synonyms & close variations)**: Generate three natural rephrasings or synonyms that 
        preserve all entities and qualifiers. Keep them highly relevant and close to the original intent.
      2. **Level 2 (Related concepts)**: Expand into adjacent but still strongly relevant queries, such as reviews, 
        tutorials, comparisons, buying guides, or user opinions. Adapt the phrasing depending on the platform:
        - On Reddit: conversational style ("anyone tried X?", "thoughts on Y vs Z?")
        - On YouTube: content style ("X review 2025", "best way to use Y", "top Z tutorial")
      3. Do not rigidly repeat the same wording (e.g., don’t always use “versus” or “reviews”). 
        Use natural alternatives appropriate for the context (e.g., “compared to”, “difference between”, “which is better”, 
        “opinions on”, “top picks for”).

      BOOLEAN QUERY GUIDELINES:
      - Use OR for synonyms: (airconditioner OR AC OR "air conditioning")
      - Use AND for mandatory elements: (budget AND India)
      - Use parentheses for grouping: (Sony OR JBL) AND speakers
      - Use quotes for exact phrases when natural

      EXAMPLES WITH ANALYSIS:

      Example (Comparison):
      Query: "Sony vs JBL speakers"
      Analysis: Comparison query between two speaker brands
      {
        "level1": ["Sony versus JBL speakers", "Sony compared to JBL speakers", "JBL vs Sony speaker comparison"],
        "level2": ["Sony speaker sound quality vs JBL", "JBL compared with Sony bass performance", "which is better Sony or JBL speakers"]
      }

      Example (Budget + Location):
      Query: "best budget AC India"
      Analysis: Affordable, location-specific air conditioner search
      {
        "level1": ["best budget AC India 2025", "top affordable air conditioners India", "cheap AC units in India"],
        "level2": ["affordable inverter AC India", "low cost cooling appliances India", "energy efficient ACs for homes in India"]
      }

      Example (Tourist Destination):
      Query: "what is the best places in Lahore"
      Analysis: Location-specific tourist attraction search
      {
        "level1": ["best places to visit in Lahore", "top tourist attractions Lahore", "must-see spots in Lahore"],
        "level2": ["things to do in Lahore", "Lahore sightseeing guide", "Lahore travel destinations"]
      }

      CRITICAL CONSTRAINTS:
      - Do NOT include the keyword in the variations verbatim
      - Output ONLY valid JSON NO EXTRA TEXT
      - Each level must contain exactly 3 distinct search terms
      - Avoid overly generic terms — keep all relevant entities and qualifiers
      - Adapt tone to the ${platform} (Reddit queries sound conversational, YouTube queries sound like video search)
      - Ensure variations sound natural, human, and search-engine friendly
      - Always include the current year (e.g., 2025) where relevant for freshness
      - Never add the platform name (Reddit/YouTube) into the search terms

      RESPONSE FORMAT:
      {
        "level1": ["term1", "term2", "term3"],
        "level2": ["term1", "term2", "term3"]
      }`
    },
    {
      role: 'user',
      content: keyword
    }
  ];

  const { assistantResponse } = await GetAssistantResponse({
    messages,
    projectId,
    userId,
  });

  try {
    console.log('assistantResponse: ', assistantResponse);
    const parsed = JSON.parse(assistantResponse);
    return {
      level1: parsed.level1 || [],
      level2: parsed.level2 || [],
    };
  } catch (err) {
    console.error('Failed to parse GPT response as JSON:', err);
    return { level1: [], level2: [], level3: [] };
  }
};

const GetAssistantResponse = async ({
  messages,
  projectId,
  userId,
}) => {
  // Get the Project Key
  const projectResponse = await GetProject({
    filterParams: { _id: projectId },
    selectParams: { chatgpttype: 1, projectOpenAI: 1 }
  });

  console.log('projectResponse: ', projectResponse);
  const { chatgpttype, projectOpenAI } = projectResponse;
  const { key: projectAIKey } = projectOpenAI || {};

  console.log('\n\n 1', {
    chatgpttype, projectAIKey
  });
  const chatGptModelType = chatgpttype || DEFAULT_GPT_MODEL;

  let openAIKey = '';

  if (!isEmpty(projectAIKey)) {
    openAIKey = projectAIKey
  } else {
    // get the user global open ai key
    const userDetails = await GetUser({
      filterParams: { _id: userId },
      selectParams: { globalOpenAI: 1 }
    });

    const { globalOpenAI } = userDetails;
    const { key: globalOpenAIKey } = globalOpenAI || {};

    console.log('userDetails: 2', userDetails);

    const adminDetails = await GetOpenAIModel({
      filterParams: { isDefault: true },
      selectParams: { apiKey: 1, modelName: 1 }
    });

    const { apiKey } = adminDetails;

    // is user don't have the global open ai key then check the admin basic open ai key if model 
    if (!isEmpty(globalOpenAIKey)) {
      openAIKey = globalOpenAIKey;
    } else if (!isEmpty(apiKey)) {
      openAIKey = apiKey;
    } else {
      const error = new Error();

      error.error = `Open API Key is not set for the selected model ${chatGptModelType} Please set it at Project Level or Globally in User Profile`;
      error.status = 400;
      throw error;
    }
  }

  openAIKey = GetDecodedOpenAIKey(openAIKey);

  console.log({ chatGptModelType, openAIKey });

  try {
    const response = await axios.post(
      CHAT_GPT_ENDPOINTS.CREATE_CHAT_COMPLETION,
      {
        model: chatGptModelType,
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
      }
    );
    return {
      assistantResponse: response?.data?.choices[0]?.message?.content,
      tokenUsage: {
        promptTokens: response?.data?.usage.prompt_tokens,
        completionTokens: response?.data?.usage.completion_tokens,
        totalTokens: response?.data?.usage.total_tokens,
      }
    };
  } catch (err) {
    console.log('GetAssistantResponse error:', {
      message: err?.message,
      status: err?.response?.status,
      response: err?.response?.data,
      stack: err?.stack,
    });

    const { error } = err?.response?.data || {};

    if (error?.code === 'invalid_api_key') {
      const errorMessage = new Error();
      errorMessage.status = err?.response?.status || 401;
      errorMessage.error = error?.message || 'Open AI key at Project Level or Globally in User Profile is not valid!';
      throw errorMessage;
    }
    if (error?.code === 'context_length_exceeded' || error?.code === 'request_timeout') {
      const errorMessage = new Error();
      errorMessage.status = err?.response?.status || 400;
      errorMessage.error = error?.message || 'Request failed';
      throw errorMessage;
    }

    const wrapped = new Error();
    wrapped.status = err?.response?.status || err?.status || 500;
    wrapped.error = (typeof error === 'string' && error) || error?.message || err?.message || 'Server Error!';
    throw wrapped;
  }
};

module.exports = { GetAssistantResponse, GetSemanticWordsByGPT };
