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

  console.log("SETP01 ::");
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'kitocommu'
      })
    })
    var upload_callback = upload.single('upload');
    console.log("SETP02 ::");
    app.post('/upload', function(req, res, next) {
      upload_callback(req, res, function (err) {
        if (err) {
          // An error occurred when uploading
          return;
        }
        var filePath = req.file.path;
        var fileName = req.file.filename;
        for(var key in req.query){
          console.log("SETP03 ::"+key);
          console.log("SETP03 == ::"+req.query[key]);
        };
        console.log("==============================================");
        for(var key in req.files){
          console.log("SETP04 ::"+key);
          console.log("SETP04 == ::"+req.files[key]);
        };
        console.log("==============================================");
        for(var key in req.body){
          console.log("SETP05 ::"+key);
          console.log("SETP05 == ::"+req.body[key]);
        };
        console.log("==============================================");
        for(var key in req.file){
          console.log("SETP06 ::"+key);
          console.log("SETP06 == ::"+req.file[key]);
        };
        console.log("==============================================");
        for(var key in req){
          console.log("SETP07 ::"+key);
          console.log("SETP07 == ::"+req[key]);
        };
        var html;
        html = "";
        html += "<script type='text/javascript'>";
        html += " var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += " var url ="+filePath+"/"+fileName;
        html += " var message = \"업로드 완료\";";
        html += " window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
        html += "</script>";
        res.send(html);
      });
    });
  }
}
