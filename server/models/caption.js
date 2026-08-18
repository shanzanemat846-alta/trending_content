const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
  platform: {
    type: String,
    required: true,
    trim: true,
    enum: ['youtube', 'reddit', 'twitter']
  },
  url: { type: String },
  captions: { type: Array },
  updatedAt: { type: Date },
  createdAt: { type: Date }
}, {
  timestamps: true,
  strict: false
});

const Captions = model('caption', schema, 'captions');

module.exports = Captions;
