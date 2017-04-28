function SettingMemberDB(mongoose){
  var Schema = mongoose.Schema;
  var Memberschema = new Schema({
    id:    String,
    password:  Buffer,
    nickname:  String,
    email:  String,
    tel:  Number,
    sex:  String,
    height:  Number,
    weight:  Number,
    writed: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
  }, { collection: 'Memberschema' });

  var MemberInfo = mongoose.model('member', Memberschema);
  MemberInfo = new MemberInfo();
  return MemberInfo; // Member 안에 들어갈 DB 내용을 정의하고 리턴시킨다.
}

Member =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Member.join = function(info,data,request,mongoose){
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

      response.render('member/join_member_step3');

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
  Member.join(request.query,SettingMemberDB(mongoose),request,mongoose);
  });
};
