exports = module.exports = { UploadFile : function (app,aws,multer,multerS3,fs){
  //var uploadSetting = multer({dest:"../upload"});
  aws.config.update({
      secretAccessKey: 'gO/NS90rJJ/ZQSQsurEn2U9Tiqn3Af029PEFMMbl',
      accessKeyId: 'AKIAI3NXS4PH4Y3ZWJ6A',
      region: 'ap-northeast-2',
      endpoint: 's3.ap-northeast-2.amazonaws.com',
      signatureVersion: 'v4'
  });

  var s3 = new aws.S3();
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'kitocommu'
      })
    })
    var upload_callback = upload.single('upload');
    app.post('/upload', function(req, res, next) {
      upload_callback(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          return;
        }
        var filePath = req.file.location;
        for(var key in req.file){
        };
        var html;
        html = "";
        html += "<script type='text/javascript'>";
        html += " var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += " var url ="+"\""+filePath+"\""+ ";";
        html += " var message = \"업로드 완료\";";
        html += " window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
        html += "</script>";
        res.send(html);
      });
    });
  }
}
