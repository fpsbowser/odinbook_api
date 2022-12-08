const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.posts_list = function (req, res, next) {
  // fetch all posts
  Post.find({}).exec((err, list_posts) => {
    if (err) {
      return next(err);
    }
    console.log(`Amount of posts: ${list_posts.length}`);
    res.json(list_posts);
  });
};

exports.post_detail = function (req, res, next) {
  // find specific post
  Post.findById(req.params.postid, function (err, post) {
    if (err) {
      return next(err);
    }
    console.log(`POST ID: ${req.params.postid}`);
    res.json(post);
  });
};

exports.post_create = [
  body('post', 'Your post can not be empty!').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors).status(400);
    } else {
      const post = new Post({
        post: req.body.post,
        // TODO:  CHANGE FOR AUTHENTICATION
        owner: '009f37bb36efc8d1aea0b5db',
        comments: [],
        likes: [],
        timestamp: new Date(),
        edited_timestamp: null,
      });

      post.save((err) => {
        if (err) {
          next(err);
        } else {
          res.json({ message: 'Success', post });
          // TODO: push post to owners posts array
        }
      });
    }
  },
];

exports.post_update = [
  body('post', 'Your post can not be empty!').trim().isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const originalPost = await Post.findById(req.params.postid).exec();
    if (!errors.isEmpty()) {
      res.json(errors).status(400);
    } else {
      // create updated post document
      const post = new Post({
        _id: req.params.postid,
        post: req.body.post,
        owner: originalPost.owner,
        comments: originalPost.comments,
        likes: originalPost.likes,
        timestamps: originalPost.timestamp,
        edited_timestamp: new Date(),
      });

      // find and update existing post
      Post.findByIdAndUpdate(
        req.params.postid,
        post,
        { returnDocument: 'after' },
        (err, updatedPost) => {
          if (err) {
            return next(err);
          }
          res.json({ message: 'Success', updatedPost });
        }
      );
    }
  },
];

exports.post_delete = async (req, res, next) => {
  // check to see if post has comments
  const post = await Post.findById(req.params.postid);
  if (post.comments.length > 0) {
    // post has comments
    const totalComments = post.comments.length;
    console.log('Post has comments!');
    post.comments.forEach((comment) => {
      Comment.findByIdAndRemove(comment._id, (err, removedComment) => {
        if (err) {
          return next(err);
        } else {
          console.log(`REMOVED: ${removedComment}`);
          console.log(`removed ${totalComments} comments`);
        }
      });
    });
  }
  // find post owner and remove post from owners post array
  User.findByIdAndUpdate(
    post.owner._id,
    {
      $pull: { posts: { $in: [post._id] } },
    },
    (err, removedPost) => {
      if (err) {
        console.log(`ERROR UPDATING USER POST ARRAY`);
        return next(err);
      } else {
        console.log(`Updated user: ${post.owner._id} - Pulled: ${removedPost}`);
      }
    }
  );
  // delete post after comments are deleted
  Post.findByIdAndRemove(req.params.postid, (err, removedPost) => {
    if (err) {
      return next(err);
    }
    res.json({ message: 'Successfully removed post', removedPost }).status(200);
  });
};
