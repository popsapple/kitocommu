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
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  save_data = new save_data(save_data.schema);

  for(var key in info){ // 값이 들어온 만큼...
    save_data[key] = info[key];
  }

  // 디비를 갖고 온 후에 사용할 메서드
  var save_data_ = new global.MEMBER_DB.MemberMethod(save_data,mongoose,request,response);
  save_data.settingPassword();
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
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  //save_data = new save_data(save_data.schema);
  // 디비를 갖고 온 후에 사용할 메서드
  save_data.findOne({id: request.body.id}, function(err, member){
    if(err) return response.status(500).json({error: err});
    if(!member){
      response.send("<script>alert('입력하신 정보에 맞는 회원을 찾지 못했습니다.'); location.href='/login_form';</script>");
    }

    var save_data_ = new global.MEMBER_DB.MemberMethod(member,mongoose,request,response);
    var passord_true = member.checkloginPassword(request.body.pw,member.password);
    // 로그인 되면 세션 생성
    if(passord_true) {

      request.session.userid = member.id; // 그냥 id로 하면 서버에서 세션에 넣는 id로 들어감...
      request.session.nickname = member.nickname;
      response.send("<script>alert('"+member.nickname+"님 정상적으로 로그인 되었습니다'); location.href='/';</script>");
    }
    else {
      response.send("<script>alert('정보가 맞지 않습니다. 다시 시도 부탁드립니다.'); location.href='/login_form';</script>");
    }
  });
}

Member.double_check = function(info,request,response,mongoose){
  var id_info;
  var member_ = '';
  var is_double = {
    isdouble: "yes"
  };
  if(info['item_key'] == 'nickname') {
    id_info = {nickname: info['item_val']}
  };
  if(info['item_key'] == 'id') {
   id_info = {id: info['item_val']};
  };

  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  //save_data = new save_data(save_data.schema);
  // 디비를 갖고 온 후에 사용할 메서드
  save_data.findOne(id_info, function(err, member){
    member_ = member;
    if(err){  // 아무것도 못 찾았을 때
      is_double = {
        isdouble: "no"
      };
      response.send(is_double);
      return false;
    }
    if(member_){
      is_double = {
        isdouble: "yes"
      };
    }
    else{
      console.log("STEP04");
      is_double = {
        isdouble: "no"
      };
    }
    response.send(is_double);
  });
}

Member.modfiy_list = function(info,request,response,mongoose){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  //save_data = new save_data(save_data.schema);
  // 디비를 갖고 온 후에 사용할 메서드
  save_data.findOne({id: request.session.userid}, function(err, member){
    response.render('member/modify_member', member);
  });
}

Member.modfiy_submit = function(info,request,response,mongoose,type){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  save_data = new save_data(save_data.schema);

  var id_info = {nickname: info['nickname']};

  save_data.findOne(id_info, function(err, member){
    if(err){  // 아무것도 못 찾았을 때
        response.send("<script>alert('입력해주신 정보에 맞는 회원을 찾지 못했습니다. 입력내용을 다시한번 확인해주세요');</script>");
        return false;
    }

    for(var key in info){ // 값이 들어온 만큼...
      if(member[key] && info[key]){
        member[key] = info[key];
      }
    }
    var save_data_ = new global.MEMBER_DB.MemberMethod(member,mongoose,request,response);
    // 디비를 갖고 온 후에 사용할 메서드
    member.settingPassword();
    member.writed = new Date();
    member.updated = new Date();
    member.save(function(err){
      if(err){
          console.error(err);
          request.json({result: 0});
          return;
      }
      response.send("ok");
    });
  });
}

module.exports.member = function (app,mongoose) {

  global.MEMBER_DB = require('./member_db.js');

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
//    Member.login_info_submit(request.body,request,response,mongoose);
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
