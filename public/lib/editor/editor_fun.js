exports = module.exports = { UploadFile : function (app,aws,multer,multerS3,fs){
  //var uploadSetting = multer({dest:"../upload"});
  var s3 = new aws.S3();
  aws.config.update({
      secretAccessKey: 'gO/NS90rJJ/ZQSQsurEn2U9Tiqn3Af029PEFMMbl',
      accessKeyId: 'AKIAI3NXS4PH4Y3ZWJ6A',
      region: 'Asia Pacific (Seoul)'
  });

  console.log("SETP01 ::");
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'kitocommu'
      })
    })
    console.log("SETP02 ::");
    app.post('/upload', upload.single('upload'), function(req, res, next) {
      /*var html;
      html = "";
      html += "<script type='text/javascript'>";
      html += " var funcNum = " + req.query.CKEditorFuncNum + ";";
      html += " var url = \"/images/" + fileName + "\";";
      html += " var message = \"업로드 완료\";";
      html += " window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
      html += "</script>";
      res.send(html);*/

      var filePath = req.file.path;
      var fileName = req.file.filename;
      console.log("SETP03 ::"+filePath);
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
