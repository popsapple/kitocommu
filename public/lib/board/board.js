Board =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Board.write = function(info,request,response,mongoose,collection){
  console.log("STEP 02 ::");
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response,collection);
  save_data = global.BOARD_DB.model;
  save_data = new save_data(save_data.schema);

  save_data.reply = "";
  save_data.category = info.category;
  save_data.is_notice = info.is_notice;
  save_data.title = info.title;
  save_data.contents = info.contents;
  save_data.tags = info.tags;
  save_data.writer = '관리자입니다'; //request.session.nickname;
  save_data.writed = new Date();
  console.log("STEP01 ::::");
  // 디비에 있는 내용을 확인하고 저장해야 하므로 save 함수를 콜백으로 넘깁니다.
  function SaveFunction(save_data){
    save_data.save(function(err){
      if(err){
          console.error(err);
          request.json({result: 0});
          console.log("에러입니다");
          return;
      }
      response.render('board/write_ok',save_data);
    });
  };

  var save_data_ = new global.BOARD_DB.getBoardLastIndex(save_data,mongoose,request,response,'save',function(save_data){
    SaveFunction(save_data);
  });
}

module.exports.board_con = function(app,mongoose){
  global.BOARD_DB = require('./board_db.js');

  app.get('/board/write', function(request, response) {
    //MemberIntroduce
    var data = request.query;
    response.render('board/write',data);
  });

  app.post('/board_write_submit', function(request, response) {
    Board.write(request.body,request,response,mongoose,'Board_MemberIntroduce');
  });
}
