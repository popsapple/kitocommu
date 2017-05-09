Board =  new Object(); // Member란 전부를 한꺼번에 가진 정의.
Board.write = function(info,request,response,mongoose,type){
  console.log("STEP 02 ::");
  var save_data = new global.BOARD_DB.BoardDbSetting(mongoose,request,response);
  save_data = global.BOARD_DB.model;
  save_data = new save_data(save_data.schema);
  console.log("STEP 03 ::");
  for(var key in info){ // 값이 들어온 만큼...
    console.log("STEP 04 ::");
    save_data[key] = info[key];
  }

  // 디비를 갖고 온 후에 사용할 메서드 - 나중에 스팸방지 달 때 쓰자
  // var save_data_ = new global.BOARD_DB.BoardMethod(save_data,mongoose,request,response);
  save_data.writer = '관리자입니다'; //request.session.nickname;
  save_data.writed = new Date();
  //save_data.updated = new Date();
  save_data.save(function(err){
    if(err){
        console.error(err);
        request.json({result: 0});
        console.log("에러입니다");
        return;
    }
    console.log("STEP 05 ::");
    response.render('board/write_ok',save_data);
  });
}

module.exports.board_con = function(app,mongoose){
  global.BOARD_DB = require('./board_db.js');

  app.get('/board/write', function(request, response) {
    console.log("STEP 00 ::");
    //MemberIntroduce
    var data = request.query;
    response.render('board/write',data);
  });

  app.post('/board_write', function(request, response) {
    console.log("STEP 01 ::");
  //  Board.write(request.body,request,response,mongoose);
  });
}
