const express = require('express')
const helpers = require('./_helpers');
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')




const db = require('./models') // 引入資料庫
const bodyParser = require('body-parser') // for http POST, req.body 


const app = express()
const port = 3000

// use helpers.getUser(req) to replace req.user
// use helpers.ensureAuthenticated(req) to replace req.isAuthenticated()

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


// 把 req.flash 放到 res.locals 裡面(這樣就不用每一個 controller 都要設定 flash messages)
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = req.user
  next()
})


app.engine('handlebars', handlebars({
  defaultLayout: 'main',
  helpers: require('./config/handlebars-helpers')
})) //handlebars v3.1.0 優化中已直接帶入，故可不寫

app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))// for http POST, req.body //app.use: 所有的請求都會先被 bodyParser 進行處理


app.listen(port, () => {
  // console.log("example app listen on port:" + port)
  db.sequelize.sync() // 跟資料庫同步
  console.log(`Example app listen on port: ${port}`)
})

// module.exports = app


// 引入 routes 並將 app 傳進去，讓 routes 可以用 app 這個物件來指定路由
require('./routes')(app, passport) //需要放在 app.js 的最後一行 // 把 passport 傳入 routes


