const userController = require('../controllers/userControllers')
const tweetController = require('../controllers/tweetControllers')
const helpers = require('../_helpers');
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }

  app.get('/', authenticated, (req, res) => res.redirect('tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweets)
  app.get('/tweets/:tweet_id/replies', authenticated, tweetController.getReply)
  app.post('/tweets/:tweet_id/replies', authenticated, tweetController.postReply)

  //app.delete('/tweets/:id', authenticatedAdmin, commentController.deleteComment)

  app.post('/following/:userId', authenticated, userController.addFollowing)
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  app.post('/tweets/:id/like', authenticated, userController.addLike)
  app.post('/tweets/:id/unlike', authenticated, userController.removeLike)

  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)



  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

}