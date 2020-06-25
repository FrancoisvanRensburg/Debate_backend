const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    content: { type: String, trim: true, required: true },
    discussion: { type: Schema.Types.ObjectId, ref: 'Discussion' },
    replies: { type: Schema.Types.ObjectId, ref: 'Message' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    thread: { type: Array, default: [] },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
