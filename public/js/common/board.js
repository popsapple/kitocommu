var BoradWriteUnloadUrl;

function BoardViewHtmlDecode() {
  console.log("BoardViewHtmlDecode");
  var txt = $("<textarea></textarea>");
  txt.html($("#BoardViewContents").html());
  var text_ = txt.val();
  $("#BoardViewContents").html(text_);
  $("#BoardViewContents").addClass("active");
}

$(document).ready(function(){
  $('#BoardThumnailButton').on('click',function(){
    $('#ajaxform').ajaxForm({
      url: "/upload_thumnail",
      enctype: "multipart/form-data", // url과 enctype은 꼭 필요하다
      success: function(result){
        result_path = result.replace(/\"/gi, "").replace(/\'/gi, "");
        $("#BoardThumnailValue").val(result_path);
        alert("파일이 정상적으로 업로드 되었습니다. ::: "+result_path);
      },error: function(err){
        alert("파일이 업로드되지 않았습니다. 다시한번 업로드 부탁 드립니다.");
      }
     });

     $("#ajaxform").submit();
  });

  $("#BoardSaveButton").on('click',function(){  // 글작성 버튼 누를시
    $(window).unbind('beforeunload');
    $("#BoardWriteForm").submit();
  });

  $("#BoardModifyButton").on('click',function(){  // 글수정 버튼 누를시
    $(window).unbind('beforeunload');
    $("#BoardWriteForm").submit();
  });

  (function(){
    BoardViewHtmlDecode(); //DB에서 끌고온 내용 html 화
  })();

  $("#BoardCategory").attr('data-value') ? $("#BoardCategory").val($("#BoardCategory").attr('data-value')) : $("#BoardCategory").val($("#BoardCategory").find(' option').eq(0).attr('value'));
  $("#BoardNotice").val() == "on" ? $("#BoardNotice").attr("checked", true) : '';
  $(".CommentSecret").each(function(){
    if($(this).attr('data-value') == "on"){
      $(this).attr("checked", true);
    }
  });

  BoardFileInput();

  BoardSubmitButton();
});

var BoradWriteFileDelete = function(is_remove_post_){
  //파일삭제 관련
  var post_idx;
  $("#BoardPostIdx") ? post_idx = $("#BoardPostIdx").val() : '';
  $("#RemovePostIdx") ? post_idx = $("#RemovePostIdx").val() : '';

  $.ajax({
    type: "POST",
    url: "/upload_file_delete",
    async: true,
    data: JSON.stringify({
      "is_remove_post": is_remove_post_,
      "post_index": post_idx
    }),
    contentType: "application/json",
    success: function(data) {
      return true;
    },
    error: function(data) {
      console.log("Error!!!!!!!!!!!!");
      return false;
    }
  });
};

var BoradWriteUnloadEvent = function(){
  window.confirm("이 페이지를 넘어가시면 작성중인 내용은 저장되지 않습니다. 페이지를 넘어가시려면 확인 버튼을 눌러주세요.");
  BoradWriteFileDelete("writing"); // 작성중일 때 파일삭제
};

var BoardFileInput = function(){
  $("form.file_form").each(function(){
    var obj = $(this);
    var pattern = /[^\\]+[\.\w]+/g;
    obj.find(" > button").click(function(){
      obj.find(".file_input").trigger('click');
    });
    obj.find(".file_input").on("change",function(){
      var count = 0;
      var val = $(this).val().match(pattern);
      obj.find(" > label").html(val[val.length-1]);
    });
  });
}


var BoardSubmitButton = function(){
  $('.submit_btn').click(function(){
    if($(this).attr('data-form-id') == 'PostDeleteForm'){
      BoradWriteFileDelete('remove');
    }
    $('#'+$(this).attr('data-form-id')).submit();
  });
}
