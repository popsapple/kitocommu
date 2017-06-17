var express = require('express');
global.EXPRESS = express;
var multer = require('multer');
var multerS3 = require('multer-s3');
var fs = require('file-system');
var aws = require('aws-sdk');
var bodyParser = require('body-parser');
global.crypto = require('crypto');
var cookieParser = require('cookie-parser');
var socketio = require('socket.io')(app);
var session = require('express-session');
var bodyParserJsonError = require('express-body-parser-json-error');
//var methodOverride = require('method-override');

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/node_modules/socket.io/node_modules/socket.io-client/dist'));
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

app.use(function (request, response, next) {
  response.locals.nickname == undefined ? response.locals.nickname = request.session.nickname : '';
  response.locals.userid == undefined ? response.locals.userid = request.session.userid : '';
  next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// DB 연결
var mongoose = require('mongoose');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("몽고디비에 연결되었습니다.");
});

mongoose.connect("mongodb://heroku_jzh3ndmz:gt0kqpf30michom691ku6fkj68@ds123361.mlab.com:23361/heroku_jzh3ndmz");

// 회원관련
global.MEMBERLIB = require('./public/lib/member/member.js').member(app,mongoose);

// 로그인 세션
app.get('/', function(request, response, next) {
  response.render('pages/index');
  if(typeof next == "function"){
    next();
  }
});


app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow:");
});


var server = app.listen(app.get('port'), function() {});
var socketio = require('socket.io').listen(server);

// 식품정보찾기
require('./public/lib/food/food_search.js').food_search(app);

// 에디터관련
require('./public/lib/editor/editor.js').editor_con(app,aws,multer,multerS3,fs);

// 게시판관련
require('./public/lib/board/board.js').board_con(app,mongoose);

// 채팅관련
require('./public/lib/catting/catting.js').catting_con(app,socketio);
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
