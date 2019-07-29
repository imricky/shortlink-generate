'use strict'

const autocannon = require('autocannon')

// async/await
function startBench () {
  const url = 'http://localhost:3000'

  autocannon({
    url: url,
    connections: 1,//并发连接数
    duration: 1,// 运行该模拟程序的持续时间
    pipelining: 2,// 每次连接的请求数量
    requests: [
      {
        method: 'POST',
        path: '/su/gen',
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          userURL: 'http://www.2.com/[<id>]'
          //email: 'new-[<id>]@user.com' // [<id>] will be replaced with generated HyperID at run time
        })
      }
    ],
    idReplacement: true
  }, finishedBench)

  function finishedBench (err, res) {
    console.log('finished bench', err, res)
  }
}

//startBench();

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 100,//并发连接数
  duration: 10,// 运行该模拟程序的持续时间
  pipelining: 3,// 每次连接的请求数量
}, console.log)

process.once('SIGINT', () => {
  instance.stop()
})
autocannon.track(instance, {renderProgressBar: false})


// -c/--connections NUM 并发连接的数量，默认10
// -p/--pipelining NUM 每个连接的流水线请求请求数。默认1
// -d/--duration SEC 执行的时间，单位秒
// -m/--method METHOD 请求类型 默认GET
// -b/--body BODY 请求报文体


// https://github.com/mcollina/autocannon#api
//mysql 重置自增id
// alter table tableName auto_increment=100
