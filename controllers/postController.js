const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');

exports.posts_list = function (req, res, next) {
  // fetch all posts
  Post.find({})
    .populate('owner')
    .exec((err, list_posts) => {
      if (err) {
        return next(err);
      }
      console.log(`Amount of posts: ${list_posts.length}`);
      res.json(list_posts);
    });
};

exports.post_detail = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postid)
      .populate({
        path: 'owner',
        select: 'name',
      })
      .populate({
        path: 'likes',
        select: 'name',
      })
      .exec();

    if (!post) {
      return res
        .status(404)
        .json({ message: `Cannot find post with id: ${req.params.postid}` });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.post_create = [
  body('post', 'Your post can not be empty!').trim().isLength({ min: 1 }),
  body('owner', 'Your post must provide an owner!').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors).status(400);
    } else {
      const post = new Post({
        post: req.body.post,
        owner: req.body.owner,
        comments: [],
        likes: [],
        timestamp: new Date(),
        edited_timestamp: null,
      });

      post.save((err) => {
        if (err) {
          next(err);
        } else {
          User.findByIdAndUpdate(
            req.body.owner,
            { $push: { posts: post } },
            { upsert: true, new: true },
            function (err) {
              if (err) {
                console.log(
                  `Error pushing post to user's post array. Error: ${err}`
                );
                next(err);
              } else {
                return res.json({ message: 'Success', post });
              }
            }
          );
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
      if (req.body.like !== null) {
        originalPost.likes.includes(req.body.like)
          ? originalPost.likes.splice(
              originalPost.likes.indexOf(req.body.like),
              1
            )
          : (originalPost.likes = [...originalPost.likes, req.body.like]);
        console.log(originalPost.likes);
      }
      // create updated post document
      const post = new Post({
        _id: originalPost._id,
        post: req.body.post ? req.body.post : originalPost.post,
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
  try {
    // check to see if post has comments
    const post = await Post.findById(req.params.postid);
    if (!post) throw new Error(`Can't find post with id: ${req.params.postid}`);

    if (post.comments.length > 0) {
      // post has comments
      const commentIds = post.comments.map((comment) => comment._id);
      await Comment.deleteMany({ _id: { $in: commentIds } });
    }

    // find post owner and remove post from owners post array
    const user = await User.findByIdAndUpdate(post.owner._id, {
      $pull: { posts: post._id },
    });

    // delete post after comments are deleted
    await Post.findByIdAndRemove(req.params.postid);

    res.json({ message: 'Successfully removed post' });
  } catch (error) {
    next(error);
  }
};
