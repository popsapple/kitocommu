var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


/* NodeJs 샘플 코드 */


var request = require('request');

var url = 'http://apis.data.go.kr/1470000/FoodNtrIrdntInfoService/getFoodNtrItdntList';
var queryParams = '?' + encodeURIComponent('ServiceKey') + '=73Jk1pUmlpaKcb3esV43IVrmH4SVea%2FGn%2BXrgSkI4Mk16R0KYIrrPKwuGPS2qZAJPIk4JcxUIy7N3l0Sh6eBIQ%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('desc_kor') + '=' + encodeURIComponent('짜장면'); /* 식품이름 */
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent(''); /* 페이지번호 */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent(''); /* 한 페이지 결과 수 */

request({
    url: url + queryParams,
    method: 'GET'
}, function (error, response, body) {
    console.log('Status', response.statusCode);
    console.log('Headers', JSON.stringify(response.headers));
    console.log('Reponse received', body);
});
