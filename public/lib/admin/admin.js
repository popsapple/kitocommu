module.exports.admin_con = function(app,mongoose){
  global.ADMIN_DB = require('./admin_db.js');
  app.get('/admin_page/member_list', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      var type = 'list';
      if(request.query.search == "true"){
        type = 'search';
      }
      global.ADMIN_DB.getMemberListByIndex(mongoose,request,response,function(member_list,mongoose,request,response){
        global.ADMIN_DB.getMemberPagingByIndex(member_list,mongoose,request,response,type);
      },type);
    }
  });
  app.get('/admin_page/board_list', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      var type = 'list';
      if(request.query.search == "true"){
        type = 'search';
      }
      global.ADMIN_DB.getBoardList(mongoose,request,response,function(board_list,request,response){
        response.render('admin/board_list',board_list);
      },type);
    }
  });
  app.post('/admin_page/member_list/ban_member', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setMemberBanStatus(mongoose,request,response);
  });
  app.post('/admin_page/member_list/level_change', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setMemberLevel(mongoose,request,response);
  });
  app.post('/admin_page/member_list/point_change', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setMemberPoint(mongoose,request,response);
  });
  app.post('/admin_page/board_list/board_template_change', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setBoardTemplate(mongoose,request,response);
  });
  app.post('/admin_page/board_list/board_category_change', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setBoardCategory(mongoose,request,response);
  });
  app.post('/admin_page/board_list/writeing_level_change', function(request, response) {
    console.log("STEP00 :: ");
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setBoardWritingLevel(mongoose,request,response);
  });
  app.post('/admin_page/board_list/board_post_point', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setBoardPostPoint(mongoose,request,response);
  });
  app.post('/admin_page/board_list/board_comment_point', function(request, response) {
    global.ADMIN_DB.AdminDbSetting(mongoose,request,response);
    global.ADMIN_DB.setBoardCommentPoint(mongoose,request,response);
  });
}
