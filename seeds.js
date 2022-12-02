require('dotenv').config();
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

let i = 0;

function createRandomUser() {
  return {
    _id: faker.database.mongodbObjectId(),
    name: {
      first: faker.name.firstName(),
      last: faker.name.lastName(),
    },
    dob: faker.date.birthdate(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    friends: [],
    requests: [],
    posts: [],
  };
}

function createRandomPost() {
  return {
    _id: faker.database.mongodbObjectId(),
    post: faker.lorem.paragraph(10),
    owner: null,
    comments: [],
    likes: [],
    timestamp: new Date(),
  };
}

function populateUserCollection(amount) {
  while (i < amount) {
    let newUser = createRandomUser();
    let testUser = new User(newUser);
    testUser.save(function (err) {
      if (err) {
        console.log(err);
      }
      console.log(`Created new user: ${testUser}`);
    });
    i += 1;
  }
}

async function populatePostCollection(amount, id) {
  let owner = await User.findOne({});
  let liker = await User.findOne({});
  while (i < amount) {
    let newPost = createRandomPost();
    newPost.owner = owner._id;
    newPost.likes.push(liker._id);
    let testPost = new Post(newPost);
    testPost.save(function (err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Created new post: ${testPost}`);
      owner.posts.push(testPost);
      owner.save((err) => {
        if (err) {
          console.log(`USER ERR: ${err}`);
          return;
        } else {
          console.log('Updated User Posts Array');
        }
      });
    });
    i += 1;
  }
}

populatePostCollection(1);
// populateUserCollection(1);

exports.populateUserCollection = populateUserCollection;
exports.populatePostCollection = populatePostCollection;
