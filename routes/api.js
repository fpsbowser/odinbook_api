var express = require('express');
var router = express.Router();

// Controllers
const user_controller = require('../controllers/userController');
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

module.exports = router;
