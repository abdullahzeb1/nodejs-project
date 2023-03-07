const mongoose = require('mongoose');
const schema = mongoose.Schema;
const classSchema = {
  subject: { type: String, required: true },
  teacherID: { type: String, required: true },
  password: { type: String, required: true },
  students: [{ _id: false, studentID: { type: String, required: true } }],
};
module.exports = mongoose.model('Class', classSchema);
