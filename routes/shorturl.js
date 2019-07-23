var express = require('express');
var router = express.Router();
const mysql = require('mysql')
const query = require('../util/dbhelper')

router.post('/',async (req,res,next)=>{
  let userURL = req.body.userURL;
  let sql = 'select * from ?? ';
  let obj = {};
  let a = 'student';
  //会出现异步调用问题，await解决
  obj.data = await query(sql,'student');
  res.send(obj);
  
})

router.get('/',(req,res,next)=>{
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
  do{
      let mod = qutient % radix;
      qutient = (qutient - mod) / radix;
      arr.unshift(charsArr[mod]);
  }while(qutient);
  return arr.join('');
}



module.exports = router