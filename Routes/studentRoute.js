const express = require('express');
const router = express.Router();
const Students = require('../Models/studentModel');
const { registerValidation, loginValidation } = require('../Validation');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const verify = require('../VerifyToken');
const { findOne } = require('../Models/studentModel');

router.get('/get', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  if (!(req.user.role === 'admin')) {
    return res.json({ message: 'This rout is for admin onley' });
  }
  Students.find().then((data) => {
    res.json(data);
  });
});

router.post('/register', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  //Data Validation :-
  const { error } = registerValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //Stucent Exists :-
  const studentExists = await Students.findOne({ email: req.body.email });
  if (studentExists) {
    return res.json({ message: 'message: Student already exists' });
  }

  //Confirm Password :-
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: 'Password does not match' });
  }

  try {
    const salt = await bcrypt.genSalt(7);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Store Admin In Database :-
    const studentInput = {
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      role: 'Student',
    };
    const newStudent = new Students(studentInput);
    newStudent.save().then((data) => {
      res.json(data);
    });
  } catch (err) {
    return res.json(err);
  }
});
//Login :-
router.post('/login', verify, async (req, res) => {
  if (req.user.isAuthenticated) {
    res.json({ message: 'Looged In user cannot logging again' });
  }
  //Data Validation :-
  const { error } = loginValidation(req.body);
  if (error) {
    return res.json(error);
  }
  //Students Exists :-
  const studentExists = await Students.findOne({ email: req.body.email });
  if (!studentExists) {
    return res.json({ message: 'Student does not exists' });
  }
  //Password Matching :-
  const verified = await bcrypt.compare(
    req.body.password,
    studentExists.password
  );
  if (!verified) {
    return res.json({ message: 'Incorrect Password' });
  }
  try {
    const token = JWT.sign(
      {
        _id: studentExists._id,
        role: studentExists.role,
        isAuthenticated: true,
      },
      'NBB123',
      { expiresIn: '2h' }
    );
    res.cookie('access_token', token, { maxAge: 7200000, httpOnly: true });
    return res.json({
      _id: studentExists._id,
      role: studentExists.role,
      isAuthenticated: true,
    });
  } catch (error) {
    return res.json(error);
  }
});

//Log Out :-
router.post('/logout', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'You cannot logout without logging in' });
  }
  if (!(req.user.role === 'Student')) {
    return res.json({ message: 'This rout is for student onley' });
  }
  res.clearCookie('access_token');
  req.user = { _id: '', role: '', isAuthenticated: false };
  return res.json(req.user);
});

module.exports = router;
