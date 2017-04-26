module.exports.food_search = function (app) {
function SearchFoodInfo(request,response,queryParams,type,user_keyword){

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
      }
      else {
        console.log("어떻게 찍어오지 ::"+JSON.stringify(data));
        response.send(data);
      }
    });
  }

  var req = data_respons.request(opts, callback);

  req.on('error', function(e) {
    response.render('pages/food_search_error',{'keyword':user_keyword});
  });

  req.end();
}

app.post('/food_search/:result_type', function(request, response) {
  console.log("파람 받기 ::"+request.params.result_type);
  if(request.params.result_type == 'search_list') {
    var user_keyword;
    request.body.keyword ? user_keyword = request.body.keyword : user_keyword = '유기농';

    var queryParams = '/foodinfo/search.do?' + encodeURIComponent('uid') + '=' + encodeURIComponent('LQUV6MOX');
    queryParams += '&' + encodeURIComponent('w') + '=' + encodeURIComponent(user_keyword);
    SearchFoodInfo(request,response,queryParams,'render',user_keyword);
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

});

};
