$(document).ready(function(){
  $('#BoardThumnailButton').on('click',function(){
    $('#ajaxform').ajaxForm({
      url: "/upload_thumnail",
      enctype: "multipart/form-data", // 여기에 url과 enctype은 꼭 지정해주어야 하는 부분이며 multipart로 지정해주지 않으면 controller로 파일을 보낼 수 없음
      success: function(result){
        alert(result);
      }
     });

     $("#ajaxform").submit();
  });
});
