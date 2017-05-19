function BoardViewHtmlDecode (input,callback) {
  console.log("BoardViewHtmlDecode");
  var txt = document.createElement("textarea");
  txt.innerHTML = input;
  callback(txt.value);
}

$(document).ready(function(){
  $('#BoardThumnailButton').on('click',function(){
    $('#ajaxform').ajaxForm({
      url: "/upload_thumnail",
      enctype: "multipart/form-data", // url과 enctype은 꼭 필요하다
      success: function(result){
        alert("파일이 정상적으로 업로드 되었습니다.");
        $("#BoardThumnailValue").val(result);
      },error: function(err){
        alert("파일이 업로드되지 않았습니다. 다시한번 업로드 부탁 드립니다.");
      }
     });

     $("#ajaxform").submit();
  });

  $("#BoardSaveButton").on('click',function(){  // 글작성 버튼 누를시
    BoradWritePage['is_beforeunload'] = false;  // 글작성 버튼 누를시 페이지가 안 넘어게가끔 이걸로 조정
    $("#BoardWriteForm").submit();
  });

  $("#BoardViewContents").on('load',function(){
    console.log("BoardViewContents 로딩");
    var info = $(this).html();
    BoardViewHtmlDecode(info,function(html){
      console.log("BoardViewContents 컨텐츠 변화");
      $(this).html(html);
    };
  });

});

BoradWritePage.onFileDelete = function(is_remove_post_con){
  //파일삭제 관련
  $.ajax({
    type: "POST",
        url: "/upload_file_delete",
        data: JSON.stringify({
          "is_remove_post": is_remove_post_con
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

var BoradWritePage = {'is_beforeunload':true}; // 글작성 버튼 누를시 페이지가 안 넘어게가끔 이걸로 조정
$(window).on('beforeunload', function(event) {
  if(BoradWritePage['is_beforeunload']){
    var is_ok = confirm("이 페이지를 넘어가시면 작성중인 내용은 저장되지 않습니다. 페이지를 넘어가시려면 확인 버튼을 눌러주세요.");
    if(is_ok){
      var is_ok_ = false;
      is_ok_ = BoradWritePage.onFileDelete("writing"); // 파일삭제
      return is_ok_; //파일삭제 완료 후 페이지 넘어가게끔...
    }else{
    //  event.stopPropagation();
    //  event.preventDefault();
      return is_ok;
    }
  }
});
