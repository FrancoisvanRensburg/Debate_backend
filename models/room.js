const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    name: { type: String, required: true, default: '' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    description: {
      type: String,
      required: true,
      max: 255,
      trim: true,
      default: '',
    },
    discussions: { type: Schema.Types.ObjectId, ref: 'Discussion' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
