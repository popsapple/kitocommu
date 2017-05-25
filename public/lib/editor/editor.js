module.exports.editor_con = function(app,aws,multer,multerS3,fs){
  global.EDITOR_FUNCTION = require('./editor_db.js');

  var obj = this;

  obj.file_listing = function(req,filePath) { // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.

    obj.filelist = req.session.filelist;

    obj.filelist.push(filePath);
    for(key in obj.filelist){
      if(obj.filelist.hasOwnProperty(key)){
      }
    }
  };
  aws.config.update({
      secretAccessKey: process.env.AWSID,
      accessKeyId: process.env.AWSKEY,
      region: 'ap-northeast-2',
      endpoint: 's3.ap-northeast-2.amazonaws.com',
      signatureVersion: 'v4'
  });

  var s3 = new aws.S3();
  var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'kitocommu'
    }),
    onFileUploadStart: function (file) {
      if (file.extension == 'exe' || file.extension == 'html' || file.extension == 'htm' || file.extension == 'php' || file.extension == 'php3' || file.extension == 'php4' || file.extension == 'phtml' || file.extension == 'phps' || file.extension == 'in' || file.extension == 'cgi' || file.extension == 'pi' || file.extension == 'shtml' || file.extension == 'jsp' || file.extension == 'asp' || file.extension == 'js') {
        response.send("<script>alert('해당 확장자의 파일은 업로드하실 수 없습니다.');</script>");
        return false;
      };
    }
  });

  var upload_callback = upload.single('upload');
  app.post('/upload', function(req, res, next) {
    var UploadFile = new global.EDITOR_FUNCTION.UploadFile(upload_callback,s3,req,res,obj);
  });

  var thumnail_upload_callback = upload.single('thumnailfile'); // 실제 input에 있는 name이랑 이름이 같아야 함
  app.post('/upload_thumnail', function(req, res, next) {
    var UploadThumnailFile = new global.EDITOR_FUNCTION.UploadThumnailFile(thumnail_upload_callback,s3,req,res,obj);
  });

  app.post('/upload_file_delete', function(req, res, next) {
    var FileDelete = new global.EDITOR_FUNCTION.FileDelete(s3,req,res);
  });
}
