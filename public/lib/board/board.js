Board =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Board.write = function(info,request,response,mongoose,collection,type,type_reply){

  var that = this;
  this.save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  this.save_data = global.BOARD_DB.model;
  this.save_item = function(info){
    that.save_data.reply = "";
    that.save_data.category = info.category;
    that.save_data.is_notice = info.is_notice;
    that.save_data.title = info.title;
    that.save_data.contents = info.contents;
    that.save_data.tags = info.tags;
    that.save_data.board_table_id = info.board_table_id;
    that.save_data.writer = request.session.userid;
    that.save_data.writer_nickname = request.session.nickname;
    info.thumnail ? this.save_data.thumnail = info.thumnail : '';
    info.is_secret ? that.save_data.is_secret = "on" : that.save_data.is_secret = "no";
    request.session.filelist ? that.save_data.file_list = request.session.filelist : '';
    that.save_data.writed = new Date();
  }
  this.modify_item = function(data,info,request_list){
    data.board_table_id = info.board_table_id;
    data.post_index = request_list.post_index;
    data.category = request_list.category;
    data.is_notice = request_list.is_notice;
    data.title = request_list.title;
    data.contents = request_list.contents;
    data.tags = request_list.tags;
    data.file_list = (function(){ // 기존에 있던 내용과 새로운 filelist랑 합침
      var list = data.file_list;
      var i;
      if(list){
        list = list.split(',');
        i = list.length;
      }else {
        list = [];
        i = 0;
      }
      for (var key in request.session.filelist){
        if(request.session.filelist[key] == ''){
          continue;
        }
        list[i] = request.session.filelist[key];
        i++;
      }
      return list;
    })();
    request_list.thumnail ? data.thumnail = request_list.thumnail : '';
  }


  if(type_reply != "reply"){
    global.BOARD_DB.onSaveBoardPost(that,info,request,response,mongoose,collection,type);
  }

  return this;
}

Board.list_render = function(info,request,response,mongoose,collection){
  function PagingFunction(obj,mongoose,request,response){
    global.BOARD_DB.getBoardListByNotice(obj,mongoose,request,response,function(obj,mongoose,request,response){
      global.BOARD_DB.getBoardPagingByIndex(obj,mongoose,request,response);
    });
  }
  global.BOARD_DB.BoardReplyDbSetting(mongoose,request,response,'Board_ReplyList');
  this.DbSetting = global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  this.getBoardList = global.BOARD_DB.getBoardListByIndex(mongoose,request,response,function(obj,mongoose,request,response){
    PagingFunction(obj,mongoose,request,response);
  });
}

Board.view = function(info,request,response,mongoose,collection,type){
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  var save_data_ = new global.BOARD_DB.getBoardPostByIndex(mongoose,request,response,collection,type);
}

Board.remove = function(info,request,response,mongoose,collection){
  this.DbSetting = global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  this.Remove = global.BOARD_DB.onRemoveBoardPost(mongoose,request,response,collection);
}

Board.search_render = function(info,request,response,mongoose,collection){
  function PagingFunction(obj,mongoose,request,response,board_post_length){
    var read_data_ = new global.BOARD_DB.getBoardPagingByIndex(obj,mongoose,request,response,'search',board_post_length);
  }
  var read_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  var read_data_ = new global.BOARD_DB.getBoardListBySearch(read_data,mongoose,request,response,function(obj,mongoose,request,response){
    PagingFunction(obj,mongoose,request,response,read_data.board_post_length);
  });
}

Board.write_coments = function(request,response,mongoose){
  global.BOARD_DB.BoardCommentSave(mongoose,request,response);
};

