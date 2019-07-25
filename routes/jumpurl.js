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

router.get('/:short_link', async (req, res, next) => {
  let short_link = req.params.short_link;
  //先去redis里查
  let resRedis = await getAsync(`${SHORT_LINK_PREFIX}##${short_link}`);
  if (resRedis !== null) {
    res.redirect(resRedis);
    return;
  }
  //redis里没找到就去找MySQL
  let resMySQL = await query('select long_link from fg_shortlink where short_link = ?', [short_link]);
  if (resMySQL && resMySQL.length > 0) {
    const long_link = resMySQL[0].long_link;
    //同步redis
    await setAsync(`${SHORT_LINK_PREFIX}##${short_link}`, long_link, 'EX', EXPIRE_TIME);
    res.redirect(long_link);
    return;
  }
  //都找不到404
  res.redirect('../404');

})

module.exports = router