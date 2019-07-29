'use strict'

const autocannon = require('autocannon')

// async/await
function startBench () {
  const url = 'http://localhost:3000'

  autocannon({
    url: url,
    connections: 3,
    duration: 10,
    requests: [
      {
        method: 'POST',
        path: '/su/gen',
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          userURL: 'http://www.1.com/[<id>]'
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

startBench();

const instance = autocannon({
  url: 'http://localhost:3000'
}, console.log)

process.once('SIGINT', () => {
  instance.stop()
})
autocannon.track(instance, {renderProgressBar: false})
