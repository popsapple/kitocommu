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
  },getBoardConfig : function (mongoose,request,response,board_id,config,callback){
    var Schema = mongoose.Schema;

    var BoardConfigSchema = new Schema({
      board: String,
      list_type:  String,
      is_comment:  String,
      is_reply:  String,
      css_skin:  String,
      category_list:  String
    }, { collection: 'Board_Typelist' });

    mongoose.models = {};
    mongoose.modelSchemas = {};
    var BOARD_STYLE_MODEL = mongoose.model('board_type_list', BoardConfigSchema);
    BOARD_STYLE_MODEL.find({board: board_id}, function(err,board_config){
      callback(board_config,config);
    });
  },getBoardLastIndex : function (obj,mongoose,request,response,callback){

    var BOARD_DB_MODEL = global.BOARD_DB.model;
    BOARD_DB_MODEL.count({}, function(error, numOfDocs){
        obj.post_index = numOfDocs;
        // 동기적으로 실행해야 하므로 콜백으로 처리한 함수.
        callback(obj);
    });
  },setBoardSortIndex : function(obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var save_data = BOARD_DB_MODEL.find().update({$sort: { post_index: -1 }});
  },getBoardListByIndex : function (mongoose,request,response,callback){
    var that = this;
    that.db_model = global.BOARD_DB.model;
    that.db_reply_model = global.BOARD_REPLY_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    that.getListing = function(){
      that.db_model.count({}, function(error, numOfDocs){
        page_num = numOfDocs-(page_num*page_length);
        page_length = page_num-page_length+1;
        var data = {};
        function sortList(a, b) {
          if(a.post_index == b.post_index){ return 0} return  a.post_index > b.post_index ? -1 : 1;
        }
        that.db_model .find({post_index: { $gte: page_length, $lte: page_num }}, function(err, board){
          data.board_list = board;
          data.board_list.sort(sortList);
          data.page_ = request.query.page;
          callback(data,mongoose,request,response);
          that.db_reply_model.find({reply_index: { $gte: page_length, $lte: page_num }}, function(err, reply){
            console.log("리플을 잘 찾아 오는지");
            var that = this;
            var count = 0;
            var max_post_length = page_num-page_length+1;
            that.ReplyListing = function(count){
              console.log("ReplyListing 실행 :: "+count);
              var plus_count = count+1;
              count == max_post_length ? return false : that.ReplyListing(plus_count);
              if(data.board_list[count].post_index == reply[count].reply_index){
                data.board_list[count].reply_list ? '' : data.board_list[count].reply_list = [];
                console.log("정보는 잘 가져 오는지 ::"+reply[count].reply_index.title);
                if(data.board_list[count].reply_list[0] == ''){
                  data.board_list[count].reply_list[0] = reply[count].reply_index;
                }else{
                  data.board_list[count].reply_list.push(reply[count].reply_index);
                }
              };
            }();
          });
        });
      });
    }();
  },getBoardListBySearch : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_num = parseInt(request.query.page);
    var page_length = parseInt(request.query.page_length);
    var search_option = request.query.searchoption;
    var search_value = request.query.searchvalue;
    var search_hint;
    if(search_option == "title"){
      search_hint = {title: search_value};
    }else if(search_option == "tags"){
      search_hint = {tag: search_value};
    }else if(search_option == "writer"){
      search_hint = {writer_nickname: search_value};
    }else if(search_option == "category"){
      search_hint = {category: search_value};
    }
    page_num = page_num*page_length;
    page_length = page_num+page_length-1;
    var data = {};
    function sortList(a, b) {
      if(a.post_index == b.post_index){ return 0} return  a.post_index > b.post_index ? -1 : 1;
    }
    BOARD_DB_MODEL.find(search_hint, function(err, board){
      data.board_list = board;
      obj.board_post_length = data.board_list.length;
      data.board_list.sort(sortList);
      data.board_list = data.board_list.slice(page_num,page_length);
      data.page_ = request.query.page;
      data.searchoption = search_option;
      data.searchvalue = search_value;
      callback(data,mongoose,request,response);
    });
  },getBoardListByNotice : function (obj,mongoose,request,response,callback){
    var BOARD_DB_MODEL = global.BOARD_DB.model;
    var page_length = 5;
    var search_hint = {is_notice: "on"};
    function sortList(a, b) {
      if(a.post_index == b.post_index){ return 0} return  a.post_index > b.post_index ? -1 : 1;
    }
    BOARD_DB_MODEL.find(search_hint, function(err, board){
      obj.notice_list = board;
      obj.notice_list.sort(sortList);
      obj.notice_list = obj.notice_list.slice(0,page_length);
      callback(obj,mongoose,request,response);
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
        if(board_info_.is_secret == "on" && !board_info_.is_writer){
          var data = {};
          data.board_table_id = board_info_.board_table_id;
          return response.render('board/secret',data);
        }
        if(board_info_.is_comment == 'yes'){
          global.BOARD_DB.BoardCommentDbSetting(mongoose,request,response);
          var db_object = global.BOARD_COMMENT_MODEL;
          var post_index_ = board_info_.post_index;
          var board_table_id = request_list.board_table_id;
          db_object.find({post_index: post_index_, board_id: board_table_id}, function(err, comment){
            var finded_count;
            if(comment == undefined || comment.length == 0 || err) { // 댓글 없을 때
              return response.render('board/view',board_info_);
            }
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
                    if(i == (finded_count-1)){
                      return response.render('board/view',board_info_);
                    }else{
                      that.CheckFunction(i+1,that);
                    }
                  },'both_check');
                }
                var that = this;
                this.CheckFunction(i,that);
              });
            });
          });
        }else{
          return response.render('board/view',board_info_);
        }
      }
      if(type != 'modify'){
        global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,board,function(config){
          for (var key in config[0]){
            board_info_[key] = config[0][key];
          }
          board_info_.category_list = board_info_.category_list.split(",");

          global.MEMBERLIB.CheckAuthenfication(board.writer,request.session.userid,request,response,function(value_){
            board_info_.is_writer = value_;
            RenderViewpage(board_info_);
          },'both_check');
        });
      }else if(type == 'modify'){
        global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,board,function(config){
          for (var key in config[0]){
            board_info_[key] = config[0][key];
          }
          board_info_.category_list = board_info_.category_list.split(",");
          global.MEMBERLIB.CheckAuthenfication('',request.session.userid,request,response,function(value_){
            board_info_.is_admin = value_;
            board_info_.is_writer = value_;
            board_info_.is_reply = request.query.is_reply;
            return response.render('board/write',board_info_);
          },'check_admin');
        });
      }
    });
  },onRemoveBoardPost : function (mongoose,request,response,callback){
    var that = this;
    this.db_model = global.BOARD_DB.model;
    this.db = global.BOARD_DB;
    var page_num = request.body.post_index;
    var page_num_ = parseInt(page_num);
    var board_id = request.body.board_table_id;
    this.Removing = function(){
      that.db_model.remove({post_index: page_num}, function(err,board){
        that.db.BoardCommentDbSetting(mongoose,request,response);
        var db_object = global.BOARD_COMMENT_MODEL;
        var board_table_id = request.body.board_table_id;
        db_object.remove({post_index: page_num, board_id: board_table_id}, function(err, comment){});
        db_object.update({post_index: {$gte: page_num_}, board_id: board_table_id},{$inc:{post_index: -1 }},{ multi: true },function (error, obj){});
        that.db_model.update({post_index: {$gte: page_num_}},{$inc:{post_index: -1 }},{ multi: true },
        function (error, obj) {
          response.redirect("/board/list?board_table_id="+board_id+"&page=0&page_length=10");
        });
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
          return response.render('board/list',obj);
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          return response.render('board/list',obj);
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
        callback(obj);
      };
      if(page_num_ < (page_length_-1)){
        this.getCountArray(obj,'all',function(obj){
          return response.render('board/list',obj);
        });
      }else{
        this.getCountArray(obj,'',function(obj){
          return response.render('board/list',obj);
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
        request.body.is_secret ? save_data.is_secret = "on" : save_data.is_secret = "no";
        save_data.save(function(err){
          if(err){
              console.error("코멘트저장에러 :: "+err);
              request.json({result: 0});
              return;
          }
          response.redirect('/');
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
    }
}
