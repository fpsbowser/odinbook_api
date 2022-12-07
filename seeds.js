require('dotenv').config();
const async = require('async');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
db.on('open', (err) => {
  err ? console.log(err) : console.log('connected');
});

let users = [];
let posts = [];
let comments = [];

function updateUser(userid, postid) {
  users[userid].posts.push(postid);
}

function userCreate(
  _id,
  name,
  dob,
  email,
  password,
  friends,
  friend_requests,
  posts,
  cb
) {
  userDetail = {
    _id,
    name,
    dob,
    email,
    password,
    friends,
    friend_requests,
    posts,
  };
  let user = new User(userDetail);

  user.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New User: ${user}`);
    users.push(user);
    cb(null, user);
  });
}

function postCreate(_id, post, owner, comments, likes, timestamp, cb) {
  postDetail = {
    _id,
    post,
    owner,
    comments,
    likes,
    timestamp,
  };
  let newPost = new Post(postDetail);

  if (users.find((e) => e._id === owner._id)) {
    console.log(`UPDATED OWNER WITH POST: ${newPost}`);
    // e.posts.push(newPost);
    // update database
    User.findByIdAndUpdate(
      owner._id,
      { $push: { posts: newPost } },
      { upsert: true, new: true },
      function (err) {
        if (err) console.log(err);
      }
    );
  }

  newPost.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Post: ${newPost}`);
    posts.push(newPost);
    cb(null, newPost);
  });
}

function commentCreate(_id, comment, owner, likes, timestamp, cb) {
  commentDetail = {
    _id,
    comment,
    owner,
    likes,
    timestamp,
  };
  let newComment = new Comment(commentDetail);

  newComment.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Comment: ${newComment}`);
    comments.push(newComment);
    cb(null, newComment);
  });
}

function createUsers(cb) {
  async.series(
    [
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(), // id
          // name object
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(), // dob
          faker.internet.email(), // email
          faker.internet.password(), // password
          [], // friends
          [], // friend_requests
          [], // posts
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(),
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(),
          faker.internet.email(),
          faker.internet.password(),
          [],
          [users[0]],
          [],
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(),
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(),
          faker.internet.email(),
          faker.internet.password(),
          [users[1]],
          [users[0]],
          [],
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(), // id
          // name object
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(), // dob
          faker.internet.email(), // email
          faker.internet.password(), // password
          [users[0], users[1]], // friends
          [users[2]], // friend_requests
          [], // posts
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(), // id
          // name object
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(), // dob
          faker.internet.email(), // email
          faker.internet.password(), // password
          [], // friends
          [users[0]], // friend_requests
          [], // posts
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(), // id
          // name object
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(), // dob
          faker.internet.email(), // email
          faker.internet.password(), // password
          [users[0]], // friends
          [users[1], users[2], users[3]], // friend_requests
          [], // posts
          callback
        );
      },
      function (callback) {
        userCreate(
          faker.database.mongodbObjectId(), // id
          // name object
          {
            first: faker.name.firstName(),
            last: faker.name.lastName(),
          },
          faker.date.birthdate(), // dob
          faker.internet.email(), // email
          faker.internet.password(), // password
          [users[4], users[5]], // friends
          [users[1], users[3]], // friend_requests
          [], // posts
          callback
        );
      },
    ],
    cb
  );
}

function createComments(cb) {
  async.series(
    [
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.sentence(4), // comment
          users[4], // owner
          [], // likes
          faker.date.recent(), // timestamp
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(6),
          users[1],
          [],
          faker.date.recent(),
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(3),
          users[1],
          [users[2]],
          faker.date.recent(),
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(3),
          users[3],
          [users[1], users[4]],
          faker.date.recent(),
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(7),
          users[0],
          [users[1], users[2], users[3], users[4]],
          faker.date.recent(),
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(1),
          users[2],
          [users[5]],
          faker.date.recent(),
          callback
        );
      },
      function (callback) {
        commentCreate(
          faker.database.mongodbObjectId(),
          faker.lorem.sentence(3),
          users[5],
          [users[2], users[1]],
          faker.date.recent(),
          callback
        );
      },
    ],
    cb
  );
}

function createPosts(cb) {
  async.series(
    [
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[0], // owner
          [comments[2], comments[1]], // comments
          [users[1], users[3], users[4]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[0], // owner
          [comments[0], comments[4]], // comments
          [users[4]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[1], // owner
          [comments[3], comments[6]], // comments
          [users[4], users[5]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[2], // owner
          [comments[5]], // comments
          [users[6]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[3], // owner
          [comments[0], comments[1], comments[4], comments[5]], // comments
          [users[0], users[1], users[5]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[4], // owner
          [], // comments
          [], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
      function (callback) {
        postCreate(
          faker.database.mongodbObjectId(), // id
          faker.lorem.paragraph(), // post
          users[5], // owner
          [comments[0], comments[1], comments[2], comments[3], comments[4]], // comments
          [users[0], users[1], users[2], users[3], users[4], users[6]], // likes
          faker.date.recent(2), // timestamp
          callback
        );
      },
    ],
    cb
  );
}

async.series(
  [createUsers, createComments, createPosts],
  //optional cb
  function (err, results) {
    if (err) console.log(`FINAL ERROR: ${err}`);
    // disconnect from db
    console.log('Finished loading fake data to database!');
    mongoose.connection.close();
  }
);
