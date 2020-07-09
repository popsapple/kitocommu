var parseString = require("xml2js").parseString;
var foodxml = require("./foods");
module.exports.food_search = function (app) {
  app.get("/food_form", function (request, response, next) {
    var data = {};
    response.render("food/index", data);
    response.end();
  });

  app.post("/food_search", function (request, response) {
    console.log("===============================================");
    (async () => {
      var result = [];
      await parseString(foodxml.foodlist, function (err, result) {
        // result
        console.log("보내기에러" + JSON.stringify(result.Root.food[0]));
        result = result.Root.food.filter((item, idx) => {
          if (idx == 0) console.log("이름보기" + item.name[0]);
          return item.name[0].indexOf(request.body.foodname) !== -1;
        });
      });

      console.log("보낼때" + JSON.stringify(result));
      response
        .send({
          foodname: request.body.foodname,
          foodlist: JSON.stringify(result),
        })
        .end();
    })();
    console.log("==================== end ===========================");
  });
};
