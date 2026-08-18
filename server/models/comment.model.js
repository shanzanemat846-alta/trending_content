const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  threadId: {
    type: Types.ObjectId,
    ref: "thread",
    required: true,
  },
  videoId: { type: String },
  platform: {
    type: String,
    required: true,
    trim: true,
    enum: ['youtube', 'reddit', 'twitter']
  }
}, {
  timestamps: true,
  strict: false
});

const Comment = model('comment', schema, 'comments');

module.exports = Comment;
