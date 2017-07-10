$(document).ready(function(){
  $(".admin_page .member_list .ban_button").click(function(){
    var button_obj = $(this);
    var is_ban;
    var user__id = $.trim($(this).parent().parent().find(".userid").text());
    $(this).hasClass("ban_true")? is_ban = true : is_ban = false;
    var reason = prompt("적절한 사유를 입력해 주세요");
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
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
    member__point_check = $(this).parent().find('input').text();
    var reason = prompt("적절한 사유를 입력해 주세요");
    member__point_length = member__point.length;
    var pattern = /^[0-9]+$/g
    var is_num = pattern.test(member__point);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_num){
      alert("숫자를 입력해 주세요 :: "+member__point);
      return false;
    }
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
        alert("변경이 완료되었습니다 :: "+member__point);
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
    member__level_check = $(this).parent().find('input').text();
    var reason = prompt("적절한 사유를 입력해 주세요");
    member__level_length = member__level.length;
    var pattern = /^[0-9]+$/g
    var is_num = pattern.test(member__level);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_num){
      alert("숫자를 입력해 주세요 :: "+member__level);
      return false;
    }
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
        alert("변경이 완료되었습니다 :: "+member__level);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });

  // selebox 기본값
  $(".AdminBoardTemplateSelect").each(function(){
    $(this).val($(this).attr('data-value'));
  });

  $(".admin_page .board_list_ul .board_template").click(function(){
    var button_obj = $(this);
    var board__id = $(this).parent().parent().find("#AdminBoardIdInput").val();
    var board__template = $(this).parent().find("#AdminBoardTemplateSelect").val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    $.ajax({
      type:"POST",
      cache:false,
      contentType: "application/json",
      url:'/admin_page/board_list/board_template_change',
      async: true,
      data: JSON.stringify({
        board_id: board__id,
        board_template: board__template,
        working_type: "board_template_change",
        woring_reason: reason
      }),
      success:function(data){
        if(data.message){
          alert(data.message);
          return false;
        }
        alert("변경이 완료되었습니다 :: "+board__template);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });

  $(".admin_page .board_list_ul .board_category").click(function(){
    var button_obj = $(this);
    var board__id = $(this).parent().parent().find("#AdminBoardIdInput").val();
    var board__category = $(this).parent().find("#AdminBoardCategoryInput").val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    var pattern = /(.+,)(.+[^,])$/g
    var is_pattern = pattern.test(board__category);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_pattern){
      alert("형식에 맞게 입력해주세요 예- 재미,일상,취미");
      return false;
    }
    $.ajax({
      type:"POST",
      cache:false,
      contentType: "application/json",
      url:'/admin_page/board_list/board_category_change',
      async: true,
      data: JSON.stringify({
        board_id: board__id,
        board_category: board__category,
        working_type: "board_category_change",
        woring_reason: reason
      }),
      success:function(data){
        if(data.message){
          alert(data.message);
          return false;
        }
        alert("변경이 완료되었습니다 :: "+board__category);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });

  $(".admin_page .board_list_ul .board_writing_level").click(function(){
    var button_obj = $(this);
    var board__id = $(this).parent().parent().find("#AdminBoardIdInput").val();
    var board__writing_level = $(this).parent().find("#AdminBoardLevelInput").val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    var pattern = /^[0-9]+$/g
    var is_num = pattern.test(board__writing_level);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_num){
      alert("숫자를 입력해 주세요 :: "+board__writing_level);
      return false;
    }
    $.ajax({
      type:"POST",
      cache:false,
      contentType: "application/json",
      url:'/admin_page/board_list/writeing_level_change',
      async: true,
      data: JSON.stringify({
        board_id: board__id,
        board_writing_level: board__writing_level,
        working_type: "board_writing_change",
        woring_reason: reason
      }),
      success:function(data){
        if(data.message){
          alert(data.message);
          return false;
        }
        alert("변경이 완료되었습니다 :: "+board__writing_level);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });

  $(".admin_page .board_list_ul .board_post_point").click(function(){
    var button_obj = $(this);
    var board__id = $(this).parent().parent().find("#AdminBoardIdInput").val();
    var board__post_point = $(this).parent().find("#AdminBoardPostPointInput").val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    var pattern = /^[0-9]+$/g
    var is_num = pattern.test(board__post_point);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_num){
      alert("숫자를 입력해 주세요 :: "+board__post_point);
      return false;
    }
    $.ajax({
      type:"POST",
      cache:false,
      contentType: "application/json",
      url:'/admin_page/board_list/board_post_point',
      async: true,
      data: JSON.stringify({
        board_id: board__id,
        board_post_point: board__post_point,
        working_type: "board_post_point",
        woring_reason: reason
      }),
      success:function(data){
        if(data.message){
          alert(data.message);
          return false;
        }
        alert("변경이 완료되었습니다 :: "+board__post_point);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });

  $(".admin_page .board_list_ul .board_comment_point").click(function(){
    var button_obj = $(this);
    var board__id = $(this).parent().parent().find("#AdminBoardIdInput").val();
    var board__comment_point = $(this).parent().find("#AdminBoardCommentPointInput").val();
    var reason = prompt("적절한 사유를 입력해 주세요");
    var pattern = /^[0-9]+$/g
    var is_num = pattern.test(board__comment_point);
    if(!reason){
      alert("사유를 입력해 주세요");
      return false;
    }
    if(!is_num){
      alert("숫자를 입력해 주세요 :: "+board__comment_point);
      return false;
    }
    $.ajax({
      type:"POST",
      cache:false,
      contentType: "application/json",
      url:'/admin_page/board_list/board_comment_point',
      async: true,
      data: JSON.stringify({
        board_id: board__id,
        board_comment_point: board__comment_point,
        working_type: "board_comment_point",
        woring_reason: reason
      }),
      success:function(data){
        if(data.message){
          alert(data.message);
          return false;
        }
        alert("변경이 완료되었습니다 :: "+board__comment_point);
      },
      error:function(e){
        console.log("에러");
      }
    });
  });
});
