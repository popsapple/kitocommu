var express = require('express');
var data_respons = require('http');
//var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response)  {
  var user_keyword;
  request.keyword ? user_keyword = request.keyword : user_keyword = '유기농';

  if(request.keyword){
    console.log('11111111111111111111111111111111111 ::'+request.keyword);
  }
  if(response.body){
    console.log('22222222222222222222222222222222222 ::'+response.body.keyword);
  }
  if(request.params){
    console.log('33333333333333333333333333333333333 ::'+request.params);
  }
  var queryParams = '/foodinfo/search.do?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
  queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent(user_keyword);

  var opts = {
    host: 'api.dbstore.or.kr',
    path: queryParams,
    port: '8880',
    method: 'POST',
    headers: {'x-waple-authorization': 'MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5',
    'content-type' : 'application/x-www-form-urlencoded; charset=UTF-8'}
  };

  var str = '';
  callback = function(res) {
    res.on('data', function (chunk) {
      str += chunk;
    });

    res.on('end', function () {
      //parse forecast.io message
      var data = JSON.parse(str);
        console.log('sssss :============= ::'+data);
      // merge res.locals
      opts._locals = response.locals;

      response.render('pages/index', data);
    });
  }

  var req = data_respons.request(opts, callback);

  req.on('error', function(e) {
  console.log('ERROR: ' + e.message);
});

  req.end();
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
