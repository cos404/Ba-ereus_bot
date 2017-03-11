const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;


const rankSchema = new Schema({
  groupId: {
    type: Number,
    required: true,
    ref: 'group',
  },
  rank: {
    type: String,
    required: true,
  },
  reputation: {
    type: Number,
    required: true,
  },
});

rankSchema.index({groupId: 1, reputation: 1},{unique: true});

module.exports = mongoose.model('rank', rankSchema);