module.exports.food_search = function (app) {
function SearchFoodInfo(request,response,type){
  var user_keyword;
  request.body.keyword ? user_keyword = request.body.keyword : user_keyword = '유기농';
  console.log("넘어오는 검색어 ::"+user_keyword)
  var data_respons = require('http');
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
      // merge res.locals
      opts._locals = response.locals;
      if(type == 'loaded') {
        response.render('pages/food_search', data);
      } else {
        data.user_keyword = user_keyword;
        response.send(data);
      }
    });
  }

  var req = data_respons.request(opts, callback);

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

  req.end();
}

app.get('/food_search', function(request, response) {
  SearchFoodInfo(request,response,'loaded');
});

app.post('/food_search', function(request, response) {
  var user_keyword = request.body.keyword;
  SearchFoodInfo(request,response,'search');
});

};
