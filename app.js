const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());
mongoose.connect(
  'mongodb+srv://abdullah:abdullah123@cluster0.haggvpa.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('connected to database');
  }
);
//Admin Routes :-
const adminRoutes = require('./Routes/adminRoute');
app.use('/admin', adminRoutes);

//Teacher Routes :-
const teacherRoutes = require('./Routes/teacherRoute');
app.use('/teacher', teacherRoutes);

//Student Routes :-
const studentRoutes = require('./Routes/studentRoute');
app.use('/student', studentRoutes);

//Classes Routes :-
const classRoutes = require('./Routes/classRoute');
app.use('/class', classRoutes);

//404 Error :-
app.all('*', (req, res) => {
  return res.status(404).json({ message: 'Page is not Found' });
});

app.listen(5005, () => {
  console.log('server start at 5005 ports');
});
