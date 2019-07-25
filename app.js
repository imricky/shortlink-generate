var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shorturlRouter = require('./routes/shorturl');
var jumpurlRouter = require('./routes/jumpurl');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views',path.join(__dirname , 'views') );
app.engine('.html', require('ejs').__express);  
app.set('view engine', 'html'); 

app.use('/', indexRouter);
app.use('/s', jumpurlRouter);
app.use('/users', usersRouter);
app.use('/su', shorturlRouter);

app.get('*', (req, res) => {   
  res.render('404', {  
      title: '404 Not Found',  
  });  
})  

module.exports = app;
