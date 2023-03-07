const express = require('express');
const router = express.Router();
const Admins = require('../Models/adminModei');
const { registerValidation, loginValidation } = require('../Validation');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const verify = require('../VerifyToken');
const { json } = require('express');

router.get('/get', verify, async (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'Pleas login in to access this route' });
  }
  if (!(req.user.role === 'admin')) {
    return res.json({ message: 'This rout is for admin onley' });
  }
  Admins.find().then((data) => {
    res.json(data);
  });
});

router.post('/register', verify, async (req, res) => {
  if (req.user.isAuthenticated) {
    return res.json({ message: 'Looged In user cannot register new user' });
  }

  //Data Validation :-
  const { error } = registerValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //Admin Exists :-
  const adminExists = await Admins.findOne({ email: req.body.email });
  if (adminExists) {
    return res.json({ message: 'Admin already exists' });
  }

  //Confirm Password :-
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: 'Password does not match' });
  }

  try {
    const salt = await bcrypt.genSalt(7);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Store Admin In Database :-
    const adminInput = {
      name: req.body.name,
      email: req.body.email,
      role: 'admin',
      password: hashPassword,
    };
    const newAdmin = new Admins(adminInput);
    newAdmin.save().then((data) => {
      res.json(data);
    });
  } catch (err) {
    return res.json(err);
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

  //Admin Exists :-
  const adminExists = await Admins.findOne({ email: req.body.email });
  if (!adminExists) {
    return res.json({ message: 'Admin does not exists' });
  }

  //Password Matching :-
  const verified = await bcrypt.compare(
    req.body.password,
    adminExists.password
  );
  if (!verified) {
    return res.json({ message: 'Incorrect Password' });
  }
  //JWT Asign :-
  try {
    const token = JWT.sign(
      { _id: adminExists._id, role: adminExists.role, isAuthenticated: true },
      'NBB123',
      { expiresIn: '2h' }
    );
    res.cookie('access_token', token, { maxAge: 7200000, httpOnly: true });
    return res.json({
      _id: adminExists._id,
      role: adminExists.role,
      isAuthenticated: true,
    });
  } catch (err) {
    return res.json({ _id: '', role: '', isAuthenticated: false });
  }
});

//Log Out :-
router.post('/logout', verify, (req, res) => {
  if (!req.user.isAuthenticated) {
    return res.json({ message: 'You cannot logout without logging in' });
  }
  res.clearCookie('access_token');
  req.user = { _id: '', role: '', isAuthenticated: false };
  return res.json({ _id: '', role: '', isAuthenticated: false });
});

module.exports = router;
