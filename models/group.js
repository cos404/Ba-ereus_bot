const mongoose = require('../lib/mongoose');
const Schema = mongoose.Schema;


const groupSchema = new Schema({
  groupId: {
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

module.exports = mongoose.model('group', groupSchema);