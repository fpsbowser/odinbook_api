const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const post = require('../models/post');

exports.comment_list = (req, res, next) => {
  // find post
  Post.findById(req.params.postid)
    .populate('comments')
    .exec(function (err, post) {
      if (err) {
        res
          .json({
            message: `Can't find post with id: ${req.params.postid}`,
            error: err,
          })
          .status(400);
        return next(err);
      }
      res.json(post.comments);
    });
};

exports.comment_detail = (req, res, next) => {
  // make sure post exists
  Post.findById(req.params.postid, (err, post) => {
    if (err) {
      res
        .json({
          message: `Can't find post with id: ${req.params.postid}`,
          error: err,
        })
        .status(400);
    } else {
      Comment.findById(req.params.commentid, (err, comment) => {
        if (err) {
          res
            .json({
              message: `Can't find comment with id: ${req.params.commentid}`,
              error: err,
            })
            .status(400);
          return next(err);
        }
        res.json(comment);
      });
    }
  });
};

exports.comment_create = [
  body('comment', 'Must provide a comment').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors).status(400);
    } else {
      // make sure post exists
      Post.findById(req.params.postid, (err, post) => {
        if (err) {
          res.json({
            message: `Can't find post with id: ${req.params.postid}`,
            error: err,
          });
        } else {
          const comment = new Comment({
            comment: req.body.comment,
            // TODO: CHANGE FOR AUTHENTICATION - USE CURRENT LOGGED IN USER
            owner: '009f37bb36efc8d1aea0b5db',
            likes: [],
            timestamp: new Date(),
            edited_timestamp: null,
          });
          // add comment to post comment array
          Post.findByIdAndUpdate(
            post._id,
            { $push: { comments: comment } },
            { upsert: true, new: true },
            function (err) {
              if (err) {
                console.log(err);
                next(err);
              }
            }
          );
          // save comment
          comment.save((err) => {
            if (err) {
              next(err);
            } else {
              res.json({ message: 'Success', comment });
            }
          });
        }
      });
    }
  },
];

exports.comment_update = [
  body('comment', 'Must provide a comment').trim().isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    const originalComment = await Comment.findById(req.params.commentid).exec();
    if (!errors.isEmpty()) {
      res.json(errors).status(400);
    } else {
      // make sure post exists
      Post.findById(req.params.postid, (err, post) => {
        if (err) {
          res.json({
            message: `Can't find post with id: ${req.params.postid}`,
            error: err,
          });
        } else {
          // create updated comment document
          const comment = new Comment({
            _id: originalComment._id,
            comment: req.body.comment,
            owner: originalComment.owner,
            likes: originalComment.likes,
            timestamp: originalComment.timestamp,
            edited_timestamp: new Date(),
          });
          // find and update comment with updated comment document
          Comment.findByIdAndUpdate(
            req.params.commentid,
            comment,
            { returnDocument: 'after' },
            (err, updatedComment) => {
              if (err) {
                console.log('ERR' + err);
                return next(err);
              }
              res.json({ message: 'Success', updatedComment });
            }
          );
        }
      });
    }
  },
];

exports.comment_delete = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid);
    const comment = await Comment.findById(req.params.commentid);
    // remove comment from post array
    Post.findByIdAndUpdate(
      post._id,
      { $pull: { comments: comment._id } },
      function (err) {
        if (err) {
          return next(err);
        }
        console.log(`Removed from post array`);
        // remove comment from database
        Comment.findByIdAndRemove(comment._id, (err, removedComment) => {
          if (err) {
            return next(err);
          }
          // success
          res.json({ message: 'Success', removedComment });
        });
      }
    );
  } catch (err) {
    if (err) {
      console.log(err.message);
      if (err.message.includes('Comment')) {
        console.log('comment ERROR');
        res
          .json({
            message: `Can't find comment with id: ${req.params.commentid}`,
          })
          .status(400);
      } else if (err.message.includes('Post')) {
        console.log('post ERROR');
        res
          .json({ message: `Can't find post with id: ${req.params.postid}` })
          .status(400);
      } else {
        res.json(err).status(400);
      }
    }
  }
};
