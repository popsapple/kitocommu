module.exports.editor_con = function(app,aws,multer,multerS3,fs){
  global.EDITOR_FUNCTION = require('./editor_fun.js');
  var UploadFile = new global.EDITOR_FUNCTION.UploadFile(app,aws,multer,multerS3,fs);

  /*app.get('/board/write', function(request, response) {
    //MemberIntroduce
    response.render('board/write');
  });*/
  app.get('/board/write?new_post=true&board_table_id=MemberIntroduce', function(request, response) {
    //MemberIntroduce
    var data = request.query;
    response.render('board/write',data);
  });
}
