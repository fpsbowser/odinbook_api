const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const async = require('async');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.user_list = (req, res, next) => {
  // Query all users
  User.find({}, 'name dob _id  posts', (err, users) => {
    if (err) {
      return res.json(err).status(500);
    }
    res.json(users);
  });
};

exports.user_detail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userid, 'name dob posts')
      .populate('posts')
      .exec();
    if (user) {
      return res.json(user);
    } else {
      // User not found
      return res
        .json({
          message: `Cannot find user with id: ${req.params.userid}`,
          err,
        })
        .status(404);
    }
  } catch (error) {
    return res.json({ error }).status(500);
  }
};

exports.user_posts = async (req, res, next) => {
  try {
    const posts = await Post.find({ owner: req.params.userid })
      .populate('likes', 'name')
      .populate('comments', 'comment likes')
      .exec();
    if (posts) {
      posts.length > 0
        ? res.json(posts)
        : res.json({ message: 'User has no posts' }).status(404);
    }
  } catch (error) {
    return res
      .json({
        message: `Error looking up posts with owner id of: ${req.params.userid}. Please make sure id is correct`,
        error,
      })
      .status(500);
  }
};

exports.user_comments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ owner: req.params.userid })
      .populate('likes', 'name')
      .exec();
    if (comments) {
      comments.length > 0
        ? res.json(comments)
        : res.json({ message: 'User has no comments' }).status(404);
    }
  } catch (error) {
    return res
      .json({
        message: `Error looking up comments with owner id of: ${req.params.userid}. Please make sure id is correct`,
        error,
      })
      .status(500);
  }
};

exports.user_friends = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userid, 'friends')
      .populate('friends', 'name')
      .exec();
    if (user) {
      return res.json(user);
    } else {
      // User not found
      return res
        .json({
          message: `Cannot find user with id: ${req.params.userid}`,
          err,
        })
        .status(404);
    }
  } catch (error) {
    return res.json({ error }).status(500);
  }
};

exports.user_requests = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userid, 'friend_requests')
      .populate('friend_requests', 'name')
      .exec();
    if (user) {
      return res.json(user);
    } else {
      // User not found
      return res
        .json({
          message: `Cannot find user with id: ${req.params.userid}`,
          err,
        })
        .status(404);
    }
  } catch (error) {
    return res.json({ error }).status(500);
  }
};
