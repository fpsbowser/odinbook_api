const User = require('../models/User');
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwtStrategy = require('passport-jwt').Strategy;

const { body, validationResult } = require('express-validator');

exports.post_signup = [
  body('email', 'Must provide a valid email address!').isEmail(),
  body(
    'password',
    'Password must be at least 6 characters long and contain a lowercase, uppercase, and a number!'
  )
    .trim()
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    }),
  body('firstname', 'Please provide your first name!')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('lastname', 'Please provide your last name!')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('check', errors);
      return res.status(400).json(errors);
    }
    // Check if email exists in DB
    User.exists({ email: req.body.email }, (err, userExists) => {
      if (err) {
        return res.json(err);
      }
      if (userExists) {
        return res.status(400).json({
          errors: [
            {
              message:
                'The email you have entered already exists! Please use a different email.',
            },
          ],
        });
      } else {
        // Create new user
        const user = new User({
          name: {
            first: req.body.firstname,
            last: req.body.lastname,
          },
          dob: null,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8),
          friends: [],
          friend_requests: [],
          posts: [],
        });
        user.save((err, user) => {
          if (err) {
            return res.json(err).status(500);
          } else {
            // success - send jwt token and user info for frontend client
            jwt.sign(
              { id: user._id, name: user.name, email: user.email },
              process.env.TOKEN_SECRET,
              { expiresIn: '3d' },
              (err, token) => {
                if (err) {
                  console.log(err);
                  return res.json(err);
                }
                return res.json({
                  //data
                  success: true,
                  message: 'Successfully signed up',
                  user: {
                    name: user.name,
                    id: user._id,
                    email: user.email,
                    followers: user.friends,
                    following: user.friend_requests,
                    token: `Bearer ${token}`,
                  },
                });
              }
            );
          }
        });
      }
    });
  },
];

exports.post_login = [
  body('email', 'Must provide email').trim().isLength({ min: 1 }).escape(),
  body('password', 'Must provide password')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('validation errors');
      return res.status(400).json(errors);
    } else {
      // Use Passport's local strategy to authenticate the user
      passport.authenticate(
        'local',
        { session: false, failureMessage: true },
        (err, user, info) => {
          if (err || !user) {
            return res
              .status(401)
              .json({ message: 'Incorrect email or password', errors: [info] });
          }

          // Login the user
          req.login(user, { session: false }, (err) => {
            if (err) {
              return res.json(err);
            }

            // Generate JWT
            jwt.sign(
              { id: user._id, name: user.name, email: user.email },
              process.env.TOKEN_SECRET,
              { expiresIn: '3d' },
              (err, token) => {
                if (err) {
                  console.log(err);
                  return res.json(err);
                }
                return res.json({
                  success: true,
                  message: 'Successfully logged in',
                  user: {
                    name: user.name,
                    id: user._id,
                    email: user.email,
                    followers: user.friends,
                    following: user.friend_requests,
                    token: `Bearer ${token}`,
                  },
                });
              }
            );
          });
        }
      )(req, res, next);
    }
  },
];
