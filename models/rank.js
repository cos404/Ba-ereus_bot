/*
 * @module models
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */

const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;
const rankSchema = new Schema({
  chatId: {
    type: Number,
    required: true,
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

rankSchema.index({chatId: 1, reputation: 1},{unique: true});

module.exports = mongoose.model('rank', rankSchema);