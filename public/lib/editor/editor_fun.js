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
    console.log("SETP02 ::");
    app.post('/upload', upload.single('upload'), function(req, res, next) {
      app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyParser({keepExtensions:true,uploadDir:path.join(__dirname,'/files'}));
      });

      var filePath = req.file.path;
      var fileName = req.file.filename;
      for(var key in req.query){
        console.log("SETP03 ::"+key);
        console.log("SETP03 == ::"+req.query[key]);
      };
      for(var key in req.file){
        console.log("SETP04 ::"+key);
        console.log("SETP04 == ::"+req.query[key]);
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
  }/*,
  MemberDbSetting  : function (){

  }*/
}
