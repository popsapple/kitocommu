module.exports.rss_builder = function (app, mongoose) {
  function CreateXmlFile(request, response, next, callback) {
    var that = this;
    var builder = require("xmlbuilder");
    var dateFormat = require("dateformat");
    var now = new Date();
    var now_date =
      dateFormat(now, "yyyy") +
      "-" +
      dateFormat(now, "mm") +
      "-" +
      dateFormat(now, "dd");
    var data = {};
    data.board_data = [];
    var doc = builder.create("urlset", { encoding: "utf-8", version: "1.0" });
    doc.att("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

    /*** 게시판이 아닌 페이지는 수동으로 추가 ***/
    var url = doc.ele("url");
    var loc = url.ele("loc", {}, "https://kitocommu.herokuapp.com");
    var lastmod = url.ele("lastmod", {}, now_date);
    var changefreq = url.ele("changefreq", {}, "always");
    var priority = url.ele("priority", {}, "0.9");

    ["김치"].forEach((item) => {
      /*** 게시판이 아닌 페이지는 수동으로 추가 ***/
      var url_food = doc.ele("url");
      var loc = url.ele(
        "loc",
        {},
        "http://kitocommu.herokuapp.com/food_form?foodname"
      );
      var lastmod = url.ele("lastmod", {}, now_date);
      var changefreq = url.ele("changefreq", {}, "always");
      var priority = url.ele("priority", {}, "0.9");
    });
    ["김치"].forEach((item) => {
      /*** 게시판이 아닌 페이지는 수동으로 추가 ***/
      var url_food = doc.ele("url");
      var loc = url.ele("loc", {}, "http://kitocommu.herokuapp.com/introduce");
      var lastmod = url.ele("lastmod", {}, now_date);
      var changefreq = url.ele("changefreq", {}, "always");
      var priority = url.ele("priority", {}, "0.9");
    });
    /** 서브페이지인 경우는 이렇게 **/
    /* var url = doc.ele('url');
    var loc = url.ele('loc',{},'https://kitocommu.herokuapp.com'+arr['link']);
    var changefreq = url.ele('changefreq',{},'always'); */
    global.BOARD_DB.getBoardData(
      data,
      request,
      response,
      mongoose,
      ["writed"],
      100,
      "MemberDiary",
      function (data) {
        data.board_data["Board_MemberDiary"].forEach(function (arr, index) {
          var url = doc.ele("url");
          var loc = url.ele(
            "loc",
            {},
            "https://kitocommu.herokuapp.com" + arr["link"]
          );
          var changefreq = url.ele("changefreq", {}, "always");
        });
        global.BOARD_DB.getBoardData(
          data,
          request,
          response,
          mongoose,
          ["writed"],
          100,
          "MemberIntroduce",
          function (data) {
            data.board_data["Board_MemberIntroduce"].forEach(function (
              arr,
              index
            ) {
              var url = doc.ele("url");
              var loc = url.ele(
                "loc",
                {},
                "https://kitocommu.herokuapp.com" + arr["link"]
              );
              var changefreq = url.ele("changefreq", {}, "always");
            });
            global.BOARD_DB.getBoardData(
              data,
              request,
              response,
              mongoose,
              ["writed"],
              100,
              "DiteFaq",
              function (data) {
                data.board_data["Board_DiteFaq"].forEach(function (arr, index) {
                  var url = doc.ele("url");
                  var loc = url.ele(
                    "loc",
                    {},
                    "https://kitocommu.herokuapp.com" + arr["link"]
                  );
                  var changefreq = url.ele("changefreq", {}, "always");
                });
                global.BOARD_DB.getBoardData(
                  data,
                  request,
                  response,
                  mongoose,
                  ["writed"],
                  100,
                  "RecipeIntroduce",
                  function (data) {
                    data.board_data["Board_RecipeIntroduce"].forEach(function (
                      arr,
                      index
                    ) {
                      var url = doc.ele("url");
                      var loc = url.ele(
                        "loc",
                        {},
                        "https://kitocommu.herokuapp.com" + arr["link"]
                      );
                      var changefreq = url.ele("changefreq", {}, "always");
                    });
                    return callback(
                      that,
                      now_date,
                      request,
                      response,
                      next,
                      doc.end({ pretty: true })
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
  app.get("/kitucommu_sitemap.xml", function (request, response, next) {
    CreateXmlFile(request, response, next, function (
      that,
      now_date,
      request,
      response,
      next,
      xml
    ) {
      response.type("text/xml");
      response.send(xml);
      if (typeof next == "function") {
        next();
      }
    });
  });
};
