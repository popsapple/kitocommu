function SettingSessionItem(app) { // 로그인 세션구현
  app.get('/', function(request, response,next) {
    if(request.session.nickname) response.locals.nickname = request.session.nickname;
    else response.locals.nickname = undefined;
    if(request.session.userid) response.locals.userid = request.session.userid;
    else response.locals.userid = undefined;
    next();
  });
}

Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,request,response,mongoose,type){
  var save_data_ = new MEMBER_DB();
  save_data_.MemberDbSetting(mongoose,request,response);
  var save_data = save_data_.MEMBER_MODEL_OBJ;
  // 디비를 갖고 온 후에 사용할 메서드
  save_data_.MemberMethod(save_data,mongoose,request,response);
  save_data = save_data_.obj;
  save_data.settingPassword();

  for(var key in info){ // 값이 들어온 만큼...
    save_data[key] = info[key];
  }
  console.log("Step01");
  save_data.writed = new Date();
  save_data.updated = new Date();
  save_data.save(function(err){
    if(err){
        console.error(err);
        request.json({result: 0});
        return;
    }
    save_data.ispage = "join_result";
    response.render('member/join_member_step3',save_data);
  });
}

Member.login = function(request,response,mongoose){
  MemberDB(mongoose,'login',request,response);
}

module.exports.member = function (app,mongoose) {

  global.MEMBER_DB = require('member_db.js');

  //처음에 세션변수(?) 정의
  SettingSessionItem(app);

  app.get('/join_member_step1', function(request, response) {
    response.render('member/join_member_step1');
  });
  app.get('/join_member_step2', function(request, response) {
    response.render('member/join_member_step2');
  });
  app.get('/join_member_step3', function(request, response) {
    Member.join(request.query,request,response,mongoose);
  });

  app.get('/login_form', function(request, response) {
      response.render('member/login'); // 그냥 로그인 폼 출력
  });

  app.post('/login', function(request, response) {
      Member.login(request,response,mongoose);
  });

  app.get('/search_login_info', function(request, response) {
    response.render('member/search_info'); // 팝업창 출력
  });

  app.post('/member_double_check', function(request, response) {
  //  Member.join(request.body,MemberDB(mongoose,'modfiy',request,response),request,response,mongoose,'double_check');
    Member.double_check(request.body,request,response,mongoose);
  });

  app.post('/search_login_info_submit', function(request, response) {
  //  Member.join(request.body,MemberDB(mongoose,'modfiy',request,response),request,response,mongoose,'login_info_submit');
    Member.login_info_submit(request.body,request,response,mongoose);
  });

  app.get('/mypage/list', function(request, response) {
  //  Member.join(request.query,MemberDB(mongoose,'',request,response),request,response,mongoose,'modfiy_list');
    Member.modfiy_list(request.query,request,response,mongoose);
  });

  app.post('/mypage/submit', function(request, response) {
  //  Member.join(request.body,MemberDB(mongoose,'modfiy',request,response),request,response,mongoose,'modfiy_submit');
    Member.modfiy_submit(request.body,request,response,mongoose);
  });

  app.get('/logout', function(request, response) {
    request.session.destroy();
    return response.redirect('/');
  });
};
