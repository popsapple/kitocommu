module.exports.admin_con = function(app,mongoose){
  global.ADMIN_DB = require('./admin_db.js');
  app.get('/admin_page/member_list', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      var type = 'list';
      console.log("request.query.search :: "+request.query.search);
      if(request.query.search == "true"){
        type = 'search';
      }
      global.ADMIN_DB.getMemberListByIndex(mongoose,request,response,function(member_list,mongoose,request,response){
        global.ADMIN_DB.getMemberPagingByIndex(member_list,mongoose,request,response,type);
      },type);
    }
  });
}
