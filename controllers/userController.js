const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const async = require('async');
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
    const user = await User.findById(req.params.userid)
      .populate([
        {
          path: 'posts',
          populate: { path: 'owner', select: 'name' },
        },
        {
          path: 'friends',
          select: 'name',
          // populate: { path: 'name' },
        },
        {
          path: 'friend_requests',
          select: 'name',
          // populate: { path: 'name', select: 'name' },
        },
      ])
      .select('name dob email');
    res.json(user);
  } catch (err) {
    res
      .json({
        message: `Can't find user with id: ${req.params.userid}`,
        error: err,
      })
      .status(400);
    return next(err);
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

exports.user_requests_update = [
  body('user1', 'Must provide userid for user 1!').trim().isLength({ min: 1 }),
  body('user2', 'Must provide userid for user 2!').trim().isLength({ min: 1 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const user1 = await User.findById(req.body.user1).exec();
    if (!user1) {
      return res.status(404).json({ message: 'User 1 not found' });
    }
    const user2 = await User.findById(req.body.user2).exec();
    if (!user2) {
      return res.status(404).json({ message: 'User 2 not found' });
    }
    user1.friend_requests.includes(req.body.user2)
      ? user1.friend_requests.splice(
          user1.friend_requests.indexOf(req.body.user2),
          1
        )
      : (user1.friend_requests = [...user1.friend_requests, req.body.user2]);
    user2.friends.includes(req.body.user1)
      ? user2.friends.splice(user2.friends.indexOf(req.body.user1), 1)
      : (user2.friends = [...user2.friends, req.body.user1]);
    const updatedUser1 = await User.findByIdAndUpdate(req.body.user1, user1, {
      new: true,
    });
    if (!updatedUser1) {
      return res.status(404).json({ message: 'User 1 not found' });
    }
    const updatedUser2 = await User.findByIdAndUpdate(req.body.user2, user2, {
      new: true,
    });
    if (!updatedUser2) {
      return res.status(404).json({ message: 'User 2 not found' });
    }
    return res.status(200).json({
      message: 'Success',
      userOne: {
        [updatedUser1._id]: updatedUser1.friend_requests,
      },
      userTwo: {
        [updatedUser2._id]: updatedUser2.friends,
      },
    });
  },
];
