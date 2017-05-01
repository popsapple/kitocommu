function SettingSessionItem(app) { // 로그인 세션구현
  app.get('*', function(request, response,next) {
    if(request.session.nickname) response.locals.nickname = request.session.nickname;
    else response.locals.nickname = undefined;
    if(request.session.userid) response.locals.userid = request.session.userid;
    else response.locals.userid = undefined;
    next();
  });
}

function SandMemberLogininfo(app) { // 이메일 보내기
  var mailer = require("nodemailer");

  // Use Smtp Protocol to send Email
  var smtpTransport = mailer.createTransport("SMTP",{
      service: "Gmail",
      auth: {
          user: "gmail_id@gmail.com",
          pass: "gmail_password"
      }
  });

  var mail = {
      from: "Yashwant Chavan <from@gmail.com>",
      to: "to@gmail.com",
      subject: "Send Email Using Node.js",
      text: "Node.js New world for me",
      html: "<b>Node.js New world for me</b>"
  }

  smtpTransport.sendMail(mail, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }

      smtpTransport.close();
  });
}


function MemberDB(mongoose,type,request,response){
  var Schema = mongoose.Schema;
  var request_list;
  if (request.query.id){
    request_list = request.query;
  }else {
    request_list = request.body;
  }

  var pw = request_list.pw;

  var crypto = global.crypto;
  var Memberschema = new Schema({
    id:    String,
    password:  String,
    hash:  String,
    nickname:  String,
    email:  String,
    tel:  Number,
    sex:  String,
    height:  Number,
    weight:  Number,
    writed: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
  }, { collection: 'Memberschema' });

  // 비밀번호 암호화저장
  // hash 값
  Memberschema.method('makingHash', function(){
    var dump = Math.round(new Date().valueOf()*Math.random());
    return dump;
  });

  // 비밀번호 암호화
  Memberschema.method('encryptPassword', function(pw,isHash){
    var dump = pw;
    var shasum;
    // Hash가 아닌 Salt 인데... 이걸 치는 이유는 특정한 패턴의 비밀번호를 입력했을 때 해킹당하지 않게끔
    // 임의의 값을 넣어두는 것
    if(!isHash) {
      shasum = crypto.createHash('sha256',this.hash);
    }else {
      shasum = crypto.createHash('sha256',isHash);
    }
    shasum.update(dump);
    var output = shasum.digest('hex');

    return output;
  });

  // 비밀번호 체크 시 사용
  Memberschema.method('checkloginPassword', function(pw_text,pw){
    var is_true = false;
    var input = this.encryptPassword(pw_text,this.hash);
    input == pw ? is_true = true : is_true = false ;
    return is_true;
  });

  Memberschema.virtual('pw')
  .set(function() {
    this._pw = pw;
    this.hash = this.makingHash(); // 사용자정의 메소드 호출
    this.password = this.encryptPassword(pw); // 사용자정의 메소드 호출
  })
  .get(function() { return this.password; });

  var MemberInfo; // 몽구스를 기존에 정의도니 schmea 가 있을 경우 overwrtie가 안 되기 때문에 에러처리가 필요하다
  try {
    MemberInfo = mongoose.model('member');
  } catch (error) {
    MemberInfo = mongoose.model('member', Memberschema);
  }

  if (type == 'login'){ // 로그인할때
    MemberInfo.findOne({id: request_list.id}, function(err, member){
        if(err) return response.status(500).json({error: err});
        if(!member) return response.status(404).json({error: '입력하신 아이디에 대한 정보를 찾지 못했습니다.'});
        //console.log("조회한 아이디 값에 맞는 회원의 정보 :: "+member);
        var passord_true = member.checkloginPassword(request_list.pw,member.password);
        // 로그인 되면 세션 생성
        if(passord_true) {
          request.session.userid = member.id; // 그냥 id로 하면 서버에서 세션에 넣는 id로 들어감...
          request.session.nickname = member.nickname;
          response.send("<script>alert('"+member.nickname+"님 정상적으로 로그인 되었습니다'); location.href='/';</script>");
        }
        else {
          response.send("<script>alert('정보가 맞지 않습니다. 다시 시도 부탁드립니다.');</script>");
        }
    })
  }

  return MemberInfo; // Member 안에 들어갈 DB 내용을 정의하고 리턴시킨다.
}

Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,data,request,response,mongoose,type){
  for(var key in info){ // 값이 들어온 만큼...
    data[key] = info[key];
  }

  if(type == 'join'){
    data.writed = new Date();
    data.updated = new Date();
    data.save(function(err){
      if(err){
          console.error(err);
          request.json({result: 0});
          return;
      }
      response.render('member/join_member_step3',data);
    });
  }
  else if(type == 'modfiy_list') {
    data.findOne({id: request.session.userid}, function(err, member){
      console.log("아이디는 갖고오니? ::"+request.session.userid);
      console.log("어떻게 뽑아오나 ::"+member);
      response.render('member/modify_member', member);
    });
  }
  else if(type == 'modfiy_submit') {
    data.findOne({id: request.session.userid}, function(err, member){
      for(var key in info){ // 값이 들어온 만큼...
        member[key] = info[key];
        console.log("값이 안 들어가니?? ::"+info[key]);
      }
      member.updated = new Date();
      member.save(function(err){
        if(err){
            console.log("모종의 이유로 에러가 남 ::"+err);
            request.json({result: 0});
            return;
        }
        response.send("<script>alert('"+member.nickname+"님 정상적으로 정보가 변경되었습니다.'); location.href='/';</script>");
      });
    });
  }
}

Member.login = function(request,response,mongoose){

  MemberDB(mongoose,'login',request,response);
}

module.exports.member = function (app,mongoose) {
  //처음에 세션변수(?) 정의
  SettingSessionItem(app);

  app.get('/join_member_step1', function(request, response) {
    response.render('member/join_member_step1');
  });
  app.get('/join_member_step2', function(request, response) {
    response.render('member/join_member_step2');
  });
  app.get('/join_member_step3', function(request, response) {
    Member.join(request.query,MemberDB(mongoose,'join',request,response),request,response,mongoose,'join');
  });

  app.get('/login_form', function(request, response) {
      response.render('member/login'); // 그냥 로그인 폼 출력
  });

  app.post('/login', function(request, response) {
      Member.login(request,response,mongoose);
  });

  app.post('/search_id', function(request, response) {
      Member.search_info(request,response,mongoose,'id');
  });

  app.post('/search_pw', function(request, response) {
    //  Member.search_info(request,response,mongoose,'pw');
  });

  app.get('/mypage/list', function(request, response) {
      Member.join(request.query,MemberDB(mongoose,'modfiy',request,response),request,response,mongoose,'modfiy_list');
  });

  app.post('/mypage/submit', function(request, response) {
      console.log("AAAAAAAAA");
      Member.join(request.body,MemberDB(mongoose,'modfiy',request,response),request,response,mongoose,'modfiy_submit');
  });
};
