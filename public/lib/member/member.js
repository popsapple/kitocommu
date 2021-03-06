Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,request,response,mongoose,type){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  save_data = new save_data(save_data.schema);

  for(var key in info){ // 값이 들어온 만큼...
    save_data[key] = info[key];
  }

  save_data.writing_level = 0; //처음 가입시 일반화원.
  // 디비를 갖고 온 후에 사용할 메서드
  var save_data_ = new global.MEMBER_DB.MemberMethod(save_data,mongoose,request,response);
  save_data.settingPassword();
  save_data.writed = new Date();
  save_data.updated = new Date();
  save_data.member_point = 0;
  save_data.member_level = 0;
  save_data.member_ban = false;
  var check_id = save_data.id;
  global.MEMBER_DB.model.findOne({id: check_id}, function(err, data) {
    if(err){
      data.alert_message = "데이터 전송 중 오류가 있었습니다 다시 가입 부탁드립니다.";
      return response.render('member/join_member_step2', {message: data.alert_message});
    }
    if(data){
     data.alert_message = "이미 가입된 아이디입니다. 다른 아이디로 가입해 주세요.";
     return response.render('member/join_member_step2', {message: data.alert_message});
    }
    if(!data){
      save_data.save(function(err,data){
        if(err){
            console.error(err);
            request.json({result: 0});
            return;
        }
        request.session.destroy();
        var data = {
          id:save_data.id
        }
        return response.render('member/join_member_step3',data);
      });
    }
  });
}

Member.login = function(request,response,mongoose){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  //save_data = new save_data(save_data.schema);
  // 디비를 갖고 온 후에 사용할 메서드
  save_data.findOne({id: request.body.id}, function(err, member){
    if(err) {
      response.send("<script>alert('입력하신 정보에 맞는 회원을 찾지 못했습니다.'); location.href='/login_form';</script>");
    }
    if(!member){
      response.send("<script>alert('입력하신 정보에 맞는 회원을 찾지 못했습니다.'); location.href='/login_form';</script>");
    }else{
      if(member.member_ban == true){
        response.send("<script>alert('현재 영구정지 상태입니다. 자세한 사유는 관리자께 문의하세요.'); location.href='/login_form';</script>");
        return false;
      }else{
        var save_data_ = new global.MEMBER_DB.MemberMethod(member,mongoose,request,response);
        var passord_true = member.checkloginPassword(request.body.pw,member.password);
        // 로그인 되면 세션 생성
        if(passord_true) {

          request.session.userid = response.locals.userid = member.id; // 그냥 id로 하면 서버에서 세션에 넣는 id로 들어감...
          request.session.nickname = response.locals.nickname = member.nickname;
          request.session.member_level = response.locals.member_level = member.member_level;
          response.send("<script>alert('"+member.nickname+"님 정상적으로 로그인 되었습니다'); location.href='/';</script>");
        }
        else {
          response.send("<script>alert('정보가 맞지 않습니다. 다시 시도 부탁드립니다.'); location.href='/login_form';</script>");
        }
      }
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
      if(info['item_key'] == 'nickname' && request.session.nickname == info['item_val']) {
        is_double = {
          isdouble: "no"
        };
        response.send(is_double);
      }else if(info['item_key'] == 'id' && request.session.userid == info['item_val']) {
        is_double = {
          isdouble: "no"
        };
        response.send(is_double);
      }else {
        is_double = {
          isdouble: "yes"
        };
        response.send(is_double);
      }
    }
    else{
      is_double = {
        isdouble: "no"
      };
      response.send(is_double);
    }
  });
}

Member.modfiy_list = function(info,request,response,mongoose){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  //save_data = new save_data(save_data.schema);
  // 디비를 갖고 온 후에 사용할 메서드
  save_data.findOne({id: request.session.userid}, function(err, member){
    return response.render('member/modify_member', member);
  });
}

Member.modfiy_submit = function(info,request,response,mongoose,type){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;

  save_data.findOne({id: request.session.userid}, function(err, member){
    for(var key in info){ // 값이 들어온 만큼...
      member[key] = info[key];
    }
    // 디비를 갖고 온 후에 사용할 메서드
    var save_data_ = new global.MEMBER_DB.MemberMethod(member,mongoose,request,response);
    member.settingPassword();
    member.updated = new Date();
    member.save(function(err){
      if(err){
          request.json({result: 0});
          return;
      }
      response.send("<script>alert('"+member.nickname+"님 정상적으로 정보변경 되었습니다');location.href='/';</script>");
    });
  });
}

