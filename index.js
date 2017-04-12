var express = require('express');
var app = express();
var app2 = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

var url = 'http://api.dbstore.or.kr:8880/foodinfo/search.do';
var queryParams = '?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent('유기농');

url = (url + queryParams);

app2.set(function() {
  console.log('========================================================');
  app2.setHeaders('x-waple-authorization', 'MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5');
  app2.setHeaders('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
  next();
},function(){
  app2.get(url), function(request, response) {

    console.log('111111'+url);
    console.log('2222'+response);
    console.log('33333'+request.body);
  console.log('========================================================');
});


/*
var url = 'http://api.dbstore.or.kr:8880/foodinfo/search.do';
var queryParams = '?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent('유기농');

var request = require('request');
request({
    url: url + queryParams,
    method: 'GET',
    headers : {
          "x-waple-authorization" : "MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5",
          "content-type":"application/x-www-form-urlencoded; charset=UTF-8"}
}, function (error, response, body) {
    response.render('/pages/index');
});

*/

app.use(function(req, res, next) {
  res.locals.request = req;
  next();
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
