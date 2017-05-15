$(document).ready(function(){
  $('#ajaxform').ajaxForm({
    beforeSubmit: function (data, frm, opt) {
      return true;
    },
    success: function(data, statusText){
      $("#BoardThumnailValue").val(data);
    },
    error: function(){
       alert("파일 전송시 에러가 발생했습니다");
    }
   });

   $("#ajaxform").submit();
  //onSearchPost($("#BoardSearchOption"),$("#BoardSearchValue"),$("#boardList"),$("#boardPaging"));
  //$("#joinSex").attr("data-sex") ? $("#joinSex").val($("#joinSex").attr("data-sex")) : '';
});
