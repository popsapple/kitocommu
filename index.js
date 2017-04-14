var express = require('express');
var data_respons = require('http');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


var url = 'http://api.dbstore.or.kr:8880/foodinfo/search.do';
var queryParams = '/foodinfo/search.do?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent('유기농');

app.get('/', function(request, response)  {


/*  options = {
  host: 'www.random.org',
  path: '/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
};*/

  var options = {
    host: 'api.dbstore.or.kr',
    path: queryParams,
    port: '8880',
    method: 'POST',
    headers: {'x-waple-authorization': 'MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5',
    'content-type' : 'application/x-www-form-urlencoded; charset=UTF-8'}
  };

  callback = function(res) {
    var str = ''
    res.on('data', function (chunk) {
      str += chunk;
    });

    res.on('end', function () {
      console.log('dddddddddddddddd :============= ::'+str);
      res.render('pages/index', str);
    });
  }

  var req = data_respons.request(options, callback);

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
