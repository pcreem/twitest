const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Followship = db.Followship
const Reply = db.Reply

const tweetController = {

  getTweets: (req, res) => {
    return User.findAll({
      where: { id: { $not: req.user.id } },
      include: [
        { model: User, as: 'Followers' },
        //{ model: Tweet, as: 'LikedTweets' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        introduction: user.dataValues.introduction.substring(0, 140),
        FollowerCount: user.Followers.length,

      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount).splice(0, 10)

      Tweet.findAll({
        order: [['createdAt', 'DESC']],
        include: [Like, Reply, User]
      }).then(tweets => {
        tweets = tweets.map(tweet => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.substring(0, 140),
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id)
        }))

        return res.render('Tweets', {
          users: users,
          tweets: tweets
        })
      })
    })
  },

  postTweets: (req, res) => {
    return Tweet.create({
      description: req.body.text,
      UserId: req.user.id
    })
      .then((tweet) => {
        return res.redirect('Tweets')
      })
  },

  getReply: (req, res) => {
    return Tweet.findByPk(req.params.tweet_id, {
      include: [Like, Reply, User, { model: User, as: 'LikedUsers' },]
    }).then(tweet => {
      const isLiked = tweet.LikedUsers.map(d => d.id).includes(req.user.id)

      User.findByPk(tweet.UserId, {

        include: [
          Tweet,
          Like,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      }).then(user => {
        const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
        user.introduction = user.introduction.substring(0, 140)

        Reply.findAll({
          where: { TweetId: req.params.tweet_id },
          order: [['createdAt', 'DESC']],
          include: [User]
        }).then(replies => {

          replies = replies.map(reply => ({
            ...reply.dataValues,
            comment: reply.dataValues.comment.substring(0, 140),
          }))

          return res.render('replies', {
            replies: replies,
            tweet: tweet,
            profile: user,
            loginUser: req.user,
            isFollowed: isFollowed,
            isLiked: isLiked
          })
        })
      })
    })
  },

  postReply: (req, res) => {
    return Reply.create({
      comment: req.body.text,
      UserId: req.user.id,
      TweetId: req.params.tweet_id
    })
      .then((tweet) => {
        return res.redirect('replies')
      })
  },
}

module.exports = tweetController