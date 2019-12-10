const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const helpers = require('../_helpers');
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Followship = db.Followship
const Reply = db.Reply
require('dotenv').config()
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  addFollowing: (req, res) => {
    if (helpers.getUser(req).id == req.params.userId) {
      return Followship.create({})
        .then((followship) => {
          return res.redirect(200, 'back')
        })
    }
    else {
      return Followship.create({
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      })
        .then((followship) => {
          return res.redirect('back')
        })
    }
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: helpers.getUser(req).id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {

      include: [
        Tweet,
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Tweet, as: 'LikedTweets' }
      ]
    }).then(user => {
      const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
      user.introduction = user.introduction ? user.introduction.substring(0, 140) : "",

        Tweet.findAll({
          where: { UserId: req.params.id },
          order: [['createdAt', 'DESC']],
          include: [Like, Reply, User]
        }).then(tweets => {
          tweets = tweets.map(tweet => ({
            ...tweet.dataValues,
            description: tweet.dataValues.description.substring(0, 140),
            isLiked: user.LikedTweets.map(d => d.id).includes(tweet.id)
          }))

          return res.render('users/profile', {
            profile: user,
            isFollowed: isFollowed,
            tweets: tweets
          })
        })

    })
  },
  editUser: (req, res) => {
    if (parseInt(req.params.id) !== helpers.getUser(req).id) {
      req.flash('error_messages', '非使用者！')
      return res.redirect('/')
    }
    else {
      return User.findByPk(req.params.id).then(user => {
        return res.render('users/edit', { user: user })
      })
    }
  },
  putUser: (req, res) => {
    if (Number(req.params.id) !== Number(helpers.getUser(req).id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: img.data.link
            }).then((user) => {
              res.redirect(`/users/${req.params.id}/tweets`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
          }).then((user) => {
            res.redirect(`/users/${req.params.id}/tweets`)
          })
        })
    }
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.id
    })
      .then((tweet) => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    })
      .then((Like) => {
        Like.destroy()
          .then((tweet) => {
            return res.redirect('back')
          })
      })
  },
}

module.exports = userController
