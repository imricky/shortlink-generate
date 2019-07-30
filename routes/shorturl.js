const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const query = require('../util/dbhelper')
const redis = require("redis"),
  client = redis.createClient();

const { promisify } = require('util');
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);


const SHORT_LINK_PREFIX = 'expressShortlink';
const EXPIRE_TIME = 60 * 60 * 24 * 365; //过期时间存成1年

router.get('/', (req, res, next) => {
  res.send('接口get成功了')
})

router.post('/gen', async (req, res, next) => {
  let userURL = req.body.userURL;
  //后端也先校验url
  if(!checkURL(userURL)){
    return res.json({
      code: 500,
      message: '非法链接',
      short_link: null,
      long_link: userURL
    });
  }
  let shortLinkInDatabase = await isExistShortlink(userURL);
  //如果数据库里已经有长网址了，直接返回短网址结果
  if (shortLinkInDatabase !== null) {
    return res.json({
      code: 204,
      message: '短链接已存在',
      short_link: shortLinkInDatabase,
      long_link: userURL
    });
  }
  //生成短链接
  let maxPhid = await GetMaxPhid();
  let short_link = await string10to62(maxPhid);
  let user = req.session.user || 0; //没有就是0
  let params = {
    long_link: userURL,
    short_link: short_link,
    user:user
  }
  //插入数据库
  let {success,short_linkInDB} = await storeShortLink(params);
  if (!success) {
    return res.json({
      code: 500,
      success: false,
      message: '数据库插入错误',
    })
  }
  res.json({
    code: 200,
    message: '成功',
    short_link: short_linkInDB,
    long_link: userURL
  })
})



//10进制转62进制
//3843 对应61*62^0+61*62^1    3844对应100
async function string10to62(number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charsArr = chars.split('');
  const radix = chars.length;
  let qutient = +number;
  let arr = [];
  do {
    let mod = qutient % radix;
    qutient = (qutient - mod) / radix;
    arr.unshift(charsArr[mod]);
  } while (qutient);
  return arr.join('');
}

function checkURL(url) {
  //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
  //下面的代码中应用了转义字符"\"输出一个字符"/"
  var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  var objExp = new RegExp(Expression);
  if (objExp.test(url) == true) {
    return true;
  } else {
    return false;
  }
}

//获取最大phid
async function GetMaxPhid() {
  let sql = 'select max(phid) as phid from fg_shortlink'
  let maxPhid = await query(sql);
  let final = maxPhid[0].phid + 1;
  return final
}

//查找数据库是否存在对应的短网址是否存在。
async function isExistShortlink(long_link) {
  let sql = 'select * from fg_shortlink where long_link = ?'
  let result = await query(sql, [long_link]);
  if (result.length === 0) {
    return null;
  } else {
    return result[0].short_link
  }
}


//存短链接
async function storeShortLink(params) {
  let { long_link, short_link,user } = params;
  let success = false; //判断是否成功
  let post = {
    long_link: long_link,
    short_link: short_link,
    type: 1, //1 表示系统生成，2表示用户自定义
    inserted_at: new Date().valueOf(),
    updated_at: new Date().valueOf(),
    userPhid:user
  };
  //存MySQL：
  try {
    //存的时候先去取，防止高并发的时候重复存
    let existMySQL = await query('select * from fg_shortlink where long_link = ?',[long_link]);
    if(existMySQL.length != 0){
      return {
        success:true,
        short_linkInDB:existMySQL[0].short_link
      }
    }
    let resultMySQL = await query('INSERT INTO fg_shortlink SET ?', post);
    if (resultMySQL.affectedRows === 1) {
      success = true;
    }
  } catch (e) {
    console.log(e);
    return {
      success:true,
      short_linkInDB:short_link
    }
  }
  //存redis
  if (success === true) {
    let resultRedis = await setAsync(`${SHORT_LINK_PREFIX}##${short_link}`, long_link, 'EX', EXPIRE_TIME)
    success = resultRedis === "OK"
  }
  return {
    success:true,
    short_linkInDB:short_link
  }
}
module.exports = router
