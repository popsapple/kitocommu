module.exports.food_search = function (app) {
  function SearchFoodInfo(
    request,
    response,
    queryParams,
    type,
    user_food_keyword
  ) {
    var data_respons = require("http");

    var opts = {
      host: "api.dbstore.or.kr",
      path: queryParams,
      port: "8880",
      method: "POST",
      headers: {
        "x-waple-authorization":
          "MzY4LTE0OTE4NDE3MDg3NzUtMjVkNzNiMmYtZjQ3Ni00OTRiLTk3M2ItMmZmNDc2Mjk0YmI5",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    };

    var str = "";
    callback = function (res) {
      res.on("data", function (chunk) {
        str += chunk;
      });

      res.on("end", function () {
        //parse forecast.io message
        var data = JSON.parse(str);
        // merge res.locals
        opts._locals = response.locals;
        request.body.food_keyword
          ? (data.food_keyword = request.body.food_keyword)
          : "";

        //  console.log("어떻게 찍어오지 ::"+JSON.stringify(data));

        if (type == "render") {
          if (data.food_list == undefined) {
            return response.render("food/food_search_error", {
              food_keyword: user_food_keyword,
            });
          } else {
            return response.render("food/food_search", data);
          }
        } else {
          response.send(data);
        }
      });
      res.on("error", function (e) {
        return response.render("food/food_search_error", {
          food_keyword: user_food_keyword,
        });
      });
    };

    var req = data_respons.request(opts, callback);

    req.on("error", function (e) {
      return response.render("food/food_search_error", {
        food_keyword: user_food_keyword,
      });
    });

    req.end();
  }

  app.get("/food_form", function (request, response, next) {
    var data = {};
    response.render("food/index", data);
    response.end();
  });

  app.post("/food_search/:result_type", function (request, response) {
    if (request.params.result_type == "search_list") {
      var user_food_keyword;
      request.body.food_keyword
        ? (user_food_keyword = request.body.food_keyword)
        : (user_food_keyword = "유기농");

      var queryParams =
        "/foodinfo/search.do?" +
        encodeURIComponent("uid") +
        "=" +
        encodeURIComponent("LQUV6MOX");
      queryParams +=
        "&" +
        encodeURIComponent("w") +
        "=" +
        encodeURIComponent(user_food_keyword);
      SearchFoodInfo(
        request,
        response,
        queryParams,
        "render",
        user_food_keyword
      );
    } else {
      var food_category;
      request.body.food_category
        ? (food_category = request.body.food_category)
        : (food_category = "F3JO1");
      var food_seq;
      request.body.food_seq
        ? (food_seq = request.body.food_seq)
        : (food_seq = "74");

      var queryParams =
        "/foodinfo/food_detail.do?" +
        encodeURIComponent("uid") +
        "=" +
        encodeURIComponent("LQUV6MOX");
      queryParams +=
        "&" + encodeURIComponent("c") + "=" + encodeURIComponent(food_category);
      queryParams +=
        "&" + encodeURIComponent("s") + "=" + encodeURIComponent(food_seq);
      SearchFoodInfo(request, response, queryParams, "send");
    }
  });
};

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
