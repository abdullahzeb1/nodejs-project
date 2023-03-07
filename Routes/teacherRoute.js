const express = require('express');
const router = express.Router();
const Teachers = require('../Models/teacherModle');
const {
  registerValidation,
  loginValidation,
  classRegisterValidation,
} = require('../Validation');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const verify = require('../VerifyToken');
const Classes = require('../Models/classModel');

router.get('/get', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  if (!(req.user.role === 'admin')) {
    return res.json({ message: 'This rout is for admin onley' });
  }
  Teachers.find().then((data) => {
    res.json(data);
  });
});

router.post('/register', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  if (!(req.user.role === 'admin')) {
    return res.json({ message: 'This rout is for admin onley' });
  }

  //Data Validation :-
  const { error } = registerValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //Teacher Exists :-
  const teacherExists = await Teachers.findOne({ email: req.body.email });
  if (teacherExists) {
    return res.json({ message: ' Teacher already exists' });
  }

  //Confirm Password :-
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: 'Password does not match' });
  }

  try {
    const salt = await bcrypt.genSalt(7);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Store Admin In Database :-
    const teacherInput = {
      name: req.body.name,
      email: req.body.email,
      role: 'teacher',
      password: hashPassword,
    };
    const newTeacher = new Teachers(teacherInput);
    newTeacher.save().then((data) => {
      res.json(data);
    });
  } catch (error) {
    return res.json(error);
  }
});
//LogIn :-
router.post('/login', verify, async (req, res) => {
  if (req.user.isAuthenticated) {
    res.json({ message: 'Looged In user cannot logging again' });
  }
  //Data Validation :-
  const { error } = loginValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //Teacher Exists :-
  const teacherExists = await Teachers.findOne({ email: req.body.email });
  if (!teacherExists) {
    return res.json({ message: 'Teacher does not exists' });
  }

  //Password Matching :-
  const verified = await bcrypt.compare(
    req.body.password,
    teacherExists.password
  );
  if (!verified) {
    return res.json({ message: 'Incorrect Password' });
  }
  //JWT Asign :-
  try {
    const token = JWT.sign(
      {
        _id: teacherExists._id,
        role: teacherExists.role,
        isAuthenticated: true,
      },
      'NBB123',
      { expiresIn: '2h' }
    );
    res.cookie('access_token', token, { maxAge: 7200000, httpOnly: true });
    return res.json({
      _id: teacherExists._id,
      role: teacherExists.role,
      isAuthenticated: true,
    });
  } catch (err) {
    return res.json({ _id: '', role: '', isAuthenticated: false });
  }
});

// //Log Out :-
router.post('/logout', verify, (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'You cannot logout without logging in' });
  }
  if (!(req.user.role === 'teacher')) {
    return res.json({ message: 'This rout is for teacher onley' });
  }
  res.clearCookie('access_token');
  req.user = { _id: '', role: '', isAuthenticated: false };
  return res.json({ _id: '', role: '', isAuthenticated: false });
});

//Creat Class :-
router.post('/creat_class', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Login to access this route' });
  }

  if (!(req.user.role === 'teacher' || req.user.role === 'admin')) {
    return res.json({
      message:
        'You can not creat a class . Only teachers and admin can create a class',
    });
  }
  // Data Validation :-
  const { error } = classRegisterValidation({
    subject: req.body.subject,
    teacherID: req.user._id,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  if (error) {
    return res.json(error);
  }

  //Class Exists :-
  const classExists = await Classes.findOne({
    teacherID: req.user._id,
    subject: req.body.subject,
  });
  if (classExists) {
    return res.json({ message: 'class already exists' });
  }

  //Check password :-
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: 'Password doesnot match' });
  }
  try {
    const salt = await bcrypt.genSalt(7);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    //Store Data :-
    const newClass = new Classes({
      subject: req.body.subject,
      teacherID: req.user._id,
      password: hashPassword,
    });
    newClass.save().then(async (data) => {
      const classTeacher = await Teachers.findOne({ _id: req.user._id });
      let newClass = classTeacher.classes;
      newClass.push({ classID: data._id, subject: data.subject });
      classTeacher.save({ classes: newClass }).then((data) => {
        return res.json(data);
      });
    });
  } catch (error) {
    return res.json(error);
  }
});

// Read Class :-
router.get('/get_class', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  if (!(req.user.role === 'teacher' || req.user.role === 'admin')) {
    return res.json({
      message: 'Only teachers and admin can get a class data',
    });
  }

  var teacherID;
  if (req.user.role === 'teacher') {
    teacherID = req.user._id;
  }
  if (req.user.role === 'admin') {
    teacherID = req.body.teacherID;
  }
  //Teacher Exists :-
  const teacherExists = await Teachers.findOne({ _id: teacherID });
  if (!teacherExists) {
    return res.json({ message: 'Teacher doesnot exists' });
  }

  const classTeacher = await teacherExists.classes;
  return res.json(classTeacher);
});

//Update classes :-
router.put('/update_class', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'login to access this route' });
  }
  if (!(req.user.role === 'teacher' || req.user.role === 'admin')) {
    return res.json({ message: 'Olny teachers and admin can update a class' });
  }
  return res.json({ message: 'You cannot update all the classes at once' });
});

//Delete classes :-
router.delete('/delete_class', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'login to access this route' });
  }
  if (!(req.user.role === 'teacher' || req.user.role === 'admin')) {
    return res.json({ message: 'Olny teachers and admin can update a class' });
  }
  var teacherID;
  if (req.user.role === 'teacher') {
    teacherID = req.user._id;
  }
  if (req.user.role === 'admin') {
    teacherID = req.body.teacherID;
  }
  const teacherExists = await Teachers.findOne({ _id: teacherID });
  if (!teacherExists) {
    return res.json({ message: 'teacher does not exists' });
  }
  var classes = await teacherExists.classes;
  if (!classes) {
    return res.json({ message: 'teacher does not teach any class' });
  }
  //Delete :-
  teacherExists.updateOne({ classes: [] }).then((data) => {
    Classes.deleteMany({ teacherID: teacherExists._id }).then((data) => {
      return res.json(data);
    });
  });
});

module.exports = router;
