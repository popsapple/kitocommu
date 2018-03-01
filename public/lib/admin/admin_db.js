exports = module.exports = {AdminDbSetting  : function (mongoose,request,response){
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      working_date: { type: Date, default: Date.now },
      working_type: String,
      woring_reason:  String,
      woring_admin: String
    }, { collection: 'Admin_Diary' });

    mongoose.models = {};
    mongoose.modelSchemas = {};
    global.ADMIN_DIRAY_DB = mongoose.model('admin_diray', Memberschema);

  },getMemberListByIndex : function (mongoose,request,response,callback,type){
    console.log("멤버 찾기");
  var that = this;
  that.db_model = global.MEMBER_DB.model;
  var page_num;
  var page_num_;
  var page_length;
  var page_length_;
  if(request.query.page == undefined){
    page_num = 0;
    page_num_ = 0;
    page_length = 10;
    page_length_ = 10;
  }else{
    page_num = parseInt(request.query.page);
    page_num_ = parseInt(request.query.page);
    page_length = parseInt(request.query.page_length);
    page_length_ = parseInt(request.query.page_length);
  }

  var board_id = 'Memberschema';
  that.getListing = function(){
    that.db_model.count({}, function(error, numOfDocs){
      //slice를 사용하기 때문에..
      var data = {};

      if(type == 'search'){
        var search_option = request.query.searchoption;
        var value = request.query.searchvalue.toString();
        if(search_option == "nickname"){
          data = {nickname: {'$regex': value}};
        }else if(search_option == "id"){
          data = {id: {'$regex': value}};
        }else if(search_option == "member_level"){
          data = {member_level: {'$regex': value}};
        }

      }else{
        page_length_max = numOfDocs-(page_num*page_length);
        page_length = (page_num-page_length);
        page_length < 0 ? page_length = 0 : '';
      }
      that.db_model.find(data, function(err, member_list_){
        var count = 0;
        if(member_list_.length == 0){ // 결과가 없으면
          member_list_.member_list = undefined;
          response.render('admin/member_list',member_list_);
          return false;
        }
        if(type == 'search'){
          page_length_max = member_list_.length-(page_num*page_length);
          page_length = (page_num-page_length);
          page_length < 0 ? page_length = 0 : '';
        }
        var member_list  = member_list_.slice(page_length,page_length_max);
        if(type == 'search'){
          member_list.numOfDocs = member_list_.length;
        }
        member_list.member_list = [];
        member_list.forEach(function(arr,index){
          if(arr.nickname != undefined){
            member_list.member_list[count] = arr; //member_list.splice(page_length,page_length_);
            count++;
          }
          if(index == (member_list.length-1)){
            member_list.page_ = page_num_;
            global.ADMIN_DB.getMemberPagingByIndex(member_list,mongoose,request,response,type);
          }
        });
      });
    });
  }();
},getMemberPagingByIndex : function (member_list,mongoose,request,response,type){
    var member_db = global.MEMBER_DB.model;
    var page_num;
    var page_num_;
    var page_length;
    var page_length_;
    if(request.query.page == undefined){
      page_num = 0;
      page_num_ = 0;
      page_length = 10;
      page_length_ = 10;
    }else{
      page_num = parseInt(request.query.page);
      page_num_ = parseInt(request.query.page);
      page_length = parseInt(request.query.page_length);
      page_length_ = parseInt(request.query.page_length);
    }
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var numOfDocs;
    var pageOfDocs;
    var pageOfCount = [];
    var board_id = 'Memberschema';

    member_db.count({}, function(error, numOfDocs){
      numOfDocs = numOfDocs;
      if(type == 'search'){
        numOfDocs = member_list.numOfDocs;
      }
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(member_list,type,callback){
        member_list.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            member_list.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              member_list.board_paging.push({"paging":j});
            }
          }
        }
        if(typeof callback == "function"){
          callback(member_list);
        }
      };
      if(page_num_ < (page_length_-1)){
        console.log("리스트뿌리기01");
        this.getCountArray(member_list,'all',function(member_list){ // 맨 마지막 페이지일때
          member_list.board_id = board_id;
          response.render('admin/member_list',member_list);
        });
      }else{
        console.log("리스트뿌리기02");
        this.getCountArray(member_list,'',function(member_list){
          member_list.board_id = board_id;
          response.render('admin/member_list',member_list);
        });
      }
    });
  },setMemberBanStatus : function (mongoose,request,response){
    var member_db = global.MEMBER_DB.model;
    var admin_db = global.ADMIN_DIRAY_DB;
    var user_id = request.body.user_id;
    var is_ban = request.body.is_ban.toString();
    var change_ban;
    var data = {"id": user_id};
    var admin_data = new admin_db(admin_db.schema);
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    if(member_db){
      member_db.findOne(data, function(err, member_info){
        var is_changable = global.ADMIN_DB.IsChangeableMember(request,response,member_info);
        if(!is_changable){
          return false;
        }else{
          var data_info = {};
          if(is_ban == "true"){
            change_ban = true;
            data_info.is__ban = "off";
          }else{
            change_ban = false;
            data_info.is__ban = "on";
          }
          member_info.member_ban = change_ban;
          member_info.save(function(err){
            admin_data.save(function(err){
            });
            response.send(data_info);
          });
        }
      });
    }
  },setMemberPoint : function (mongoose,request,response){
    var member_db = global.MEMBER_DB.model;
    var admin_db = global.ADMIN_DIRAY_DB;
    var user_id = request.body.user_id;
    var admin_data = new admin_db(admin_db.schema);
    var data = {"id": user_id};
    var member_point = parseInt(request.body.member_point);
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    if(member_db){
      member_db.findOne(data, function(err, member_info){
        var is_changable = global.ADMIN_DB.IsChangeableMember(request,response,member_info);
        if(!is_changable){
          return false;
        }else{
          member_info.member_point = member_point;
          member_info.save(function(err){
            admin_data.save(function(err){
            });
            response.send({'member_point': member_point});
          });
        }
      });
    }
  },setMemberLevel : function (mongoose,request,response){
    var member_db = global.MEMBER_DB.model;
    var admin_db = global.ADMIN_DIRAY_DB;
    var user_id = request.body.user_id;
    var data = {"id": user_id};
    var admin_data = new admin_db(admin_db.schema);
    var member_level = parseInt(request.body.member_level);
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    if(member_db){
      member_db.findOne(data, function(err, member_info){
        var is_changable = global.ADMIN_DB.IsChangeableMember(request,response,member_info);
        if(!is_changable){
          return false;
        }else{
          member_info.member_level_ = member_level;
          var is_changable_ = global.ADMIN_DB.IsChangeableMember(request,response,member_info);
          if(!is_changable_){
            return false;
          }else{
            member_info.member_level = member_level;
            member_info.save(function(err){
              admin_data.save(function(err){
              });
              response.send({'member_level': member_level});
            });
          }
        }
      });
    }
  },IsChangeableMember : function (request,response,member_info){
    var is_return = true;
    if(member_info.member_level_ > request.session.member_level){
      response.send({'message': '자신의 등급보다 더 높게 수정하실 수 없습니다.'});
      is_return = false;
    }
    if(member_info.id == request.session.userid){
      response.send({'message': '자기 자신은 수정하실 수 없습니다.'});
      is_return = false;
    }
    if(member_info.member_level > request.session.member_level){
      response.send({'message': '자신보다 윗 등급의 멤버는 수정하실 수 없습니다.'});
      is_return = false;
    }
    return is_return;
  },getBoardList(mongoose,request,response,callback){
    global.BOARD_DB.getBoardConfig(mongoose,request,response,'','',function(){
      global.BOARD_STYLE_MODEL.count({}, function(error, numOfDocs){
        global.BOARD_STYLE_MODEL.find({}, function(err, board_list){
          var template_list = '';
          board_list.forEach(function(board__list,index){
            if(board__list.template == ''){
              board__list.template = "/default";
            }
            if(template_list.indexOf(board__list.template) == -1){
              template_list += board__list.template;
            }
            board__list.template = board__list.template.substring(1);
            if(index == numOfDocs-1){
              board_list.template_list = template_list.split('/');
              var length_ = board_list.template_list.length;
              board_list.template_list.forEach(function(arr,index){
                if(index == (length_-1)){
                  console.log("템플릿 찍기 :: "+board__list.template);
                  board_list.board_list = board_list;
                  callback(board_list,request,response);
                }
              });
            }
          })
        });
      });
    },true);
  },setBoardTemplate : function (mongoose,request,response){
    var admin_db = global.ADMIN_DIRAY_DB;
    var board_id = request.body.board_id;
    var data = {"board": board_id};
    var admin_data = new admin_db(admin_db.schema);
    var board_template = request.body.board_template;
    if(board_template == 'default'){
      board_template = "";
    }else{
      board_template = "/"+board_template;
    }
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    global.BOARD_STYLE_MODEL.findOne(data, function(err, board_list){
      global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
        board_list.template = board_template;
        board_list.save(function(err){
          admin_data.save(function(err){});
          response.send({'board_template': board_template});
        });
      },'check_admin');
    });
  },setBoardCategory : function (mongoose,request,response){
    var admin_db = global.ADMIN_DIRAY_DB;
    var board_id = request.body.board_id;
    var data = {"board": board_id};
    var admin_data = new admin_db(admin_db.schema);
    var board_category = request.body.board_category;
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    global.BOARD_STYLE_MODEL.findOne(data, function(err, board_list){
      global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
        board_list.category = board_category;
        board_list.save(function(err){
          admin_data.save(function(err){});
          response.send({'board_category': board_category});
        });
      },'check_admin');
    });
  },setBoardWritingLevel : function (mongoose,request,response){

    var admin_db = global.ADMIN_DIRAY_DB;
    var board_id = request.body.board_id;
    var data = {"board": board_id};
    var admin_data = new admin_db(admin_db.schema);
    var board_writing_level = request.body.board_writing_level;
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    global.BOARD_STYLE_MODEL.findOne(data, function(err, board_list){
      global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
        board_list.writing_level = board_writing_level;
        board_list.save(function(err){
          admin_data.save(function(err){});
          response.send({'board_writing_level': board_writing_level});
        });
      },'check_admin');
    });
  },setBoardPostPoint : function (mongoose,request,response){
    var admin_db = global.ADMIN_DIRAY_DB;
    var board_id = request.body.board_id;
    var data = {"board": board_id};
    var admin_data = new admin_db(admin_db.schema);
    var board_post_point = request.body.board_post_point;
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    global.BOARD_STYLE_MODEL.findOne(data, function(err, board_list){
      global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
        board_list.post_point = board_post_point;
        board_list.save(function(err){
          admin_data.save(function(err){});
          response.send({'board_post_point': board_post_point});
        });
      },'check_admin');
    });
  },setBoardCommentPoint : function (mongoose,request,response){
    var admin_db = global.ADMIN_DIRAY_DB;
    var board_id = request.body.board_id;
    var data = {"board": board_id};
    var admin_data = new admin_db(admin_db.schema);
    var board_comment_point = request.body.board_comment_point;
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;
    global.BOARD_STYLE_MODEL.findOne(data, function(err, board_list){
      global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
        board_list.comment_point = board_comment_point;
        board_list.save(function(err){
          admin_data.save(function(err){});
          response.send({'board_comment_point': board_comment_point});
        });
      },'check_admin');
    });
  }
}
