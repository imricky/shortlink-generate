var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var session = require('express-session')
var redisStore = require('connect-redis')(session)


var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var shorturlRouter = require('./routes/shorturl')
var jumpurlRouter = require('./routes/jumpurl')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser('yog'))
app.use(session({
  //name: 'session_id', // 这里是cookie的name，默认是connect.sid
  secret: 'yog', // 建议使用 128 个字符的随机字符串
  resave: true,
  saveUninitialized: false,
  cookie: {
    // 'signed': true,
    'maxAge': 1000 * 600,
    'httpOnly': false,
    //'username':'default'
  },
  store: new redisStore({
    host: '127.0.0.1',
    port: '6379',
    db: 0,
    pass: '',
  })
}))
app.use(express.static(path.join(__dirname, 'public')))


app.set('views', path.join(__dirname, 'views'))
app.engine('.html', require('ejs').__express)
app.set('view engine', 'html')


//鉴权中间件
let auth = (req, res, next) => {
  let authArr = ['/myshortlink', '/users']
  if (authArr.indexOf(req.path) > -1 || req.path.indexOf('/users') > -1) {
    let cookieSessionId = req.signedCookies['connect.sid']
    let sessionId = req.session.id
    if (cookieSessionId === void 0 || sessionId === void 0 || cookieSessionId !== sessionId) {
      res.clearCookie('user', {
        'maxAge': 1000 * 600, // 有效时长(毫秒)
        'signed': false // 默认为false，表示是否签名(Boolean)
      })
      req.session.destroy() // 清空所有session
      res.redirect('/login')
    } else {
      next()
    }
    // let cookieUser = req.cookies.user
    // let sessionUser = req.session.user
  } else {
    next()
  }

}

app.use(auth)


app.use('/', indexRouter)
app.use('/s', jumpurlRouter)
app.use('/users', usersRouter)
app.use('/su', shorturlRouter)

app.get('*', (req, res) => {
  res.render('404', {
    title: '404 Not Found',
  })
})

app.use((err,req,res,next)=>{
  console.error(err.stack)
  res.status(500).send('Something broke')
})

module.exports = app
