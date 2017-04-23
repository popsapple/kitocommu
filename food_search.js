module.exports.food_search = function (app) {
function SearchFoodInfo(request,response,queryParams,type){

  var data_respons = require('http');

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
      request.body.keyword ? data.keyword = request.body.keyword : '';
      if(type == 'render') {
        response.render('pages/food_search', data);
      }else {
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

app.post('/food_search:result_type', function(request, response, next) {
  if(req.params.result_type == 'search_list') {
    var user_keyword;
    request.body.keyword ? user_keyword = request.body.keyword : user_keyword = '유기농';

    var queryParams = '/foodinfo/search.do?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
    queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent(user_keyword);
    SearchFoodInfo(request,response,queryParams,'render');
  }
  else {
    var food_category;
    request.body.food_category ? food_category = request.body.food_category : food_category = 'F3JO1';
    var food_seq;
    request.body.food_seq ? food_seq = request.body.food_seq : food_seq = '74';

    var queryParams = '/foodinfo/food_detail.do?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
    queryParams += '&' + encodeURIComponent('c') + '=' + encodeURIComponent(food_category);
    queryParams += '&' + encodeURIComponent('s') + '=' + encodeURIComponent(food_seq);
    SearchFoodInfo(request,response,queryParams,'send');
  }

  next();
});

};
