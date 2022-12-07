const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({
  comment: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  timestamp: { type: Date, required: true },
  edited_timestamp: { type: Date },
});

module.exports = mongoose.model('Comment', commentSchema);
