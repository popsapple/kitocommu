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
      page_num = numOfDocs-(page_num*page_length);
      page_length = page_num-page_length+1;
      var data = {};

      if(type == 'search'){
        var search_option = request.query.searchoption;
        var value = request.query.searchvalue.toString();
        if(search_option == "nickname"){
          data = {"nickname": value};
        }else if(search_option == "id"){
          data = {"id": value};
        }else if(search_option == "member_level"){
          data = {"member_level": value};
        }
      }
      that.db_model.find(data, function(err, member_list){
        var count = 0;
        member_list = member_list.splice(page_length,page_num);
        member_list.member_list = [];
        member_list.forEach(function(arr,index){
          if(arr.nickname != undefined){
            member_list.member_list[count] = arr; //member_list.splice(page_length,page_length_);
            count++;
          }
          if(index == (member_list.length-1)){
            console.log("끝");
            member_list.page_ = page_num_;
            global.ADMIN_DB.getMemberPagingByIndex(member_list,mongoose,request,response,type);
          }
        });
      });
    });
  }();
},getMemberPagingByIndex : function (member_list,mongoose,request,response,type){
    console.log("getMemberPagingByIndex");
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
        this.getCountArray(member_list,'all',function(member_list){ // 맨 마지막 페이지일때
          console.log("getCountArray == all");
          member_list.board_id = board_id;
          response.render('admin/member_list',member_list);
        });
      }else{
        this.getCountArray(member_list,'',function(member_list){
          console.log("getCountArray == none");
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
    console.log("유저 아이디 찾기 :: "+user_id);
    console.log("유저 정보 찾기 :: "+is_ban);
    var admin_data = new admin_db(admin_db.schema);
    admin_data.working_date = new Date();
    admin_data.working_type = request.body.working_type;
    admin_data.woring_reason = request.body.woring_reason;
    admin_data.woring_admin = request.session.userid;

    if(member_db){
      member_db.findOne(data, function(err, member_info){
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
            console.log("관리정보 저장");
          });
          response.send(data_info);
        });
      });
    }
  }
}
