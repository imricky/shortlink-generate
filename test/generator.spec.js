const chai = require('chai')
var expect = chai.expect;

const axios = require('axios');

const mysql = require('mysql')
const query = require('../util/dbhelper')
const redis = require("redis"),
  client = redis.createClient();


describe('网站正常启动', function () {
  it('主页不为空', function (done) {
    axios.get('http://localhost:3000')
    .then(function (response) {
      // handle success
      expect(response).not.to.be.null;
      done();
    }).catch(done);
  });
});

describe('非法网址报错', function () {
  it('网址为123', async () => {
    const result = await axios.post('http://localhost:3000/su/gen',{
      userURL: '123',
    });
    let data = result.data;
    expect(data.code).to.equal(500);
    expect(data.short_link).to.equal(null);
  });

  it('url为空', async () => {
    const result = await axios.post('http://localhost:3000/su/gen',{
      userURL: '',
    });
    let data = result.data;
    expect(data.code).to.equal(500);
    expect(data.short_link).to.equal(null);
  });
});


describe('成功生成', function () {
  it.skip('成功生成短网址', async () => {
    const result = await axios.post('http://localhost:3000/su/gen',{
      userURL: 'http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html',
    });
    let data = result.data;
    console.log(data);
    expect(data.code).to.equal(200);
    expect(data.short_link).not.equal(null);
  });

  it('已经存在的长网址', async () => {
    const result = await axios.post('http://localhost:3000/su/gen',{
      userURL: 'http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html',
    });
    let data = result.data;
    expect(data.code).to.equal(204);    
    expect(data.short_link).not.equal(null);
  });
});

  //解决方案：https://stackoverflow.com/questions/44149096/for-async-tests-and-hooks-ensure-done-is-called-if-returning-a-promise-en
