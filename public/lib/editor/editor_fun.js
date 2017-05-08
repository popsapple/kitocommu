exports = module.exports = { UploadFile : function (){
    var uploadSetting = multer({dest:"../upload"});
    router.post('/upload', uploadSetting.single('upload'), function(req,res) {
    var tmpPath = req.file.path;
    var fileName = req.file.filename;
    var newPath = "../public/uploads/" + fileName;
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
