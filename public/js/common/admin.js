$(document).ready(function(){
  $(".admin_page .member_list .ban_button").click(function(){
    var button_obj = $(this);
    var is_ban;
    var user__id = $.trim($(this).parent().parent().find(".userid").text());
    $(this).hasClass("ban_true")? is_ban = true : is_ban = false;
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
          if(data.message){
            alert(data.message);
            return false;
          }
          if(data.is__ban == "off"){
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

  $(".admin_page .member_list .point_change").click(function(){
    var button_obj = $(this);
    var user__id = $.trim($(this).parent().parent().find(".userid").text());
    member__point = $(this).parent().find('input').val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    $.ajax({
        type:"POST",
        cache:false,
        contentType: "application/json",
        url:'/admin_page/member_list/point_change',
        async: true,
        data: JSON.stringify({
          user_id: user__id,
          member_point: member__point,
          working_type: "point_change",
          woring_reason: reason
        }),
        success:function(data){
          if(data.message){
            alert(data.message);
            return false;
          }
          alert("변경이 완료되었습니다");
        },
        error:function(e){
          console.log("에러");
        }
    });
  });

  $(".admin_page .member_list .level_change").click(function(){
    var button_obj = $(this);
    var user__id = $.trim($(this).parent().parent().find(".userid").text());
    member__level = $(this).parent().find('input').val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    $.ajax({
        type:"POST",
        cache:false,
        contentType: "application/json",
        url:'/admin_page/member_list/level_change',
        async: true,
        data: JSON.stringify({
          user_id: user__id,
          member_level: member__level,
          working_type: "level_change",
          woring_reason: reason
        }),
        success:function(data){
          if(data.message){
            alert(data.message);
            return false;
          }
          alert("변경이 완료되었습니다");
        },
        error:function(e){
          console.log("에러");
        }
    });
  });
});
