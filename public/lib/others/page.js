exports = module.exports = {
  index_page: function(app) {
    // 처음 접속
    app.get("/introduce", function(request, response, next) {
      var data = {};
      response.render("other/introduce", data);
      response.end();
    });
  }
};
