const User = require('../models/user');
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwtStrategy = require('passport-jwt').Strategy;

const { body, validationResult } = require('express-validator');

exports.post_signup = [
  body('email', 'must provide email')
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .escape(),
  body(
    'password',
    'Password must be at least 6 characters long and contain a lowercase, uppercase, and a number'
  )
    .trim()
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    }),
  body('firstname', 'must provide firstname')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('lastname', 'must provide lastname')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ message: 'Validation error', errors }).status(400);
    }
    // Check if email exists in DB
    User.exists({ email: req.body.email }, (err, userExists) => {
      if (err) {
        return res.json(err);
      }
      if (userExists) {
        return res
          .json({
            error:
              'The email you have entered already exists! Please use a different email.',
          })
          .status(400);
      } else {
        // Create new user
        const user = new User({
          name: {
            first: req.body.firstname,
            last: req.body.lastname,
          },
          // TODO: Add dob validation
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
            res.json({
              message: 'Successfully registered user',
              user: {
                name: user.name,
                email: user.email,
                id: user._id,
              },
            });
          }
        });
      }
    });
  },
];

// exports.post_login = [
//   body('email', 'Must provide email').trim().isLength({ min: 1 }).escape(),
//   body('password', 'Must provide password')
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   async (req, res, next) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       console.log('validation errors');
//       return res.json(errors).status(400);
//     } else {
//       // Search for user
//       try {
//         const user = await User.findOne({ email: req.body.email }).exec();
//         if (user) {
//           // USER FOUND : Compare passwords
//           let passwordIsValid = bcrypt.compareSync(
//             req.body.password,
//             user.password
//           );
//           if (!passwordIsValid) {
//             return res.json({ message: 'Invalid Password' }).status(401);
//           } else {
//             // TODO: Login User - PASSPORT
//           }
//         } else {
//           // user email not found
//           return res.json({ message: 'User email not found.' }).status(401);
//         }
//       } catch (err) {
//         console.log(err);
//         return res.json(err);
//       }
//     }
//   },
// ];
