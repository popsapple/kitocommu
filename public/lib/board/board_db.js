exports = module.exports = {BoardDbSetting  : function (mongoose,request,response,collection){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      post_index: Number,
      reply: String,
      writed:  { type: Date, default: Date.now },
      category:  String,
      is_notice:  String,
      writer:  String,
      writer_nickname:  String,
      title:  String,
      contents:  String,
      tags:  String,
      thumnail:  String,
      is_secret : String,
      file_list:  String
    }, { collection: collection });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    exports.model = mongoose.model('board', Memberschema);
  },getBoardConfig : function (mongoose,request,response,board_id,config,callback,is_model){
    var Schema = mongoose.Schema;

    var BoardConfigSchema = new Schema({
      board: String,
      board_name: String,
      list_type:  String,
      is_comment:  String,
      is_reply_type:  String,
      writing_level:  Number,
      css_skin:  String,
      template:  String,
      post_point:  Number,
      comment_point:  Number,
      category_list:  String
    }, { collection: 'Board_Typelist' });

    mongoose.models = {};
    mongoose.modelSchemas = {};
    global.BOARD_STYLE_MODEL = mongoose.model('board_type_list', BoardConfigSchema);
    if(is_model){
      callback();
      return false;
    }
    BOARD_STYLE_MODEL.find({board: board_id}, function(err,board_config){
      var config_list = {};
      board_config.forEach(function(item,index){
        for (var key in global.BOARD_STYLE_MODEL.schema.paths){
          config_list[key] = item[key];
        }
      });
      if(err){
        console.log("찾기 에러");
      }
      if(!board_config){
        console.log("결과값 없음");
      }else {
        callback(config_list,config);
      }
    });
  },getBoardLastIndex : function (obj,mongoose,request,response,callback){

    var BOARD_DB_MODEL = global.BOARD_DB.model;
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){
        obj.post_index = (numOfDocs-1);
        BOARD_DB_MODEL.find({post_index: (numOfDocs-1)}, function(err,result){
          // 동기적으로 실행해야 하므로 콜백으로 처리한 함수.
          if(result){
            obj.post_index = (numOfDocs);
          }
          callback(obj);
        });
    });
  },setBoardSortIndex : function(obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var save_data = BOARD_DB_MODEL.find().update({$sort: { post_index: -1 }});
  },getBoardListByIndex : function (mongoose,request,response,callback){
    var that = this;
    that.db_model = global.BOARD_DB.model;
    that.db_reply_model = global.BOARD_REPLY_DB;
    var page_num = parseInt(request.query.page);
    var board_table_id = request.query.board_table_id;
    var page_length = parseInt(request.query.page_length);
    that.getListing = function(){
      that.db_model.count({}, function(error, numOfDocs){
        page_num = numOfDocs-(page_num*page_length)-1;
        page_length = (page_num-page_length)+1;
        var data = {};
        function sortList(a, b) {
          if(a.post_index == b.post_index){ return 0} return  a.post_index > b.post_index ? -1 : 1;
        }
        that.db_model.find({post_index: { $gte: page_length, $lte: page_num }}).sort( { "post_index": -1 }).limit(numOfDocs).toArray(function(err, board) {
          if(err){
            return response.render('/');
          }
          data.board_list = board;
          data.page_ = request.query.page;
          that.db_reply_model.count({reply_index: { $gte: page_length, $lte: page_num }, reply_table: board_table_id}, function(error, numOfDocReplys){
           if(!numOfDocReplys){
             callback(data,mongoose,request,response);
             return false;
           }
           if(numOfDocReplys == 0 ){
              callback(data,mongoose,request,response);
              return false;
            } else{
              that.db_reply_model.find({reply_index: { $gte: page_length, $lte: page_num }, reply_table: board_table_id}).sort( { "post_index": -1 }).limit(numOfDocs).toArray(function(err, reply) {
                if(!reply){
                  callback(data,mongoose,request,response);
                  return false;
                }
                var reply_doc = [];
                var that_reply = {};
                var reply_count = 0;
                var post_count = 0;
                var max_reply_length = numOfDocReplys-1;
                var max_post_length = data.board_list.length-1;
                reply.forEach(function(reply, index) {
                  reply_doc[index] = reply;
                  if(index == max_reply_length) {
                    that_reply.ReplyPostListing = function(reply_count,post_count) {
                      if(!data.board_list[post_count].reply_list){
                        data.board_list[post_count].reply_list = [];
                      }
                      if(post_count <= max_post_length) {
                        if(data.board_list[post_count].post_index == reply_doc[reply_count].reply_index) {
                          reply_doc[reply_count].board_table_id = "ReplyList";
                          data.board_list[post_count].reply_list.push(reply_doc[reply_count]);
                        }
                        if(post_count == max_post_length){
                          if(reply_count < max_reply_length) {
                            reply_count+=1;
                            post_count=0;
                            that_reply.ReplyListing(reply_count,post_count);
                          }else if(reply_count == max_reply_length){
                            //global.BOARD_DB.ChangeWritedDate(data,function(data,mongoose,request,response){callback(data,mongoose,request,response)},'reply',mongoose,request,response);
                            callback(data,mongoose,request,response);
                            return false;
                          }
                        }else {
                          post_count+=1;
                          that_reply.ReplyPostListing(reply_count,post_count);
                        }
                      }
                    };
                    that_reply.ReplyListing = function(reply_count) {
                      that_reply.ReplyPostListing(reply_count,post_count);
                    };
                    that_reply.ReplyListing(reply_count);
                  }
                });
              });
            };
          });
        });
      });
    }();
  },getBoardListBySearch : function (obj,mongoose,request,response,callback){
    console.log("찾기 클릭");
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var max_page_length;
    var search_option = request.query.searchoption;
    var search_value = request.query.searchvalue;
    if(request.query.searchvalue == undefined){
      search_value = "";
    }
    var search_hint;
    if(search_option == "title"){
      search_hint = {title: {'$regex': search_value}};
    }else if(search_option == "tags"){
      search_hint = {tags: {'$regex': search_value}};
    }else if(search_option == "writer"){
      search_hint = {writer_nickname: {'$regex': search_value}};
    }else if(search_option == "category"){
      search_hint = {category: {'$regex': search_value}};
    }
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){

      var data = {};

      BOARD_DB_MODEL.find(search_hint).sort( { "post_index": -1 }).limit(numOfDocs).toArray(function(err, board) {
        if(search_value != ""){
          max_page_length = board.length-(page_num*page_length);
          page_num = max_page_length-page_length; //(page_num-page_length)+1;
          page_num < 0 ? page_num = 0 : '';
          max_page_length < 0 ? max_page_length = 0 : '';
        }else{
          max_page_length = numOfDocs-(page_num*page_length);
          page_num = (max_page_length-page_length);
          page_num < 0 ? page_num = 0 : '';
          max_page_length < 0 ? max_page_length = 0 : '';
        }
        data.board_list = board;
        obj.board_post_length = data.board_list.length;
        data.board_list = data.board_list.slice(page_num,max_page_length);
        data.page_ = request.query.page;
        data.searchoption = search_option;
        data.searchvalue = search_value;
        callback(data,mongoose,request,response);
      });
    });
  },getBoardListByNotice : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_length = 2;
    var search_hint = {is_notice: "on"};
    function sortList(a, b) {
      if(a.post_index == b.post_index){ return 0} return  a.post_index > b.post_index ? -1 : 1;
    }
    BOARD_DB_MODEL.find(search_hint).sort( { "post_index": -1 }).limit(numOfDocs).toArray(function(err, board) {
      obj.notice_list = board;
      obj.notice_list = obj.notice_list.slice(0,page_length);
      global.BOARD_DB.ChangeWritedDate(obj,callback(obj,mongoose,request,response),'notice');
    });
  },getBoardPostByIndex : function (mongoose,request,response,callback,type){
    var request_list;
    if (request.query.post_index){
      request_list = request.query;
    }else {
      request_list = request.body;
    }
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var BOARD_DB_MODEL_SCHEMA = require('mongoose').model('board').schema.paths;
    var page_num = parseInt(request_list.post_index);
    var board_info_ = {};
    BOARD_DB_MODEL.findOne({post_index: page_num}, function(err,board){
      var prev_path = request.session.urlpath;
      if(global.MEMBER_DB.MemberSessionAndIsPageCheck(err,board,'post_index',request,response,prev_path)){ // 접속오류 체크
        var page_length = 10;
        board_info_.board_paging = Math.floor(parseInt(page_num)/10);
        var board_id = 'Board_'+(request_list.board_table_id);
        var count = 0;
        for (var key in BOARD_DB_MODEL_SCHEMA){
          if(count == 0){
            board_info_.board_table_id = request_list.board_table_id;
            board_info_.post_index = request_list.post_index;
          }
          board_info_[key] = board[key];
          count++;
        }
        function RenderViewpage(board_info_){

          (request_list.is_reply && request_list.is_reply == "yes") ? board_info_.is_reply = "yes" : board_info_.is_reply = "no";
          request_list.reply_table_id ? board_info_.reply_table_id = request_list.reply_table_id : "";
          if(board_info_.is_secret == "on" && !board_info_.is_writer){
            var data = {};
            data.board_table_id = board_info_.board_table_id;
            (request_list.is_reply && request_list.is_reply == "yes") ? data.is_reply = "yes" : data.is_reply = "no";
            request_list.reply_table_id ? data.reply_table_id = request_list.reply_table_id : "";
            return response.render('board/secret',data);
          }
          if(board_info_.is_comment == 'yes'){
            global.BOARD_DB.BoardCommentDbSetting(mongoose,request,response);
            var db_object = global.BOARD_COMMENT_MODEL;
            var post_index_ = board_info_.post_index;
            var board_table_id = request_list.board_table_id;
            if(board_info_.tags == undefined){
              board_info_.tags_list = "#키토제닉#저탄고지#다이어트";
            }else{
              board_info_.tags_list = board_info_.tags.split("#").join(" ");
            }
            db_object.find({post_index: post_index_, board_id: board_table_id}, function(err, comment){
              var comment = comment;
              if(!comment || comment == '' || comment.length == 0) { // 댓글 없을 때
                var board_id = 'Board_'+(request_list.board_table_id);
                global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
                  for (var key in global.BOARD_STYLE_MODEL.schema.paths){
                    board_info_[key] = config[key];
                  }
                  return response.render('board'+board_info_.template+'/view',board_info_);
                });
                return false;
              }else {
                var finded_count;
                db_object.count({post_index: post_index_}, function(error, numOfDocs){
                  finded_count = numOfDocs;
                  board_info_.comments_list = comment;
                  board_info_.is_comment_writer = [];
                  var is_admin = false;
                  var member_data = new global.MEMBER_DB.MemberDbSetting(mongoose,request,response);
                  var member_data = global.MEMBER_DB.model;
                  var now_account = request.session.userid;
                  member_data.findOne({id: now_account}, function(err, member){
                    if(parseInt(member.member_level) > 3){ // 4등급 이상이 관리자등급.
                      is_admin = true;
                    }
                    var i = 0;
                    this.CheckFunction = function(i,that){
                      global.MEMBERLIB.CheckAuthenfication(board_info_.comments_list[i].comment_writer,request.session.userid,request,response,function(value_){
                        board_info_.is_comment_writer[i] = value_;
                        if(i == (finded_count-1)){ //(finded_count-1)){
                          var board_id = 'Board_'+(request_list.board_table_id);
                          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
                            for (var key in global.BOARD_STYLE_MODEL.schema.paths){
                              board_info_[key] = config[key];
                            }
                            return response.render('board'+board_info_.template+'/view',board_info_);
                          });
                          //return response.render('board/view',board_info_);
                        }else{
                          i++;
                          that.CheckFunction(i,that);
                        }
                      },'both_check');
                    }
                    var that = this;
                    if(finded_count > 0){
                      this.CheckFunction(i,that);
                    }else{
                      return response.render('board'+board_info_.template+'/view',board_info_);
                    }
                  });
                });
              };
            });
          }else{
            var board_id = 'Board_'+(request_list.board_table_id);
            global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
              for (var key in global.BOARD_STYLE_MODEL.schema.paths){
                board_info_[key] = config[key];
              };
              if(board_info_.tags == undefined){
                board_info_.tags_list = "#키토제닉#저탄고지#다이어트";
              }else{
                board_info_.tags_list = board_info_.tags.split("#").join(" ");
              }
              return response.render('board'+board_info_.template+'/view',board_info_);
            });
          }

        }
        if(type != 'modify'){
          if(request_list.reply_table_id != undefined){ //답글 부분이 자기의 부모(?) 게시물의 설정을 가져오게끔.
            board_id = 'Board_'+(request_list.reply_table_id);
          }
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,board,function(config){
            for (var key in config){
              board_info_[key] = config[key];
            }
            board_info_.category_list ? board_info_.category_list = board_info_.category_list.split(",") : '';

            global.MEMBERLIB.CheckAuthenfication(board.writer,request.session.userid,request,response,function(value_){
              board_info_.is_writer = value_;
              RenderViewpage(board_info_);
            },'both_check');
          });
        }else if(type == 'modify'){
          if(request_list.reply_table_id != undefined){ //답글 부분이 자기의 부모(?) 게시물의 설정을 가져오게끔.
            board_id = 'Board_'+(request_list.reply_table_id);
          }
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,board,function(config){
            for (var key in config){
              board_info_[key] = config[key];
            }
            board_info_.category_list ? board_info_.category_list = board_info_.category_list.split(",") : '';

            global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
              board_info_.is_admin = value_;
              board_info_.is_writer = value_;
              board_info_.is_reply = request.query.is_reply;
              if(request.query.reply_table_id){
                request.query.reply_table_id ? board_info_.reply_table_id = request.query.reply_table_id : "";
              }else if(request.body.reply_table_id){
                request.body.reply_table_id ? board_info_.reply_table_id = request.body.reply_table_id : "";
              }
              var captcha = global.svgCaptcha.create();
              board_info_.captcha_img = captcha.data;
              board_info_.captcha_data = captcha.text;
              request.session.captcha_data = board_info_.captcha_data.toString();

              return response.render('board/write',board_info_);
            },'check_admin');
          });
        }
      }
    });
  },onSaveBoardPost : function(that,info,request,response,mongoose,collection,type){
    if(type=='save'){
      that.save_data = new that.save_data(that.save_data.schema);
    }
    that.save_item(info);
    // 디비에 있는 내용을 확인하고 저장해야 하므로 save 함수를 콜백으로 넘깁니다.
    function SaveFunction(save_data,type){
      if(type=='save'){
        var board_table_id;
        that.save_data.update(that.save_data,{upsert: true}, function(err,data){
          if(err){
              console.error(err);
              request.json({result: 0});
              return;
          }else{
            console.log("포스트 인덱스 값 :: "+that.save_data.post_index);
            (request.query.is_reply && request.query.is_reply == "yes") ? save_data.is_reply = "yes" : save_data.is_reply = "no";
            request.query.reply_table_id ? save_data.reply_table_id = request.query.reply_table_id : "";

            request.body.reply_table_id ? board_table_id = request.body.reply_table_id : board_table_id = request.body.board_table_id;
            global.MEMBER_DB.MemberPointSetting(mongoose,10,request.session.userid,function(){
              return response.render('board/write_ok',save_data);
            },'','','','','writer',board_table_id);
          }
        });
      } else {
        var request_list;
        if (request.query.post_index){
          request_list = request.query;
        }else {
          request_list = request.body;
        }
        var post_index_ = request_list.post_index;

        that.save_data.findOne({post_index: post_index_}, function(err, data){
        that.modify_item(data,info,request_list);
        data.update(data,{upsert: true}, function(err){
          if(err){
              request.json({result: 0});
              return;
          }

          if(request.query.is_reply){
            request.query.is_reply == "yes" ? data.is_reply = "yes" : data.is_reply = "no";
          }else if(request.body.is_reply){
            request.body.is_reply == "yes" ? data.is_reply = "yes" : data.is_reply = "no";
          }

          if(request.query.reply_table_id){
            request.query.reply_table_id ? data.reply_table_id = request.query.reply_table_id : "";
          }else if(request.body.reply_table_id){
            request.body.reply_table_id ? data.reply_table_id = request.body.reply_table_id : "";
          }
          return response.render('board/write_ok',data);
        });
      });
    }
  }

  if(type=='save'){
    global.BOARD_DB.setBoardSortIndex(that.save_data,mongoose,request,response);
  }

  // post_index가 등록시 중복되지 않도록 지정
  global.BOARD_DB.getBoardLastIndex(that.save_data,mongoose,request,response,function(){
    SaveFunction(that.save_data,type);
  });
  },onRemoveBoardPost : function (mongoose,request,response,callback){
    var that = this;
    this.db_model = global.BOARD_DB.model;
    this.db = global.BOARD_DB;
    var page_num = request.body.post_index;
    var page_num_ = parseInt(page_num);
    var board_id = request.body.board_table_id;
    this.Removing = function(){
      that.db_model.findOne({post_index: page_num}, function(err, board){
        global.MEMBER_DB.MemberPointSetting(mongoose,10,board.writer,function(){
          board.remove(function(){
            /// Ok
            that.db.BoardCommentDbSetting(mongoose,request,response);
            var db_object = global.BOARD_COMMENT_MODEL;
            var db_reply_object = global.BOARD_REPLY_DB;
            var board_table_id = request.body.board_table_id;
            db_object.find({post_index: page_num, board_id: board_table_id}, function(err, comment){
              var comment_index = 0;
              comment.forEach(function(arr,comment__index){
                //Ok
                var CommentPointRemoving = function(comment_index){
                  global.MEMBER_DB.MemberPointSetting(mongoose,10,comment,function(){
                    db_reply_object.find({reply_index: page_num, reply_table: board_table_id}, function(err, reply){
                      var reply_index = 0;
                      reply.forEach(function(arr,reply__index){
                        var ReplyPointRemoving = function(reply_index){
                          global.MEMBER_DB.MemberPointSetting(mongoose,10,reply,function(){
                          },'minus','multi__',reply_index,(reply.length-1),'writer',board_table_id);
                        }
                        if(reply__index == 0){
                          ReplyPointRemoving(reply_index);
                        }
                        arr.remove(
                          function(){
                            if(reply__index == (reply.length-1)){
                              db_reply_object.update({reply_index: {$gte: page_num}, reply_table: board_table_id},{$inc:{reply_index: -1 }},{ multi: true },function (error, obj){});
                            }
                          }
                        );
                      });
                    });
                  },'minus','multi',comment_index,(comment.length-1),'comment_writer',board_table_id);
                }
                if(comment__index == (comment.length-1)){
                  CommentPointRemoving(comment_index);
                };
                arr.remove(
                  function(){
                    if(comment__index == (comment.length-1)){
                      db_object.update({post_index: {$gte: page_num}, board_id: board_table_id},{$inc:{post_index: -1 }},{ multi: true },function (error, obj){});
                    }
                  }
                );
                //Ok
              });
              //만약 댓글이 없을 경우..
              if(comment.length == 0){
                db_reply_object.find({reply_index: page_num, reply_table: board_table_id}, function(err, reply){
                  var reply_index = 0;
                  reply.forEach(function(arr,reply__index){
                    var ReplyPointRemoving = function(reply_index){
                      global.MEMBER_DB.MemberPointSetting(mongoose,10,reply,function(){
                      },'minus','multi__',reply_index,(reply.length-1),'writer',board_table_id);
                    }
                    if(reply__index == 0){
                      ReplyPointRemoving(reply_index);
                    }
                    arr.remove(
                      function(){
                        if(reply__index == (reply.length-1)){
                          db_reply_object.update({reply_index: {$gte: page_num}, reply_table: board_table_id},{$inc:{reply_index: -1 }},{ multi: true },function (error, obj){});
                        }
                      }
                    );
                  });
                });
              }
              //
            });
            that.db_model.update({post_index: {$gte: page_num}},{$inc:{post_index: -1 }},{ multi: true },
            function (error, obj) {
              if(request.body.is_reply == 'yes'){
                board_id = request.body.reply_table_id;
                return response.redirect("/board/list?board_table_id="+board_id+"&page=0&page_length=10");
              }else {
                return response.redirect("/board/list?board_table_id="+board_id+"&page=0&page_length=10");
              }
            });
            /// Ok
          });
        },'minus','check','','','writer',board_id);
      });
    };

    return this;
  },getBoardPagingByIndex : function (obj,mongoose,request,response,type,board_post_length){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_num_ = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var page_length_ = parseInt(request.query.page_length);
    page_num = page_num*page_length;
    page_length = ((page_num*page_length)+page_length)-1;
    var numOfDocs;
    var pageOfDocs;
    var pageOfCount = [];
    obj.board_table_id = request.query.board_table_id;
    if(type == 'search'){
      numOfDocs = board_post_length;
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(obj,type,callback){
        obj.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            obj.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              obj.board_paging.push({"paging":j});
            }
          }
        }
        callback(obj);
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(obj,'all',function(obj){
          var board_id = 'Board_'+(request.query.board_table_id);
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
            for (var key in global.BOARD_STYLE_MODEL.schema.paths){
              obj[key] = config[key];
            }
            var level = obj.writing_level;
            global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
              if(value_){
                obj.writing_level = "yes";
              }else{
                obj.writing_level = "no";
              }
              if(obj.template == undefined){
                obj.template = '';
              }
              global.BOARD_DB.ChangeWritedDate(obj,function(array){response.render('board'+obj.template+'/list',array)},'post');
            },'check_admin',level,true);
          });
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          var board_id = 'Board_'+(request.query.board_table_id);
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
            for (var key in global.BOARD_STYLE_MODEL.schema.paths){
              obj[key] = config[key];
            }
            var level = obj.writing_level;
            global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
              if(value_){
                obj.writing_level = "yes";
              }else{
                obj.writing_level = "no";
              }
              if(obj.template == undefined){
                obj.template = '';
              }
              global.BOARD_DB.ChangeWritedDate(obj,function(array){response.render('board'+obj.template+'/list',array)},'post');
            },'check_admin',level,true);
          });
        });
      }
      return;
    }
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){
      numOfDocs = numOfDocs;
      numOfDocs%page_length_ == 0 ? pageOfDocs = (numOfDocs/page_length_)-1 : pageOfDocs = (numOfDocs/page_length_);
      numOfDocs <= page_length_ ? pageOfDocs = 0 : '';
      for(var i = 0; i <= pageOfDocs; i++){
        pageOfCount[i] = i;
      }
      this.getCountArray = function(obj,type,callback){
        obj.board_paging = [];
        if(type == 'all'){
          var countarray = pageOfCount.slice(0,page_length_);
          for(var c = 0; c < countarray.length; c++){
            obj.board_paging.push({"paging":c});
          }
        }
        else{
          for(var j = page_num_-4; j <= (page_num_+5); j++){
            if(pageOfCount[j]){
              obj.board_paging.push({"paging":j});
            }
          }
        }
        if(typeof callback == "function"){
          callback(obj);
        }
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(obj,'all',function(obj){
          var board_id = 'Board_'+(request.query.board_table_id);
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
            for (var key in global.BOARD_STYLE_MODEL.schema.paths){
              obj[key] = config[key];
            }
            var level = obj.writing_level;
            global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
              if(value_){
                obj.writing_level = "yes";
              }else{
                obj.writing_level = "no";
              }
              if(obj.template == undefined){
                obj.template = '';
              }
              global.BOARD_DB.ChangeWritedDate(obj,function(array){response.render('board'+obj.template+'/list',array)},'post');
            },'check_admin',level,true);
          });
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          var board_id = 'Board_'+(request.query.board_table_id);
          global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(config){
            for (var key in global.BOARD_STYLE_MODEL.schema.paths){
              obj[key] = config[key];
            }
            var level = obj.writing_level;
            global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
              if(value_){
                obj.writing_level = "yes";
              }else{
                obj.writing_level = "no";
              }
              if(obj.template == undefined){
                obj.template = '';
              }
              global.BOARD_DB.ChangeWritedDate(obj,function(array){response.render('board'+obj.template+'/list',array)},'post');
            },'check_admin',level,true);
          });
        });
      }
    });
  },BoardCommentDbSetting  : function (mongoose,request,response){
    var obj = this;
    var Schema = mongoose.Schema;

    var Memberschema = new Schema({
      board_id :String,
      post_index: Number,
      comment_index: Number,
      comment_post_writer: String,
      comment_contents: String,
      comment_writer: String,
      comment_date: { type: Date, default: Date.now },
      is_secret: String
    }, { collection: 'Board_ComentsList' });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    global.BOARD_COMMENT_MODEL = mongoose.model('comment', Memberschema);
  },BoardCommentSave : function(mongoose,request,response) {
    global.BOARD_DB.BoardCommentDbSetting(mongoose,request,response);
    var db_object = global.BOARD_COMMENT_MODEL;
    var comment_index_;
    var board_table_id = request.body.board_id;
    var save_data = {};
    request.body.comment_index ? comment_index_ = request.body.comment_index : comment_index_ = -1;
    !request.body.is_modify ? save_data = new db_object(global.BOARD_COMMENT_MODEL.schema) : '';
    db_object.count({}, function(error, numOfDocs){
      db_object.findOne({comment_index: comment_index_, board_id: board_table_id}, function(err, data){
        request.body.is_modify ? save_data = data : '';
        save_data.board_id = request.body.board_id;
        save_data.post_index = request.body.post_index;
        request.body.comment_index ? save_data.comment_index = data.comment_index : save_data.comment_index = numOfDocs;
        save_data.comment_post_writer = request.body.comment_post_writer;
        save_data.comment_contents = request.body.comment_contents;
        save_data.comment_writer = request.session.userid;
        request.body.comment_date ? save_data.comment_date = data.comment_date : save_data.comment_date = new Date();
        save_data.is_secret = request.body.is_secret ? request.body.is_secret = "on" : "no";
        save_data.save(function(err){
          if(err){
              request.json({result: 0});
              return;
          }

          if(request.body.is_modify != 'yes'){
            global.MEMBER_DB.MemberPointSetting(mongoose,10,request.session.userid,function(){
              return response.redirect('/board/view?board_table_id='+save_data.board_id+'&post_index='+save_data.post_index);
            },'','','','','comment_writer',board_table_id);
          }
        });
      });
    });
  },BoardReplyDbSetting  : function (mongoose,request,response,collection){
      var obj = this;
      var Schema = mongoose.Schema;

      var Memberschema = new Schema({
        reply_table : String,
        post_index: Number,
        reply_index: Number,
        writed:  { type: Date, default: Date.now },
        category:  String,
        is_notice:  String,
        writer:  String,
        writer_nickname:  String,
        title:  String,
        contents:  String,
        tags:  String,
        thumnail:  String,
        is_secret : String,
        file_list:  String
      }, { collection: collection });

      mongoose.models = {};
      mongoose.modelSchemas = {};
      global.BOARD_REPLY_DB = mongoose.model('reply', Memberschema);
  },ChangeWritedDate : function(obj,callback,type,mongoose,request,response){
    var index = 0;
    var key = 'board_list';
    if(type && type == 'notice'){
      key = 'notice_list';
    }
    if(obj['board_list'].length == 0){
      //obj.message = "작성된 게시물이 없습니다";
      if(typeof callback == "function") {
        callback(obj,mongoose,request,response);
      }else{
        callback;
      }
    }
    outside:
    for(var key_ in obj[key]){ // 시간 뷰페이지에 맞게 가공
      if(!obj[key][index].writed){
        obj[key] = [];
        callback(obj,mongoose,request,response);
        break;
      }
      var time_pattern = /(\S+)/g;
      var date = String.prototype.match.apply(obj[key][index].writed,[time_pattern]);
      function DateChange(time_pattern,date){
        switch(date[1]){
          case("January") :{
            date[1] = "01";
            break;
          }case("Febuary") :{
            date[1] = "02";
            break;
          }case("March") :{
            date[1] = "03";
            break;
          }case("April") :{
            date[1] = "04";
            break;
          }case("May") :{
            date[1] = "05";
            break;
          }case("Jun") :{
            date[1] = "06";
            break;
          }case("Jul") :{
            date[1] = "07";
            break;
          }case("August") :{
            date[1] = "08";
            break;
          }case("September") :{
            date[1] = "09";
            break;
          }case("October") :{
            date[1] = "10";
            break;
          }case("November") :{
            date[1] = "11";
            break;
          }case("December") :{
            date[1] = "12";
            break;
          }
        }
      };

      /*reply_list**/

      DateChange(time_pattern,date);

      obj[key][index].writed_date = date[1]+"."+date[2]+"."+date[3];
      var reply_idx = 0;
      if((obj[key].length-1) == index && (JSON.stringify(obj[key][index]['reply_list']) == "[]" || JSON.stringify(obj[key][index]['reply_list']) == undefined)){
        (function RenderWeitredDateLastindex(index,obj,key){
          if(obj[key][index].writed_date == undefined || obj[key][index].writed_date == null){
            obj[key][index].writed_date = date[1]+"."+date[2]+"."+date[3];
            RenderWeitredDateLastindex(index,obj,key);
          //  return;
          }
          if(typeof callback == "function") {
            callback(obj,mongoose,request,response);
          }else{
            callback;
          }
        })(index,obj,key);
      }
      if(JSON.stringify(obj[key][index]['reply_list']) != "[]"){
        for(var reply in obj[key][index]['reply_list']){
          var date_reple = String.prototype.match.apply(obj[key][index]['reply_list'][reply_idx].writed,[time_pattern]);
          DateChange(time_pattern,date_reple);
          obj[key][index]['reply_list'][reply_idx].writed_date = date_reple[1]+"."+date_reple[2]+"."+date_reple[3];
          if((obj[key].length-1) == index && (obj[key][index]['reply_list'].length-1) == reply_idx){ // 맨 마지막 아무래도 맨 마지막 게 위의 swich나 for문이 다 돌기 전에 실행되는 듯 하여 복잡하게 추가...
            (function RenderWeitredDateLastindex(index,obj,key){
              if(obj[key][index].writed_date == undefined || obj[key][index].writed_date == null){
                obj[key][index].writed_date = date[1]+"."+date[2]+"."+date[3];
                obj[key][index]['reply_list'][reply_idx].writed_date = date_reple[1]+"."+date_reple[2]+"."+date_reple[3];
                RenderWeitredDateLastindex(index,obj,key);
              //  return;
              }
              if(typeof callback == "function") {
                callback(obj,mongoose,request,response);
              }else{
                callback;
              }
            })(index,obj,key);
          };
          reply_idx++;
        }
      }
      index++;
    };
  },getBoardData : function(data,request,response,mongoose,data_list,post_length,collection,callback){
    var collection_ = collection;
    var collection = "Board_"+collection;
    global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
    global.BOARD_DB.model.count({}, function(error, board_count){
      data.board_data[collection] = [];
      global.BOARD_DB.model.find({},function(err,board__data){
        var is_ok = true;
        var count = (board_count-1);
        var count_ = 0;
        for(var i = count; i >= 0; i--){
          if(count_ < post_length){
            var board_paging = Math.floor(parseInt(board__data[i].post_index)/10);
            if (!data.board_data[collection][count_]) {
              data.board_data[collection][count_] = [];
            }
            for(var key in data_list){
              var key = data_list[key];
              data.board_data[collection][count_][key] = board__data[i][key];
            }
            data.board_data[collection][count_]['link'] = "/board/view?board_table_id="+collection_+"&page="+board_paging+"&post_index="+board__data[i].post_index;
            count_++;
          }
          if(board_count < post_length && (count_ == board_count) && is_ok){
            is_ok = false;
            callback(data);
            return false;
          }
          if((count_ == post_length) && is_ok){
            is_ok = false;
            callback(data);
            return false;
          }
        }
      });
    });
  }
}
