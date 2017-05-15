Board =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Board.write = function(info,request,response,mongoose,collection,type){
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  save_data = global.BOARD_DB.model;
  if(type=='save'){
    save_data = new save_data(save_data.schema);
  }
  save_data.reply = "";
  save_data.category = info.category;
  save_data.is_notice = info.is_notice;
  save_data.title = info.title;
  save_data.contents = info.contents;
  save_data.tags = info.tags;
  save_data.writer = 'request.session.nickname'; //request.session.nickname;
  info.thumnail ? save_data.thumnail = info.thumnail : '';
  save_data.writed = new Date();
  // 디비에 있는 내용을 확인하고 저장해야 하므로 save 함수를 콜백으로 넘깁니다.
  function SaveFunction(save_data,type){
    if(type=='save'){
      save_data.save(function(err){
        if(err){
            console.error(err);
            request.json({result: 0});
            return;
        }
        response.render('board/write_ok',save_data);
      });
    } else {
        var request_list;
        if (request.query.post_index){
          request_list = request.query;
        }else {
          request_list = request.body;
        }
        var post_index_ = request_list.post_index;

        save_data.findOne({post_index: post_index_}, function(err, data){
        data.post_index = request_list.post_index;
        data.category = request_list.category;
        data.is_notice = request_list.is_notice;
        data.title = request_list.title;
        data.contents = request_list.contents;
        data.tags = request_list.tags;
        request_list.thumnail ? data.thumnail = request_list.thumnail : '';

        data.save(function(err){
          if(err){
              request.json({result: 0});
              return;
          }
          response.render('board/write_ok',data);
        });
      });
    }
  };

  if(type=='save'){
    global.BOARD_DB.setBoardSortIndex(save_data,mongoose,request,response);
  }
  var save_data_ = new global.BOARD_DB.getBoardLastIndex(save_data,mongoose,request,response,function(save_data,type){
    SaveFunction(save_data,type);
  });
}

Board.list_render = function(info,request,response,mongoose,collection){
  function PagingFunction(obj,mongoose,request,response){
    var read_data_ = new global.BOARD_DB.getBoardPagingByIndex(obj,mongoose,request,response);
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

module.exports.board_con = function(app,mongoose){
  global.BOARD_DB = require('./board_db.js');
  console.log("SETP00 :::::::::::");
  app.get('/board/list', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.list_render(request.query,request,response,mongoose,board_id);
  });

  app.get('/board/search_post', function(request, response) {
    var board_id = 'Board_'+(request.query.board_table_id);
    Board.search_render(request.query,request,response,mongoose,board_id);
  });

  app.post('/board/write', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    console.log("SETP01 :::::::::::");
    if(request.body.post_index){
      console.log("SETP02111111 :::::::::::");
      Board.view(request.body,request,response,mongoose,board_id,'modify');
    }else{
      console.log("SETP02 :::::::::::");
      global.BOARD_DB.getBoardConfig(mongoose,request,response,board_id,data,function(data){
        console.log("SETP03 :::::::::::"+data.list_type);
        response.render('board/write',data);
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

  app.post('/board_modify_submit', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    Board.write(request.body,request,response,mongoose,board_id,'modify');
  });

  app.post('/board_remove_submit', function(request, response) {
    var board_id = 'Board_'+(request.body.board_table_id);
    Board.remove(request.body,request,response,mongoose,board_id);
  });
}
