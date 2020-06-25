const express = require('express');
const User = require('../models/user');

// @ route  GET /api/users/me
// @desc    get current user
// Access   Private
exports.currentUser = async (req, res) => {
  try {
    const me = await User.findOne({ _id: req.data.user })
      .select('-password')
      .populate('rooms');
    res.json(me);
  } catch (error) {
    if (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
};
