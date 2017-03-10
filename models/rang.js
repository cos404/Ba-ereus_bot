const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;


const rangSchema = new Schema({
  groupId: {
    type: Number,
    required: true,
    ref: 'group',
  },
  rang: {
    type: String,
    required: true,
  },
  reputation: {
    type: Number,
    required: true,
  },
});

rangSchema.index({groupId: 1, reputation: 1},{unique: true});

module.exports = mongoose.model('rang', rangSchema);