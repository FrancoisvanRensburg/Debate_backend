const express = require('express');
const router = express.Router();

const {
  signup,
  accountActivation,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');

const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');
const { runValidation } = require('../validators/index');

router.post('/signup', userSignupValidator, runValidation, signup);

router.post('/account-activation', accountActivation);

router.post('/login', userSigninValidator, runValidation, login);

router.put(
  '/forgot-password',
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);

router.put(
  '/reset-password',
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
