var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


var url = 'http://api.dbstore.or.kr:8880/foodinfo/search.do';
var queryParams = '?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent('유기농');

app.get('/', function(request, response)  {

  app.set('x-waple-authorization', 'MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5');
  app.set('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

  app.listen(app.get(url, function(request, response)  {
    console.log('==============================================================');
    console.log('AAAAAAAAAAA'+url);
    console.log('BBBBBBBBBBB'+request);
    console.log('CCCCCCCCCCC'+response);
  });


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
