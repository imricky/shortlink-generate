var express = require('express')
var router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.user === 'ricky') {
    res.send("欢迎再一次访问。ricky")
    console.log(req.session)
  } else {
    res.send("欢迎第一次访问。")
  }

  // res.send('<p>你好'+req.session.username+',欢迎你</p>')
})

router.get('/:phid', async (req, res, next) => {
  const phid = req.params.phid
  res.render('personInfo', {phid: phid})
})

module.exports = router
