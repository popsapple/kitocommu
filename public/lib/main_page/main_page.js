exports = module.exports = {index_page  : function (app,mongoose) {
    // 처음 접속
    app.get('/', function(request, response, next) {
      var data = {};
      data.board_data = [];
      global.BOARD_DB.getBoardData(data,request,response,mongoose,['title','contents'],3,'DiteFaq',function(data){
        global.BOARD_DB.getBoardData(data,request,response,mongoose,['title','contents','writer_nickname'],3,'MemberDiary',function(data){
          response.render('pages/index',data);
          response.end();
        });
      });
    });
  }
}
