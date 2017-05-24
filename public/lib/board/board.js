Board =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Board.write = function(info,request,response,mongoose,collection,type){
  var type = type;
  var that = this;
  this.save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  this.save_data = global.BOARD_DB.model
  this.Save = function(info,request,response,mongoose,collection,type){
      if(type=='save'){
        that.save_data = new save_data(that.save_data.schema);
      }
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
      // 디비에 있는 내용을 확인하고 저장해야 하므로 save 함수를 콜백으로 넘깁니다.
      function SaveFunction(save_data,type){
        if(type=='save'){
          that.save_data.save(function(err){
            if(err){
                console.error(err);
                request.json({result: 0});
                return;
            }
            return response.render('board/write_ok',save_data);
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
          // += (","+request.session.filelist) : '';
          request_list.thumnail ? data.thumnail = request_list.thumnail : '';

          data.save(function(err){
            if(err){
                request.json({result: 0});
                return;
            }
            return response.render('board/write_ok',data);
          });
        });
      }
    }

    if(type=='save'){
      global.BOARD_DB.setBoardSortIndex(that.save_data,mongoose,request,response);
    }

    global.BOARD_DB.getBoardLastIndex(that.save_data,mongoose,request,response,function(){
      SaveFunction(that.save_data,type);
    });
  };

  if(type != "reply"){
    that.Save(info,request,response,mongoose,collection,type);
  }
}

Board.list_render = function(info,request,response,mongoose,collection){
  function PagingFunction(obj,mongoose,request,response){
    var read_data_ = new global.BOARD_DB.getBoardListByNotice(obj,mongoose,request,response,function(obj,mongoose,request,response){
      new global.BOARD_DB.getBoardPagingByIndex(obj,mongoose,request,response);
    });
  }
  var read_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  var read_data_ = new global.BOARD_DB.getBoardListByIndex(read_data,mongoose,request,response,function(obj,mongoose,request,response){
    PagingFunction(obj,mongoose,request,response);
  });
}

Board.view = function(info,request,response,mongoose,collection,type){
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  var save_data_ = new global.BOARD_DB.getBoardPostByIndex(mongoose,request,response,collection,type);
}

Board.remove = function(info,request,response,mongoose,collection){
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  var save_data_ = new global.BOARD_DB.onRemoveBoardPost(mongoose,request,response,collection);
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
    if(!request.session || !request.session.nickname){
      response.redirect('/member/plz_login');
    }
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.list_render(request.query,request,response,mongoose,board_id);
  });

  app.get('/board/search_post', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.search_render(request.query,request,response,mongoose,board_id);
  });

  app.get('/board/write', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    request.session.filelist = []; // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.

    if(request.query.post_index){
      Board.view(request.query,request,response,mongoose,board_id,'modify');
    }else{

      global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(data,req_data){
        for (var key in req_data){
          data[0][key] = req_data[key];
        }
        return response.render('board/write',data[0]);
      });
    }
  });

  app.get('/board/view', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.view(request.query,request,response,mongoose,board_id);
  });

  app.post('/board_write_submit', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    Board.write(request.body,request,response,mongoose,board_id,'save');
  });

  app.post('/board_reply_submit', function(request, response) {
    var board_id = 'Board_ReplyList';
    Board.reply_write = new Board.write(request.body,request,response,mongoose,board_id,'save');
    Board.reply_write.save_data = new global.BOARD_DB.BoardReplyDbSetting(mongoose,request,response,collection);
    Board.reply_write.save_data = global.BOARD_REPLY_DB.model;
    Board.reply_write.Save();
  });

  app.post('/board_modify_submit', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    Board.write(request.body,request,response,mongoose,board_id,'modify');
  });

  app.post('/board_remove_submit', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    Board.remove(request.body,request,response,mongoose,board_id);
  });

  app.post('/board_comment_submit', function(request, response) {
    Board.write_coments(request,response,mongoose);
  });

  app.get('/board/reply', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    request.session.filelist = []; // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.

    if(request.query.post_index){
      Board.view(request.query,request,response,mongoose,board_id,'modify');
    }else{
      global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,request.query,function(data,req_data){
        for (var key in req_data){
          data[0][key] = req_data[key];
        }
        data[0].is_reply = "yes";
      //  data[0].post_index = '';
        data[0].reply_index = request.query.post_index;
        return response.render('board/write',data[0]);
      });
    }
  });
}
