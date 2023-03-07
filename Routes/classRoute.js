const express = require('express');
const router = express.Router();
const Classes = require('../Models/classModel');
const { classRegisterValidation } = require('../Validation');
const bcrypt = require('bcrypt');
const { cache } = require('@hapi/joi');

router.get('/get', async (req, res) => {
  Classes.find().then((data) => {
    res.json(data);
  });
});

router.post('/register', async (req, res) => {
  const { error } = classRegisterValidation(req.body);
  if (error) {
    return res.json(error);
  }

  //Confirm Password :-
  if (!(req.body.password === req.body.confirmPassword)) {
    return res.json({ message: 'Password does not match' });
  }

  try {
    const salt = await bcrypt.genSalt(7);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //Store Admin In Database :-
    const classInput = {
      subject: req.body.subject,
      teacherID: req.body.teacherID,
      password: req.body.password,
    };
    const newClass = new Classes(classInput);
    newClass.save().then((data) => {
      res.json(data);
    });
  } catch (error) {
    return res.json(error);
  }
});

module.exports = router;
