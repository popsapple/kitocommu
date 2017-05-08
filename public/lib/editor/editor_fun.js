exports = module.exports = { UploadFile : function (app,multer,multerS3,fs){
    //var uploadSetting = multer({dest:"../upload"});
    var s3 = new aws.S3({});

    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: 'kitocommu'
      })
    })

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

      var tmpPath = req.file.path;
      var fileName = req.file.filename;
      var newPath = "../public/images/" + fileName;
      fs.rename(tmpPath, newPath, function (err) {
        if (err) {
          console.log(err);
        }
        var html;
        html = "";
        html += "<script type='text/javascript'>";
        html += " var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += " var url = \"/images/" + fileName + "\";";
        html += " var message = \"업로드 완료\";";
        html += " window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
        html += "</script>";
        res.send(html);
      });
    });
  }/*,
  MemberDbSetting  : function (){

  }*/
}
