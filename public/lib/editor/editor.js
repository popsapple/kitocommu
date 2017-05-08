module.exports.editor_con = function(app,aws,multer,multerS3,fs,s3){
  global.EDITOR_FUNCTION = require('./editor_fun.js');
  var UploadFile = new global.EDITOR_FUNCTION.UploadFile(app,aws,multer,multerS3,fs,s3);

  app.get('/board/write', function(request, response) {
    //MemberIntroduce
    response.render('board/write');
  });
}
