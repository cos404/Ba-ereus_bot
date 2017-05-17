/*
 * @module models
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */
 
const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;
const chatSchema = new Schema({
  chatId: {
    type: Number,
    required: true,
    unique: true,
  },
  language: {
    type: String,
    default: "en",
  },
  dayMan: {
    type: String,
  },
  dayDate: {
  	type: Date,
  }
});

module.exports = mongoose.model('chat', chatSchema);