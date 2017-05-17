/*
 * @module models
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */

const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
  chatId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  reputation: {
    type: Number,
    default: 0,
  },
  countWin: {
    type: Number,
    default: 0,
  },
  blacklist: {
    type: Boolean,
    default: false,
  },
});

userSchema.index({chatId: 1, userId: 1}, {unique: true});

module.exports = mongoose.model('user', userSchema);