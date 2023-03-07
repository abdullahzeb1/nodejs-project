const mongoose = require('mongoose');
const schema = mongoose.Schema;
const teacherSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  classes: [
    {
      _id: false,
      classID: { type: String, required: true },
      subject: { type: String, required: true },
    },
  ],
};
module.exports = mongoose.model('Teacher', teacherSchema);