module.exports.board_con = function(app,mongoose){
  global.BOARD_DB = require('./board_db.js');
  app.get('/board/list', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      request.session.urlpath = request.protocol + '://' + request.get('host') + request.originalUrl;
      var board_id = 'Board_'+(request.query.board_table_id);
      var BoardList = new Board.list_render(request.query,request,response,mongoose,board_id);
    }
  });

  app.get('/board/search_post', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.search_render(request.query,request,response,mongoose,board_id);
  });

  app.get('/board/write', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      request.session.urlpath = request.protocol + '://' + request.get('host') + request.originalUrl;
      var board_id = 'Board_'+(request.query.board_table_id);
      request.session.filelist = []; // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.

      if(request.query.post_index){
        Board.view(request.query,request,response,mongoose,board_id,'modify');
      }else{
        global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(data,req_data){
          for (var key in req_data){
            data[key] = req_data[key];
          }
          data.is_reply = "no";
          if(request.query.reply_table_id){
            request.query.reply_table_id ? data.reply_table_id = request.query.reply_table_id : "";
          }else if(request.body.reply_table_id){
            request.body.reply_table_id ? data.reply_table_id = request.body.reply_table_id : "";
          }
          data.category_list ? data.category_list = data.category_list.split(",") : '';
          var captcha = global.svgCaptcha.create();
          data.captcha_img = captcha.data;
          data.captcha_data = captcha.text;
          request.session.captcha_data = data.captcha_data.toString();
          return response.render('board/write',data);
        });
      }
    }
  });

  app.get('/board/view', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      var board_id = 'Board_'+(request.query.board_table_id);
      Board.view(request.query,request,response,mongoose,board_id);
    }
  });

  app.post('/board_write_submit', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      if(request.body.captcha == request.session.captcha_data){
        var board_id = 'Board_'+(request.body.board_table_id);
        Board.write(request.body,request,response,mongoose,board_id,'save');
      }else{
        response.send("<script>location.href='"+request.session.urlpath+"';alert('스팸방지 코드를 다시 확인해주세요');</script>");
      }
    }
  });

  app.post('/board_reply_submit', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      if(request.body.captcha == request.session.captcha_data){
        Board.reply_write = new Board.write(request.body,request,response,mongoose,'Board_ReplyList','save','reply');
        Board.reply_write.save_data = new global.BOARD_DB.BoardReplyDbSetting(mongoose,request,response,'Board_ReplyList');
        Board.reply_write.save_data = global.BOARD_REPLY_DB;
        var info = request.body;
        Board.reply_write.save_item = function(info){
          Board.reply_write.save_data.reply = "";
          Board.reply_write.save_data.reply_index = info.reply_index;
          Board.reply_write.save_data.category = info.category;
          Board.reply_write.save_data.is_notice = info.is_notice;
          Board.reply_write.save_data.title = info.title;
          Board.reply_write.save_data.contents = info.contents;
          Board.reply_write.save_data.tags = info.tags;
          Board.reply_write.save_data.reply_table = info.board_table_id;
          Board.reply_write.save_data.board_table_id = info.board_table_id;
          Board.reply_write.save_data.writer = request.session.userid;
          Board.reply_write.save_data.writer_nickname = request.session.nickname;
          info.thumnail ? Board.reply_write.save_data.thumnail = info.thumnail : '';
          info.is_secret ? Board.reply_write.save_data.is_secret = "on" : Board.reply_write.save_data.is_secret = "no";
          request.session.filelist ? Board.reply_write.save_data.file_list = request.session.filelist : '';
          Board.reply_write.save_data.writed = new Date();
        }
        global.BOARD_DB.onSaveBoardPost(Board.reply_write,info,request,response,mongoose,'Board_ReplyList','save');
      }else{
        response.send("<script>location.href='"+request.session.urlpath+"';alert('스팸방지 코드를 다시 확인해주세요');</script>");
      }
    }
  });

  app.post('/board_modify_submit', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      if(request.body.captcha == request.session.captcha_data){
        var board_id = 'Board_'+(request.body.board_table_id);
        Board.write(request.body,request,response,mongoose,board_id,'modify');
      }else{
        response.send("<script>location.href='"+request.session.urlpath+"';alert('스팸방지 코드를 다시 확인해주세요');</script>");
      }
    }
  });

  app.post('/board_remove_submit', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      var board_id = 'Board_'+(request.body.board_table_id);
      var BoardRemove = new Board.remove(request.body,request,response,mongoose,board_id);
      BoardRemove.Remove.Removing();
    }
  });

  app.post('/board_comment_submit', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      Board.write_coments(request,response,mongoose);
    }
  });

  app.get('/board/reply_write', function(request, response) {
    if(global.MEMBER_DB.CheckLoginUser(request,response)){
      request.session.urlpath = request.protocol + '://' + request.get('host') + request.originalUrl;
      var board_id = 'Board_'+(request.query.board_table_id);
      request.session.filelist = []; // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.

      if(request.query.post_index && (!request.query.is_reply)){
        Board.view(request.query,request,response,mongoose,board_id,'modify');
      }else{
        global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(data,req_data){
          for (var key in req_data){
            data[key] = req_data[key];
          }
          data.category_list ? data.category_list = data.category_list.split(",") : '';
          data.is_reply = request.query.is_reply;
          data.reply_index = request.query.post_index;
          if(request.query.reply_table_id){
            request.query.reply_table_id ? data.reply_table_id = request.query.reply_table_id : "";
          }else if(request.body.reply_table_id){
            request.body.reply_table_id ? data.reply_table_id = request.body.reply_table_id : "";
          }

          var captcha = global.svgCaptcha.create();
          data.captcha_img = captcha.data;
          data.captcha_data = captcha.text;
          request.session.captcha_data = data.captcha_data.toString();

          return response.render('board/write',data);
        });
      }
    }
  });
}
