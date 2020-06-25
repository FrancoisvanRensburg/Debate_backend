const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionSchema = new Schema(
  {
    title: { type: String, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);
