const express = require('express');
const router = express.Router();
const mysql = require('mysql')
const query = require('../util/dbhelper')

router.post('/', async (req, res, next) => {
  let userURL = req.body.userURL;
  let returnObj = {
    code:200,
    success:true,
    message:'成功',
    gen_link:null
  }
  let genLinkInDatabase = await isExistShortlink(userURL);
  if (genLinkInDatabase !== "") {
    returnObj.gen_link = genLinkInDatabase;
    res.json(returnObj);
  } else {
    let maxPhid = await GetMaxPhid();
    let gen_link = string10to62(maxPhid);
    let inserted = await InsertGenlink(userURL,gen_link);
    if(inserted.affectedRows === 0){
      res.json({
        code: 500,
        success: false,
        message:'数据库插入错误',
        gen_link: null
      })
    }else{
      returnObj.gen_link = gen_link;
      res.json(returnObj);
    }

  }
})

router.get('/', (req, res, next) => {
  res.send('接口get成功了')
})

//10进制转62进制
//3843 对应61*62^0+61*62^1    3844对应100
function string10to62(number) {
  const chars = '0123456789abcdefghigklmnopqrstuvwxyzABCDEFGHIGKLMNOPQRSTUVWXYZ';
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

//获取最大phid
async function GetMaxPhid() {
  let sql = 'select max(phid) as phid from fg_shortlink'
  let maxPhid = await query(sql);
  let final = maxPhid[0].phid + 1;
  return final
}

//查找数据库是否存在对应的短网址是否存在
async function isExistShortlink(user_link) {
  let sql = 'select * from fg_shortlink where user_link = ?'
  let result = await query(sql, [user_link]);
  if (result.length === 0) {
    return '';
  } else {
    return result[0].gen_link
  }
}

//将短链接写到数据库里
async function InsertGenlink(user_link, gen_link) {

  let post = { user_link: user_link, gen_link: gen_link };
  let result = await query('INSERT INTO fg_shortlink SET ?', post);
  return {
    affectedRows: result.affectedRows,
    insertId: result.insertId
  }
}


module.exports = router