module.exports.editor_con = function(app,aws,multer,multerS3,fs){
  global.EDITOR_FUNCTION = require('./editor_fun.js');
  var UploadFile = new global.EDITOR_FUNCTION.UploadFile(app,aws,multer,multerS3,fs);

  app.get('/board/write?board_id=MemberIntroduce', function(request, response) {
    //MemberIntroduce
    var data ='';
    response.render('board/write', data);
  });
}
