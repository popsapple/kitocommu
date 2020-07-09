var parseString = require("xml2js").parseString;
var foodxml = require("./foods");
module.exports.food_search = function (app) {
  app.get("/food_form", function (request, response, next) {
    var data = {};
    response.render("food/index", data);
    response.end();
  });

  app.post("/food_search", function (request, response) {
    parseString(foodxml.foodlist, function (err, result) {
      // result
      console.log("result.Root.food", result.Root.food.length);
      result = result.Root.food.filter((item) => {
        return result.name.indexOf(request.body.foodname) !== -1;
      });
      response.send({ foodname: request.body.foodname, foodlist: result });
    });
  });
};
