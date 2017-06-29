var express = require('express');
var ipfilter = require('express-ipfilter').IpFilter;
var multer = require('multer');
var multerS3 = require('multer-s3');
var fs = require('file-system');
var aws = require('aws-sdk');
var bodyParser = require('body-parser');
global.crypto = require('crypto');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParserJsonError = require('express-body-parser-json-error');
global.svgCaptcha = require('svg-captcha');

var app = express();
app.disable('view cache');
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/node_modules/socket.io/node_modules/socket.io-client/dist'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(cookieParser());

// 접근제한 할 IP들.... 나중에 관리자페이지에서 작업할 수 있게 해야지...
var ips = []; //['127.0.0.1'];
app.use(ipfilter(ips));

var usingSession = session({
  key: '@#Hans%On%Me', // 세션키
  secret: 'Ooishi%Masayoshi#!' // 비밀키
});
app.use(usingSession);

app.use(function (request, response, next) {
  response.set('Cache-Control', 'no-cache'); // 뒤로가기시 로그인 유지 막기
  response.set('Cache-Control', 'no-store'); // 뒤로가기시 로그인 유지 막기
  response.locals.nickname = request.session.nickname;
  response.locals.userid = request.session.userid;
  response.locals.member_level = request.session.member_level;
  var getDateFull = new Date();
  getDateFull = parseInt(getDateFull.getMonth()+''+getDateFull.getDate()+''+getDateFull.getHours()+''+getDateFull.getMinutes()+''+getDateFull.getSeconds()+''+getDateFull.getMilliseconds());
  response.locals.nowtime = Math.floor(Math.random() * 100000000)+getDateFull;
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

// 처음 접속
app.get('/', function(request, response, next) {
  response.render('pages/index');
  if(typeof next == "function"){
    next();
  }
});

// 봇 처리
app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow:");
});

//에러 처리
app.use(function(err, req, res, next) {
  res.status(404).send('페이지가 존재하지 않습니다.');
  res.status(403).send('페이지가 응답하지 않습니다.');
  res.status(500).send('페이지가 응답하지 않습니다.');
  res.status(501).send('페이지가 응답하지 않습니다.');
  res.status(503).send('페이지가 응답하지 않습니다.');
});


var server = app.listen(app.get('port'), function() {});
var socketio = require('socket.io').listen(server);
socketio.of('/catting/list').use(function(socket, next){
  usingSession(socket.request, socket.request.res, next);
//  next();
});
// 식품정보찾기
require('./public/lib/food/food_search.js').food_search(app);

// 에디터관련
require('./public/lib/editor/editor.js').editor_con(app,aws,multer,multerS3,fs);

// 게시판관련
require('./public/lib/board/board.js').board_con(app,mongoose);

// 채팅관련
require('./public/lib/catting/catting.js').catting_con(app,socketio,mongoose);

// 관리자페이지 관련
require('./public/lib/admin/admin.js').admin_con(app,mongoose);
