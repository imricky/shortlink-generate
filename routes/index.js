var express = require('express')
var router = express.Router()

const mysql = require('mysql')
const query = require('../util/dbhelper')
const redis = require("redis"),
    client = redis.createClient();

const { promisify } = require('util');
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);


const crypto = require('crypto');
crypto.DEFAULT_ENCODING = 'hex';

const pbkdf2Async = promisify(crypto.pbkdf2).bind(crypto);
pbkdf2Async('secret', 'qwertyu', 100000, 512, 'sha512', (err, derivedKey) => {
  if (err) throw err;
  console.log(derivedKey);  // '3745e48...aa39b34'
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'})
})

router.get('/login', function (req, res, next) {
  if(req.session.user){
    res.redirect('/');
    return;
  }
  res.render('login', {title: 'Express'})
})

router.get('/register', function (req, res, next) {
  res.render('register', {title: 'Express'})
})

router.get('/myshortlink', function (req, res, next) {
  res.render('myshortlink', {title: 'Express'})
})



//接口
router.post('/login', async (req, res, next) => {
  let {user, password} = req.body;
  let sql = await query('select * from fg_user where user = ?',[user]);
  if(sql.length === 0){
    return res.json({
      success:false,
      code:500,
      errorMsg:'用户名不存在',
    })
  }
  let userInDB = sql[0].user;
  let passwordInDB = sql[0].password;
  let phid = sql[0].phid;
  //加盐做对比
  let cryptoPassword = await pbkdf2Async(password, 'qwertyu', 100000, 512, 'sha512');
  if(cryptoPassword !== passwordInDB){
    return res.json({
      success:false,
      code:500,
      errorMsg:'密码错误',
    })
  }
  //存入session信息
  req.session.user  = phid
  res.json({
    success:true,
    code:200,
    errorMsg:'',
  })

})

router.post('/register', async (req, res, next) => {
  let {user, password} = req.body;
  try {
    let sqlUserExist = await query('select * from fg_user where user = ?', [user]);
    if(sqlUserExist.length !== 0){
      return res.json({
        success:false,
        code:500,
        errorMsg:'用户名重复，亲再重新选一个吧~',
      })
    }

    let cryptoPassword = await pbkdf2Async(password, 'qwertyu', 100000, 512, 'sha512');
    let post = {
      user:user,
      password:cryptoPassword
    };
    let sql = await query('INSERT INTO fg_user SET ?', post);
    if (sql.affectedRows === 1) {
      return res.json({
        success:true,
        code:200,
        errorMsg:'',
        user:user
      })
    }else {
      return res.json({
        success:false,
        code:500,
        errorMsg:'保存失败，原因是数据库插入错误',
      })
    }
  }catch (e) {
    res.json({
      success:false,
      code:500,
      errorMsg:e,
    })
  }


})





module.exports = router
