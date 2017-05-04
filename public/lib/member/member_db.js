exports = module.exports = {
  MemberMethod(obj,mongoose,request,response){
    var request_list;
    if (request.query.id){
      request_list = request.query;
    }else {
      request_list = request.body;
    }

    var pw = request_list.pw;
    var crypto = global.crypto;
    console.log("step04");
    // 비밀번호 암호화저장
    // hash 값
    obj.makingHash = function(){
      var dump = Math.round(new Date().valueOf()*Math.random());
      return dump;
    };

    // 비밀번호 암호화
    obj.encryptPassword = function(pw,isHash){
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
    };

    // 비밀번호 체크 시 사용
    obj.checkloginPassword = function(pw_text,pw){
      var is_true = false;
      var input = this.encryptPassword(pw_text,this.hash);
      input == pw ? is_true = true : is_true = false ;
      return is_true;
    };
    console.log("Step05");
    // 비밀번호 저장 시 사용
    obj.settingPassword = function(){
      Memberschema.virtual('pw')
      .set(function() {
        this._pw = pw;
        this.hash = obj.makingHash(); // 사용자정의 메소드 호출
        this.password = obj.encryptPassword(pw); // 사용자정의 메소드 호출
      })
      .get(function() { return this.password; });
    }
    exports.obj = obj;
  },
  MemberDbSetting (mongoose,request,response){
    var obj = this;
    var Schema = mongoose.Schema;

    console.log("Step02");

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

    mongoose.models = {};
    mongoose.modelSchemas = {};
    console.log("Step03");

    const MEMBER_MODEL_OBJ = mongoose.model('member', Memberschema);

    exports.MEMBER_MODEL_OBJ = MEMBER_MODEL_OBJ;
  }
}
