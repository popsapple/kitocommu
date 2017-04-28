function JoinMemberDB(mongoose,Memberschema,request){
  // 비밀번호 암호화저장
  // hash 값
  Memberschema.method('makingHash', function(){
    var dump = Math.around(new Date().valueOf()*Math.random());
    return dump;
  });

  // 비밀번호 암호화
  Memberschema.method('encryptPassword', function(pw){
    var dump = pw;
    var shasum = crypto.createHash('sha256');
    shasum.update(dump);
    var output = shasum.digest('hex');

    return output;
  });

  // 비밀번호 체크 시 사용
  Memberschema.method('checkloginPassword', function(pw_text,pw){
    var is_true = false;
    var shasum = crypto.createHash('sha256');
    shasum.update(pw_text);
    var output = shasum.digest('hex');

    pw_text == pw ? is_true = true : is_true = false ;
    return is_true;
  });

  var pw = request.query.pw;
  Memberschema.virtual('pw')
  .set(function() {
    this._pw = pw;
    this.hash = this.makingHash(); // 사용자정의 메소드 호출
    this.password = this.encryptPassword(pw); // 사용자정의 메소드 호출
  })
  .get(function() { return this.password; });

}

function MemberDB(mongoose,type,request,response){
  var Schema = mongoose.Schema;
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


  if (type == 'join'){ // 가입할때
    JoinMemberDB(mongoose,Memberschema,request);
    var MemberInfo = mongoose.model('member', Memberschema);
    MemberInfo = new MemberInfo();
    return MemberInfo; // Member 안에 들어갈 DB 내용을 정의하고 리턴시킨다.
  }

  if (type == 'login'){ // 로그인할때
    MemberInfo.findOne({id: request.params.id}, function(err, member){
        if(err) return response.status(500).json({error: err});
        if(!member) return response.status(404).json({error: '입력하신 아이디에 대한 정보를 찾지 못했습니다.'});
        //response.json(book);
        console.log("조회한 아이디 값에 맞는 회원의 정보 :: "+member);
    })
  }

}

Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,data,request,response,mongoose){
  for(var key in info){ // 값이 들어온 만큼...
    console.error("어느 데이타가 안 들어오는거지1111 ::"+data[key]);
    console.error("어느 데이타가 안 들어오는거지2222 ::"+info[key]);
    data[key] = info[key];
  }
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

Member.login = function(info,request,response,mongoose){

  MemberDB(mongoose,'login',request,response);
}

module.exports.member = function (app,mongoose) {
  app.get('/join_member_step1', function(request, response) {
    response.render('member/join_member_step1');
  });
  app.get('/join_member_step2', function(request, response) {
  response.render('member/join_member_step2');
  });
  app.get('/join_member_step3', function(request, response) {
    //  MemberDB(); // 시그마 정의
  Member.join(request.query,MemberDB(mongoose,'join',request,response),request,response,mongoose);
  });
  app.get('/login/:result_type', function(request, response) {
    if(request.params.result_type == 'login_form') {
      response.render('member/login'); // 그냥 로그인 폼 출력
    } else {
      Member.login(request.query,request,response,mongoose);
    }
  });
};
