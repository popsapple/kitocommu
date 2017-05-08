module.exports.editor_con = function(app,multer,fs){
  global.EDITOR_FUNCTION = require('./editor_fun.js');
  var UploadFile = new global.EDITOR_FUNCTION.UploadFile(app,multer,multerS3,fs);
}
