$(document).ready(function(){
  $(".admin_page .member_list .ban_button").click(function(){
    var button_obj = $(this);
    var is_ban;
    var user__id = $.trim($(this).parent().parent().find(".userid").text());
    $(this).hasClass("ban_true")? is_ban = true : is_ban = false;
    console.log("관리받을 유저 ::"+user__id);
    var reason = prompt("적절한 사유를 입력해 주세요");
    $.ajax({
        type:"POST",
        cache:false,
        contentType: "application/json",
        url:'/admin_page/member_list/ban_member',
        async: true,
        data: JSON.stringify({
          user_id: user__id,
          is_ban: is_ban,
          working_type: "ban",
          woring_reason: reason
        }),
        success:function(data){
          console.log("해제정보 :: "+data.is__ban);
          if(data.is__ban == "off"){
            console.log("해제");
            button_obj.html("영구정지").removeClass("ban_true").addClass("ban_false");
          }
          else{
            button_obj.html("정지해제").removeClass("ban_false").addClass("ban_true");
          }
        },
        error:function(e){
          console.log("에러");
        }
    });
  });
});
