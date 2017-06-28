exports = module.exports = { MemberMethod : function (obj,mongoose,request,response){
    var request_list;
    if (request.query.id){
      request_list = request.query;
    }else {
      request_list = request.body;
    }

    var pw = request_list.pw;
    var crypto = global.crypto;
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
        shasum = crypto.createHash('sha256',obj.hash);
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
      var input = obj.encryptPassword(pw_text,obj.hash);
      input == pw ? is_true = true : is_true = false ;
      return is_true;
    };
    // 스키마 가져오기
    var Schmea_ = require('mongoose').model('member').schema;
    // 비밀번호 저장 시 사용
    obj.settingPassword = function(){
      obj.hash = obj.makingHash(); // 사용자정의 메소드 호출
      obj.password = obj.encryptPassword(pw); // 사용자정의 메소드 호출
    }
  }, MemberDbSetting  : function (mongoose,request,response){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      id:    String,
      password:  String,
      hash:  String,
      nickname:  String,
      email:  String,
      tel:  String,
      sex:  String,
      height:  Number,
      weight:  Number,
      member_level:  Number,
      member_point:  Number,
      writed: { type: Date, default: Date.now },
      updated: { type: Date, default: Date.now }
    }, { collection: 'Memberschema' });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    exports.model = mongoose.model('member', Memberschema);
  }, MemberPointSetting : function (mongoose,insert_point,member_id,callback,type,multi,multi_index,multi_length,member_id_key,board_id){

    member_data = global.MEMBER_DB.model;
    var that = this;
    that.point_method = function(multi_index,member_id){
      if(multi != undefined && multi.indexOf('multi') != -1){
        member__id = member_id[multi_index][member_id_key];
      }else{
        member__id = member_id;
      }
      console.log("대상자 아이디 :: "+insert_point+"대상 게시판 ::"+board_id);
      member_data.findOne({id: member__id},function(err,member){
        if(typeof type == 'undefined' || type != 'minus'){
          member.member_point += insert_point;
        }else if(type == 'minus'){
          member.member_point -= insert_point;
        }
        member.save(function(err){
          if(typeof multi == 'undefined' || multi.indexOf('multi') == -1){
            if(typeof callback == 'function'){
              callback();
            }
          }else if(multi.indexOf('multi') != -1){
            if(typeof callback == 'function'){
              if(multi_index <= multi_length){
                that.point_method(multi_index,member_id);
                if(multi_index == multi_length){
                  callback();
                }
              }
            }
          }
        });
      });
      multi_index++;
    }

    if(board_id != undefined){
      global.BOARD_STYLE_MODEL.findOne({board: 'Board_'+board_id}, function(err,board_config){
        if(member_id_key == 'comment_writer'){
          insert_point = board_config.comment_point;
        }else{
          insert_point = board_config.post_point;
        }
        multi == undefined ? that.point_method('',member_id) : that.point_method(multi_index,member_id);
      });
    }else{
      multi == undefined ? that.point_method('',member_id) : that.point_method(multi_index,member_id);
    }

    // global.BOARD_DB.MemberPointSetting(insert_point,member_id,callback);
  }, MemberPointGetting : function (member_id,callback){
    member_data = global.MEMBER_DB.model;
    member_data.findOne({id: member_id},function(err,member){
      var point = member.member_point;
      if(typeof callback == 'function'){
        callback(point);
      }
    });
  }, MemberSessionAndIsPageCheck : function (err,typecheck,nullcheck,request,response,move_path){ // 로그아웃 되었을 시 재로그인.
    if(err || typecheck == null || typeof typecheck == 'undefined' || typeof typecheck == 'undefined'){
      if(request == undefined){
        response.redirect('/login_form');
      }else{ // 로그인은 되었는데 존재하지 않는 페이지 접근시 이전 페이지로 이동.
        response.redirect(move_path);
        return false;
      }
    }else{
      return true;
    }
  }, CheckLoginUser: function(request,response){
    if(!request.session.userid || !request.session.nickname){
      response.redirect('/member/plz_login'); //
      return false;
    }else {
      return true;
    }
  }
}
