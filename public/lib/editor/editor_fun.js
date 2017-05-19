exports = module.exports = { UploadFile : function (app,aws,multer,multerS3,fs){
    var that = this;

    that.file_listing = function(req,filePath) { // 현재 작성중인 상태일 때 추가되는 첨부파일 리스트.
      if(!req.session.filelist){
        req.session.filelist = [];
      }
      that.filelist = req.session.filelist;

      that.filelist.push(filePath);
      for(key in that.filelist){
        if(filelist.hasOwnProperty(key)){
          console.log("SESSION FILES LIST :: KEY ::"+key+" :: VALUE :: "+that.filelist[key]);
        }
      }
    };

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
      }),
      onFileUploadStart: function (file) {
        if (file.extension == 'exe' || file.extension == 'html' || file.extension == 'htm' || file.extension == 'php' || file.extension == 'php3' || file.extension == 'php4' || file.extension == 'phtml' || file.extension == 'phps' || file.extension == 'in' || file.extension == 'cgi' || file.extension == 'pi' || file.extension == 'shtml' || file.extension == 'jsp' || file.extension == 'asp' || file.extension == 'js') {
          response.send("<script>alert('해당 확장자의 파일은 업로드하실 수 없습니다.');</script>");
          return false;
        };
      }
    })

    var upload_callback = upload.single('upload');
    app.post('/upload', function(req, res, next) {

      upload_callback(req, res, function (err) {
        if (err) {
          // 업로드 에러시
          return;
        }

        var filePath = req.file.location;
        that.file_listing(req,filePath);  // 수정중인 첨부파일 리스트 편집.

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

    var thumnail_upload_callback = upload.single('thumnailfile'); // 실제 input에 있는 name이랑 이름이 같아야 함
    app.post('/upload_thumnail', function(req, res, next) {
      thumnail_upload_callback(req, res, function (err) {
        if (err) {
          return;
        }
        var filePath;
        for(var key in req.file){
          filePath = req.file.location;
        };

        that.file_listing(req,filePath);  // 수정중인 첨부파일 리스트 편집.

        var html;
        html ="\""+filePath+"\"";
        res.send(html);
      });
    });
  }
}
