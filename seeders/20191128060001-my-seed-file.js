'use strict';
const bcrypt = require('bcrypt-nodejs')
const faker = require('faker')

module.exports = {
  up: (queryInterface, _Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: "root",
      introduction: faker.lorem.text(),
      avatar: faker.image.imageUrl(),
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: "user1",
      introduction: faker.lorem.text(),
      avatar: faker.image.imageUrl(),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: "user2",
      introduction: faker.lorem.text(),
      avatar: faker.image.imageUrl(),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
    queryInterface.bulkInsert('Tweets',
      Array.from({ length: 50 }).map(_d =>
        ({
          UserId: Math.floor(Math.random() * 3) + 1,
          description: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});
    queryInterface.bulkInsert('Likes',
      Array.from({ length: 50 }).map(_d =>
        ({
          UserId: Math.floor(Math.random() * 3) + 1,
          TweetId: Math.floor(Math.random() * 50) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});
    return queryInterface.bulkInsert('Replies',
      Array.from({ length: 150 }).map(_d =>
        ({
          comment: faker.lorem.sentence(),
          UserId: Math.floor(Math.random() * 3) + 1,
          TweetId: Math.floor(Math.random() * 50) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {});



  },

  down: (queryInterface, _Sequelize) => {
    queryInterface.bulkDelete('Users', null, {})
    queryInterface.bulkDelete('Replies', null, {})
    return queryInterface.bulkDelete('Tweets', null, {})
  }
};