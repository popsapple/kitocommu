module.exports.editor_con = function(app,aws4,multer,multerS3,fs){
  global.EDITOR_FUNCTION = require('./editor_fun.js');
  var UploadFile = new global.EDITOR_FUNCTION.UploadFile(app,aws4,multer,multerS3,fs);

  app.get('/board/write', function(request, response) {
    //MemberIntroduce
    response.render('board/write');
  });
}
