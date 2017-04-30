require('node-import');
var express = require('express');
var bodyParser = require('body-parser');
global.crypto = require('crypto');
var cookieParser = require('cookie-parser');
var session = require('express-session');


var bodyParserJsonError = require('express-body-parser-json-error');
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  key: 'sid', // 세션키
  secret: 'secret', // 비밀키
  cookie: {
    maxAge: 4000 * 60 * 60 // 쿠키 유효기간 4시간
  }
}));

app.use(function(request, response) {
  if(request.session.user) {
    res.locals.nickname = req.session.nickname;
  }
  else {
    request.locals.nickname = undefined;
  }
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// DB 연결
var mongoose    = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("몽고디비에 연결되었습니다.");
});

mongoose.connect("mongodb://heroku_jzh3ndmz:gt0kqpf30michom691ku6fkj68@ds123361.mlab.com:23361/heroku_jzh3ndmz");

// 식품정보찾기
require('./public/lib/food/food_search.js').food_search(app);

// 회원관련
require('./public/lib/member/member.js').member(app,mongoose);


app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow:");
});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


/* NodeJs 식품정보 아이디 갖고오기....


var request = require('request');

var url = 'http://api.dbstore.or.kr:8880/foodinfo/get_id.do';
var queryParams = '?' + encodeURIComponent('api_key') + '=' + encodeURIComponent('DS64NUS4');
queryParams += '&' + encodeURIComponent('area') + '=' + encodeURIComponent('서울');
queryParams += '&' + encodeURIComponent('sex') + '=' + encodeURIComponent('m');
queryParams += '&' + encodeURIComponent('age') + '=' + encodeURIComponent('30');

request({
    url: url + queryParams,
    method: 'GET',
    headers : {
          "x-waple-authorization" : "MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5",
          "content-type":"application/x-www-form-urlencoded; charset=UTF-8"}
}, function (error, response, body) {
    console.log('Reponse received', body);
});

*/
