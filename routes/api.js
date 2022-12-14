var express = require('express');
var router = express.Router();

// Controllers
const user_controller = require('../controllers/userController');
const auth_controller = require('../controllers/authController');
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');

// TODO: Verify Token Middleware

// Routes
/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({ message: 'API homepage' });
});

/* post controller routes */
router.get('/posts', post_controller.posts_list);
router.get('/posts/:postid', post_controller.post_detail);

router.post('/posts', post_controller.post_create);

router.put('/posts/:postid', post_controller.post_update);

router.delete('/posts/:postid', post_controller.post_delete);

/* comment controller routes */
router.get('/posts/:postid/comments', comment_controller.comment_list);
router.get(
  '/posts/:postid/comments/:commentid',
  comment_controller.comment_detail
);

router.post('/posts/:postid/comments', comment_controller.comment_create);

router.put(
  '/posts/:postid/comments/:commentid',
  comment_controller.comment_update
);

router.delete(
  '/posts/:postid/comments/:commentid',
  comment_controller.comment_delete
);

/* user controller routes */
router.get('/users', user_controller.user_list);
router.get('/users/:userid', user_controller.user_detail);
router.get('/users/:userid/posts', user_controller.user_posts);
router.get('/users/:userid/comments', user_controller.user_comments);
router.get('/users/:userid/friends', user_controller.user_friends);
router.get('/users/:userid/requests', user_controller.user_requests);

/* auth controller routes */
router.post('/login', auth_controller.post_login);

router.post('/signup', auth_controller.post_signup);

module.exports = router;
