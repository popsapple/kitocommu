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

  var crypto = global.crypto;

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
    var input = Memberschema.encryptPassword(pw_text,this.hash);
    input == pw ? is_true = true : is_true = false ;
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

  if (type == 'join'){ // 가입할때
    var MemberInfo = mongoose.model('member', Memberschema);
    MemberInfo = new MemberInfo();
  }

  if (type == 'login'){ // 로그인할때
    console.log("로그인체크");
//    var MemberInfo = mongoose.model('member', Memberschema);
    var InfoFind = mongoose.model('member', Memberschema);
    InfoFind.findOne({id: request.query.id}, function(err, member){
        if(err) return response.status(500).json({error: err});
        if(!member) return response.status(404).json({error: '입력하신 아이디에 대한 정보를 찾지 못했습니다.'});
        //console.log("조회한 아이디 값에 맞는 회원의 정보 :: "+member);
        var passord_true = this.checkloginPassword(request.query.pw,member.password);
        console.log("인증이 잘 되었는가? :: "+passord_true);
    })
  }

  return MemberInfo; // Member 안에 들어갈 DB 내용을 정의하고 리턴시킨다.
}

Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,data,request,response,mongoose){
  for(var key in info){ // 값이 들어온 만큼...
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

Member.login = function(request,response,mongoose){

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

  app.get('/login_form', function(request, response) {
      response.render('member/login'); // 그냥 로그인 폼 출력
  });

  app.get('/login', function(request, response) {
      Member.login(request,response,mongoose);
  });
};
