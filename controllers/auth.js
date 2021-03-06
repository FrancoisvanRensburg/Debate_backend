const User = require('../models/user');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const expressJwt = require('express-jwt');

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: 7200 }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account activation link`,
      html: `<h1>Please use the following link to activate your account</h1>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
    };

    sgMail
      .send(emailData)
      .then(() => {
        return res.json({
          message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
        });
      })
      .catch((error) => {
        console.error(error);

        if (error.response) {
          const { message, code, response } = error;

          const { headers, body } = response;

          console.error(body);
        }
      });
  } catch (error) {
    if (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
};

exports.accountActivation = async (req, res) => {
  const { token } = req.body;
  try {
    if (token) {
      jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (
        err,
        decoded
      ) {
        if (err) {
          console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
          return res.status(401).json({
            error: 'Expired link. Signup again',
          });
        }

        const { name, email, password } = jwt.decode(token);

        const user = new User({ name, email, password });

        user.save((err, user) => {
          if (err) {
            console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
            return res.status(401).json({
              error: 'Error saving user in database. Try signup again',
            });
          }
          return res.json({
            message: 'Signup success. Please signin.',
          });
        });
      });
    } else {
      return res.json({
        message: 'Something went wrong. Try again.',
      });
    }
  } catch (error) {
    if (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid email address' }] });
    }

    if (!user.authenticate(password)) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Email and password do not match' }] });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 360000,
    });
    const { _id, name, role } = user;

    return res.json({
      token,
      user: { _id, name, email, role },
    });
  } catch (error) {
    if (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // req.user._id
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.',
      });
    }

    req.profile = user;
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist',
      });
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: '10m',
      }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password Reset link`,
      html: `
              <h1>Please use the following link to reset your password</h1>
              <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
              <hr />
              <p>This email may contain sensetive information</p>
              <p>${process.env.CLIENT_URL}</p>
          `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        console.log('RESET PASSWORD LINK ERROR', err);
        return res.status(400).json({
          error: 'Database connection error on user password forgot request',
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            // console.log('SIGNUP EMAIL SENT', sent)
            return res.json({
              message: `Email has been sent to ${email}. Follow the instruction to activate your account`,
            });
          })
          .catch((err) => {
            // console.log('SIGNUP EMAIL SENT ERROR', err)
            return res.json({
              message: err.message,
            });
          });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (
      err,
      decoded
    ) {
      if (err) {
        return res.status(400).json({
          error: 'Expired link. Try again',
        });
      }

      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: 'Something went wrong. Try later',
          });
        }

        const updatedFields = {
          password: newPassword,
          resetPasswordLink: '',
        };

        user = _.extend(user, updatedFields);

        user.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: 'Error resetting user password',
            });
          }
          res.json({
            message: `Great! Now you can login with your new password`,
          });
        });
      });
    });
  }
};
