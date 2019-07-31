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
// app.use(session({
//   'resave': true,
//   'secret': 'yog',    // 签名，与上文中cookie设置的签名字符串一致
//   'cookie': {
//     'maxAge': 90000,
//     'user':'test'
//   },
//   'name': 'session_id' //  在浏览器中生成cookie的名称key，默认是connect.sid
// }));
// session
app.use(session({
  name: 'session_id', // 这里是cookie的name，默认是connect.sid
  secret: 'yog', // 建议使用 128 个字符的随机字符串
  resave: true,
  saveUninitialized: false,
  cookie: {
    'maxAge': 1000*600,
    'httpOnly':false,
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

app.use('/', indexRouter)
app.use('/s', jumpurlRouter)
app.use('/users', usersRouter)
app.use('/su', shorturlRouter)

app.get('*', (req, res) => {
  res.render('404', {
    title: '404 Not Found',
  })
})

module.exports = app
