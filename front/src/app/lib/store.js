import { thunk } from 'redux-thunk';
import logger from 'redux-logger';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import createFilter from 'redux-persist-transform-filter';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import campaignSlice from 'src/app/lib/slices/campaign-slice';
import chatgptSlice from 'src/app/lib/slices/chatgpt-slice';
import projectReducer from 'src/app/lib/slices/project-slice'; 
import threadSlice from 'src/app/lib/slices/thread-slice';
import userReducer from 'src/app/lib/slices/user-slice'; 
import adminReducer from 'src/app/lib/slices/admin-slice'; 
import authReducer from 'src/app/lib/slices/auth-slice'; 
import subscriptionReducer from 'src/app/lib/slices/subscription-slice'; 
import invoiceReducer from 'src/app/lib/slices/invoice-slice';
import openAIModelReducer from 'src/app/lib/slices/open-ai-model-slice';

const threadTransform = createFilter('thread', ['redditPrePromptDetails', 'selectedRedditThreadsList', 'selectedYoutubeThreadsList', 'platformForContent']);

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['thread', 'subscription'],
  transforms: [threadTransform]
};

const reducers = combineReducers({
  campaign: campaignSlice,
  chatgpt: chatgptSlice,
  thread: threadSlice,
  user: userReducer,
  project: projectReducer,
  admin: adminReducer,
  auth: authReducer,
  subscription: subscriptionReducer,
  invoice: invoiceReducer,
  openAIModel: openAIModelReducer
});

const rootReducer = (state, action) => reducers(state, action);

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk, logger),
    devTools: true,
  });

  const persistor = persistStore(store);

  return { store, persistor };
};
