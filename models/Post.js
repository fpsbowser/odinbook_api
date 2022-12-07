const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  post: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, required: true },
  edited_timestamp: { type: Date },
});

module.exports = mongoose.model('Post', postSchema);
