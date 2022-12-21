const User = require('./models/user');
const async = require('async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const app = require('./app');
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const jwtStrategy = require('passport-jwt').Strategy;
const extractJWT = require('passport-jwt').ExtractJwt;

// PASSPORT LOCAL STRATEGEY
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    (email, password, done) => {
      // Search for user
      console.log('PASSPORT LOCAL MIDDLEWARE RUN');
      User.findOne({ email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'User email not found!' });
        }
        let passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          return done(null, false, { message: 'Incorrect password' });
        }
        return done(null, user);
      });
    }
  )
);

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

passport.use(
  new jwtStrategy(opts, (jwt_payload, done) => {
    console.log(jwt_payload);
    User.findById(jwt_payload.id, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

// // handle logout
// exports.logout = (req, res) => {
//   res.clearCookie('jwt');
//   return res.json({ message: 'Successfully logged out.' });
// };

// // protect routes
exports.isAuthenticated = passport.authenticate('jwt', { session: false });
exports.loginAuth = passport.authenticate(
  'local',
  { session: false, failureRedirect: '/login' },
  (err, user) => {
    if (err || !user) {
      return res.json({ message: 'Something is not right', user }).status(400);
    }
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
              token: `Bearer ${token}`,
            },
          });
        }
      );
    });
  }
);
