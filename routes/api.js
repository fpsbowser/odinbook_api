var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('../passport');

// Controllers
const user_controller = require('../controllers/userController');
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');
const { isAuthenticated } = require('../passport');

// Routes
/* GET home page. */
router.get('/', function (req, res) {
  res.json({
    message:
      'Welcome to the API for OdinBook! You must login or sign-up before using the API.',
  });
});

/* post controller routes */
router.get('/posts', isAuthenticated, post_controller.posts_list);
router.get('/posts/:postid', isAuthenticated, post_controller.post_detail);

router.post('/posts', isAuthenticated, post_controller.post_create);

router.put('/posts/:postid', isAuthenticated, post_controller.post_update);

router.delete('/posts/:postid', isAuthenticated, post_controller.post_delete);

/* comment controller routes */
router.get(
  '/posts/:postid/comments',
  isAuthenticated,
  comment_controller.comment_list
);
router.get(
  '/posts/:postid/comments/:commentid',
  isAuthenticated,
  comment_controller.comment_detail
);

router.post(
  '/posts/:postid/comments',
  isAuthenticated,
  comment_controller.comment_create
);

router.put(
  '/posts/:postid/comments/:commentid',
  isAuthenticated,
  comment_controller.comment_update
);

router.delete(
  '/posts/:postid/comments/:commentid',
  isAuthenticated,
  comment_controller.comment_delete
);

/* user controller routes */
router.get('/users', isAuthenticated, user_controller.user_list);
router.get('/users/:userid', isAuthenticated, user_controller.user_detail);
router.get('/users/:userid/posts', isAuthenticated, user_controller.user_posts);
router.get(
  '/users/:userid/comments',
  isAuthenticated,
  user_controller.user_comments
);
router.get(
  '/users/:userid/friends',
  isAuthenticated,
  user_controller.user_friends
);
router.get(
  '/users/:userid/requests',
  isAuthenticated,
  user_controller.user_requests
);

/* auth controller routes */
// router.post('/login', auth_controller.post_login);
router.post('/login', function (req, res, next) {
  passport.authenticate(
    'local',
    { session: false, failureRedirect: '/login' },
    (err, user) => {
      if (err || !user) {
        return res
          .json({ message: 'Something is not right', user })
          .status(400);
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
  )(req, res);
});

router.post('/signup', auth_controller.post_signup);

module.exports = router;
