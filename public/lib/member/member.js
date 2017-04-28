function SettingMemberDB(mongoose){
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

  // 비밀번호 암호화저장

  // hash 값
  Memberschema.method(makingHash(){
    var dump = Math.around(new Date().valueOf()*Math.random());
    return dump;
  });

  // 비밀번호 암호화
  Memberschema.method(encryptPassword(pw){
    var dump = pw;
    var shasum = crypto.createHash('sha256');
    shasum.update(dump);
    var output = shasum.digest('hex');

    return output;
  });

  // 비밀번호 체크 시 사용
  Memberschema.method(checkloginPassword(pw_text,pw){
    var is_true = false;
    var shasum = crypto.createHash('sha256');
    shasum.update(pw_text);
    var output = shasum.digest('hex');

    pw_text == pw ? is_true = true : is_true = false ;
    return is_true;
  });

  Memberschema.virtual('pw')
  .set(function(pw) {
    this._pw = pw;
    this.hash = this.makingHash(); // 사용자정의 메소드 호출
    this.password = this.encryptPassword(pw); // 사용자정의 메소드 호출
  })
  .get(function() { return this.password; });

  var MemberInfo = mongoose.model('member', Memberschema);
  MemberInfo = new MemberInfo();
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

module.exports.member = function (app,mongoose) {
  app.get('/join_member_step1', function(request, response) {
    response.render('member/join_member_step1');
  });
  app.get('/join_member_step2', function(request, response) {
  response.render('member/join_member_step2');
  });
  app.get('/join_member_step3', function(request, response) {
    //  SettingMemberDB(); // 시그마 정의
  Member.join(request.query,SettingMemberDB(mongoose),request,response,mongoose);
  });
};
