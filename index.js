var express = require('express');
var data_respons = require('http');
var bodyParser = require('body-parser');
var app = express();
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    var user_keyword = '유기농';

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
  //next();
});

app.listen(app.get('/'), function(request, response) {
  if(request.body) {
    console.log("DDDDDDDDDDDDDDDDDD ::"+request.body.keyword_item);
  }
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
