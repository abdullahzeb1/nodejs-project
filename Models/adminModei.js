const { string } = require('@hapi/joi');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const adminSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
};
module.exports = mongoose.model('Admin', adminSchema);