Member.search_login_info = function(info,request,response,mongoose,type){
  var save_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  save_data = global.MEMBER_DB.model;
  var id_info = {nickname: info['nickname']};
  save_data.findOne(id_info, function(err, member){
    if(err || !member || !member.nickname){  // 아무것도 못 찾았을 때
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
      response.send(member);
    });
  });
}

Member.sign_out_member = function(info,request,response,mongoose,type){
  global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
  var member_model = global.MEMBER_DB.model;
  var user_id = request.session.userid;
  if(type == 'normal_member') {
    member_model.findOne({id: user_id}, function(err,member){
      if(err){
        return;
      }
      global.MEMBER_DB.MemberMethod(member,mongoose,request,response);

      if(!request.body.password){
        response.send({message:"비밀번호를 확인해주세요",is_ok:'false'});
        return;
      }
      var is_ok = member.checkloginPassword(request.body.password,member.password);
      if(is_ok){
        member_model.remove({id: user_id}, function(err,member){
          response.send({message:"탈퇴 되셨습니다.",is_ok:'true'});
          request.session.destroy();
        });
      }else{
        response.send({message:"비밀번호를 확인 부탁드립니다.",is_ok:'false'});
      }
    });
  }
}

exports = module.exports = {member  : function (app,mongoose) {
  this.CheckAuthenfication = function(account1,account2,request,response,callback,type,level,none_member){ // 알맞는 권한을 가진 계정인지 체크
      var value_;
      var member_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
      var member_data = global.MEMBER_DB.model;
      if(type == 'check_admin'){
        member_data.findOne({id: account2}, function(err, member){
          if(!none_member && (member == undefined || typeof member == 'undefined')){
            if(request.session != undefined){request.session.destroy();}
            response.redirect('/member/plz_login'); //
            return false;
          }
          if((member != undefined)){
            (level == undefined) ? level = 3 : '';
            if(parseInt(member.member_level) >= parseInt(level)){ // 4등급 이상이 관리자등급.
              value_ = true;
            }
          }
          callback(value_);
        });
      }else if(type == 'both_check'){
        member_data.findOne({id: account2}, function(err, member){
          account1 == account2 ? value_ = true : value_ = false;
          if((member != undefined)){
            if(parseInt(member.member_level) > 3){ // 4등급 이상이 관리자등급.
              value_ = true;
            }
          }
          callback(value_);
        });
      }
    };

    global.MEMBER_DB = require('./member_db.js');

    app.get('/join_member_step1', function(request, response) {
      return response.render('member/join_member_step1');
    });
    app.get('/join_member_step2', function(request, response) {
      return response.render('member/join_member_step2');
    });
    app.get('/join_member_step3', function(request, response) {
      Member.join(request.query,request,response,mongoose);
    });

    app.get('/login_form', function(request, response) {
      return response.render('member/login'); // 그냥 로그인 폼 출력
    });

    app.post('/login', function(request, response) {
       Member.login(request,response,mongoose);
    });

    app.get('/search_login_info', function(request, response) {
      return response.render('member/search_info'); // 팝업창 출력
    });

    app.post('/member_double_check', function(request, response) {
      Member.double_check(request.body,request,response,mongoose);
    });

    app.post('/search_login_info_submit', function(request, response) {
      Member.search_login_info(request.body,request,response,mongoose);
    });

    app.get('/mypage/list', function(request, response) {
      if(global.MEMBER_DB.CheckLoginUser(request,response)){
        Member.modfiy_list(request.query,request,response,mongoose);
      }
    });

    app.post('/mypage/submit', function(request, response) {
      Member.modfiy_submit(request.body,request,response,mongoose);
    });

    app.get('/logout', function(request, response) {
      request.session.destroy();
      return response.redirect('/');
    });

    app.get('/member/plz_login', function(request, response) {
      return response.render('member/plz_login');
    });

    app.post('/member/sign_out', function(request, response){
      Member.sign_out_member(request.body,request,response,mongoose,'normal_member');
    });

    return this;
  }
};
