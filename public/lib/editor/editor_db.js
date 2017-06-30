exports = module.exports = { UploadFile : function (upload_callback,s3,req,res,obj){
      console.log("업로드 실행");
      upload_callback(req, res, function (err) {

        if (err) {
          // 업로드 에러시
          console.log("업로드 에러 :: "+err);
          return;
        }

        var filePath = req.file.location;
        obj.file_listing(req,filePath);  // 수정중인 첨부파일 리스트 편집.
        console.log("업로드 파일 위치 :: "+filePath);
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
    }, UploadThumnailFile : function (thumnail_upload_callback,s3,req,res,obj) {
      thumnail_upload_callback(req, res, function (err) {
        if (err) {
          console.log("업로드 에러 :: "+err);
          return;
        }
        var filePath;
        for(var key in req.file){
          filePath = req.file.location;
        };

        obj.file_listing(req,filePath);  // 수정중인 첨부파일 리스트 편집.

        var html;
        html ="\""+filePath+"\"";
        res.send(html);
      });
    }, FileDelete : function (s3,req,res,obj) {
      var remove_item;
      var post_idx;
      var count = 0;
      var RemovingFile = function() {
        for(var key in remove_item){
        (function(){
          var pattern = /(\/(\w+))/g;
          var remove_item_key = remove_item[key].match(pattern);
          if(!remove_item_key){
            return;
          }
          remove_item_key = remove_item_key[1];

          remove_item_key = remove_item_key.substring(1,remove_item_key.length);

          var params = {
            Bucket: 'kitocommu',
            Key: remove_item_key
          };
          s3.deleteObject(params, function(err, data) {
            if (err) {
              console.log("삭제가 안 되었음"+err+" :: "+err.stack); // 에러시 표시
              return false;
            }
            else {

            }
          });
          count++;
        })();
      }
    };
    if(req.body.is_remove_post == "writing"){
      remove_item = req.session.filelist; // 작성중인걸 삭제할때
      RemovingFile();
    }
    else{ // 이미 작성되어있는걸 삭제할때
      var BOARD_DB_MODEL = global.BOARD_DB.model;
      var BOARD_DB_MODEL_SCHEMA = global.BOARD_DB.model.schema.paths;
      post_idx = req.body.post_index;

      BOARD_DB_MODEL.findOne({post_index: post_idx}, function(err,board){
        if(board){
          remove_item = board.file_list.split(',');
          if(remove_item.length > 0){
            RemovingFile();
          }
        }

      });
    }
  }
}
