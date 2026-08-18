const Campaign = require('./campaign.model');
const Caption = require('./caption');
const Comment = require('./comment.model');
const CreditHistory = require('./credit-history.model');
const Invoice = require('./invoice.model');
const Project = require('./project.model');
const Prompt = require('./prompt.model');
const Store = require('./store.model');
const Thread = require('./thread.model');
const User = require('./User.model');
const UserSubscription = require('./user-subscription-plan.model');

async function createCampaignIndexes() {
  try {
    await Campaign.collection.createIndex({ projectid: 1, title: 1 }, { name: 'campaign_project_title' });
    await Campaign.collection.createIndex({ projectid: 1, 'platforms.reddit': 1 }, { name: 'campaign_project_reddit' });
    await Campaign.collection.createIndex({ projectid: 1, 'platforms.youtube': 1 }, { name: 'campaign_project_youtube' });

    console.log('Campaign indexes created successfully');
  } catch (error) {
    console.error('Error creating Campaign indexes:', error);
  }
}

async function createCaptionIndexes() {
  try {
    await Caption.collection.createIndex({ url: 1 }, { name: 'caption_url' });
    console.log('Caption indexes created successfully');
  } catch (error) {
    console.error('Error creating Caption indexes:', error);
  }
}

async function createCommentIndexes() {
  try {
    await Comment.collection.createIndex({ threadId: 1 }, { name: 'comment_thread' });
    console.log('Comment indexes created successfully');
  } catch (error) {
    console.error('Error creating Comment indexes:', error);
  }
}

async function createCreditHistoryIndexes() {
  try {
    await CreditHistory.collection.createIndex({ userId: 1, timestamp: -1 }, { name: 'credithistory_user_timestamp' });
    await CreditHistory.collection.createIndex({ timestamp: -1 }, { name: 'credithistory_timestamp_desc' });
    await CreditHistory.collection.createIndex({ userId: 1, type: 1 }, { name: 'credithistory_user_type' });
    console.log('CreditHistory indexes created successfully');
  } catch (error) {
    console.error('Error creating CreditHistory indexes:', error);
  }
}

async function createInvoiceIndexes() {
  try {
    await Invoice.collection.createIndex({ userId: 1 }, { name: 'invoice_user' });
    console.log('Invoice indexes created successfully');
  } catch (error) {
    console.error('Error creating Invoice indexes:', error);
  }
}

async function createProjectIndexes() {
  try {
    await Project.collection.createIndex({ userId: 1 }, { name: 'project_user' });
    console.log('Project indexes created successfully');
  } catch (error) {
    console.error('Error creating Project indexes:', error);
  }
}

async function createPromptIndexes() {
  try {
    await Prompt.collection.createIndex({ userId: 1 }, { name: 'prompt_user' });
    console.log('Prompt indexes created successfully');
  } catch (error) {
    console.error('Error creating Prompt indexes:', error);
  }
}

async function createStoreIndexes() {
  try {
    await Store.collection.createIndex({ userId: 1 }, { name: 'store_user' });
    await Store.collection.createIndex({ projectid: 1, title: 1 }, { name: 'store_project_title' });
    await Store.collection.createIndex({ projectid: 1, date: -1 }, { name: 'store_project_date_desc' });
    console.log('Store indexes created successfully');
  } catch (error) {
    console.error('Error creating Store indexes:', error);
  }
}

async function createThreadIndexes() {
  try {
    await Thread.collection.createIndex({ projectid: 1, platform: 1 }, { name: 'thread_project_platform' });
    await Thread.collection.createIndex({ projectid: 1, platform: 1, mode: 1 }, { name: 'thread_project_platform_mode' });
    await Thread.collection.createIndex({ projectid: 1, platform: 1, campaignID: 1 }, { name: 'thread_project_platform_campaign' });
    await Thread.collection.createIndex({ projectid: 1, platform: 1, subreddit: 1 }, { name: 'thread_project_platform_subreddit' });
    await Thread.collection.createIndex({ projectid: 1, platform: 1, date: -1, _id: -1 }, { name: 'thread_project_platform_date_id_desc' });
    await Thread.collection.createIndex({ title: 'text' }, { name: 'thread_title_text' });
    await Thread.collection.createIndex({ projectid: 1, platform: 1, upvotes: -1 }, { name: 'thread_project_platform_upvotes_desc' });
    console.log('Thread indexes created successfully');
  } catch (error) {
    console.error('Error creating thread indexes:', error);
  }
}

async function createUserIndexes() {
  try {
    await User.collection.createIndex({ status: 1, role: 1, createdAt: -1 }, { name: 'user_status_role_created_desc' });
    await User.collection.createIndex({ email: 1 }, { name: 'user_email' });
    console.log('User indexes created successfully');
  } catch (error) {
    console.error('Error creating user indexes:', error);
  }
}

async function createUserSubscriptionIndexes() {
  try {
    await UserSubscription.collection.createIndex({ userId: 1 }, { name: 'usersubscription_user' });
    await UserSubscription.collection.createIndex({ status: 1 }, { name: 'usersubscription_status' });
    await UserSubscription.collection.createIndex({ expiresAt: 1 }, { name: 'usersubscription_expires' });
    console.log('UserSubscription indexes created successfully');
  } catch (error) {
    console.error('Error creating UserSubscription indexes:', error);
  }
}

module.exports = {
  createCampaignIndexes,
  createCaptionIndexes,
  createCommentIndexes,
  createCreditHistoryIndexes,
  createInvoiceIndexes,
  createProjectIndexes,
  createPromptIndexes,
  createStoreIndexes,
  createThreadIndexes,
  createUserIndexes,
  createUserSubscriptionIndexes
};
