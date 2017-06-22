function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

$.fn.onMovingFllowingItem = function(options){
  var obj = this;
	var defult = {
		'xxs_size': 1,
    'xs_size': 2,
    'sm_size': 2,
    'md_size': 3,
    'lg_size': 4
	};
	var options = $.extend({}, defult, options);
  var window_width;
  var item_size = options['xs_size'];
  var position_check_array = [];
  var item_length;

  function PositionCheckArraySetting(item_length,item_size){
    var row_count = -1; // 열 번호.
    var col_count; // 행 번호.
    var row_height;
    var col_width;
    var p_height;
    for(var i = 0; i < item_length; i++){ // 행 및 열번호 생성
      obj.eq(i).width((obj.eq(i).parent().width()-(15*(item_size-1)))/item_size);
      col_count = i%item_size;
      col_count == 0 ? row_count+=1 : '';
      if(row_count == 0){
        row_height = 0;
      }else{
        row_height = (function(){
          var pattern = /(\d+)/g;
          var height = position_check_array[(i-item_size)].y_point+parseInt(obj.eq((i-item_size)).height());
          return height;

        })();
      }
      if(col_count == 0){
        col_width = 0;
      }else{
        col_width = (function(){
          var pattern = /\d+/g;
          var width = position_check_array[(i-1)].x_point+parseInt(obj.eq((i-1)).width());
          return width;
        })();
      }
      position_check_array[i] = {
        'row': row_count,
        'col': col_count,
        'x_point': col_width,
        'y_point': row_height
      }
      if(i == item_length-1){ // 맨 마지막 줄일 때
        p_height = parseInt(position_check_array[i].y_point)+obj.eq(i).height();
        var count = 0;
        for(var j = (i-item_size); j < item_length; j++){
          if(j < 0){
            j = 0;
          }
          var height = parseInt(position_check_array[j].y_point)+obj.eq(j).height();
          if(p_height < height){
            p_height = height;
          }
          if(j == item_length-1){
            obj.parent().height(p_height+(15*parseInt(position_check_array[j].row)));
          }
        }
      }
    }
  }

  this.check_item_width = function(){
    window_width = viewport().width;
    item_length = this.size();
    if(window_width <= 499){
      item_size = options['xxs_size'];
    }
    if(window_width >= 500){
      item_size = options['xs_size'];
    }
    if(window_width >= 768){
      item_size = options['sm_size'];
    }
    if(window_width >= 992){
      item_size = options['md_size'];
    }
    if(window_width >= 1200){
      item_size = options['lg_size'];
    }

    PositionCheckArraySetting(item_length,item_size);
    obj.each(function(index){
      $(this).attr('data-row',position_check_array[index].row);
      $(this).attr('data-col',position_check_array[index].col);

      var position_y = position_check_array[index].y_point;
      var position_x = position_check_array[index].x_point;

      if($(this).attr('data-col')!=0 && item_size != 1){
        position_x += (15*parseInt($(this).attr('data-col')));
      }
      if($(this).attr('data-row')!=0){
        position_y += (15*parseInt($(this).attr('data-row')));
      }
      $(this).css({
        'transform': 'matrix(1, 0, 0, 1, '+position_x+', '+position_y+')',
        '-ms-transform': 'matrix(1, 0, 0, 1, '+position_x+', '+position_y+')',
        'transition': 'transform 1s 0s'
      });
    });
  }

  obj.check_item_width();

  $(window).resize(function(){
    window_width = viewport().width;
    obj.check_item_width();
  });
};

$(document).ready(function(){
  $("#TotalRoomList .room_list > li ").onMovingFllowingItem();
});




/***** 채팅 웹소켓 ******/

$(document).ready(function(){
  var socket = io.connect('http://192.168.219.102:5000/catting/list');
  function AddNewCattingCheckSecretEvent(){ //비밀 대화방 이벤트
    $("#CheckSecretCattingRoom").on("change",function(){
      if($(this).attr('checked') == true){
        if(!$("body > .modal")){
          $("body").append(
            "<div class='modal'>"+
              "<label for='PasswordSecretCattingRoom'>비밀번호</label>"+
              "<input id='PasswordSecretCattingRoom' type='password' value='' />"+
              "<button class='close'></button>"+
            "</div>"
          );
          $("body > .modal").hide();
          $("body > .modal").fadeIn(500);
        }else{
          $("body > .modal").fadeIn(500);
        }
        $("body > .modal .close").on('click',function(){
          $(this).fadeOut(500);
        });
      }
    });
  }
  function AddNewCattingRoomButtonEvent(){ // 채팅방 입장 소켓이벤트
    $("#TotalRoomList .room_list > li > div > button").click(function(){
      if($(this).hasClass('active')){ // 입장중일 때
        return false;
      }
      var data = {
        "room_id": $(this).attr("data-roomid")
      };
      socket.emit('join_catting',data);
    //  $("#UserNowRoom").val($(this).attr("data-roomid"));
      $("#TotalRoomList .room_list > li > div > button.active").html("입장하기").attr('class','linebutton small');
      $(this).html("참여중").addClass('active');
      $("#CattingDialog > ul").html(""); // 채팅방 입장시 컨텐츠 비우기
    });
  }
  function CattingListLoadListEvent(title_value,CreateDate){ // 채팅방 목록 소켓이벤트
    var data = {
      "room_title": $("#AddNewCattingRoomTitle").val(),
      "time": CreateDate
    };
    socket.emit('add_addedroom', data);
  }
  function AddNewCattingContentsEvent(){ // 글 등록 소켓이벤트
    $("#CattingContentsEnter > button").click(function(){
      var is_whisper = false;
      if($("#CattingUserlist > ul li.active").length > 0){
        is_whisper = true;
      }
      var data = {
        "catting_contents": $(this).parent().find("textarea").val(),
        "to_user": $("#CattingUserlist > ul li.active").find("i").html(),
        "is_whisper": is_whisper
      };
      socket.emit('update_catting',data);
    });
  }
  function UpdatingCattingContentsWhisper(){ // 귓속말 소켓이벤트
    $("#CattingUserlist > ul li").click(function(){
      var is_active = $(this).closest("li").hasClass("active");
      $("#CattingUserlist > ul li").each(function(index){
        $(this).attr("class","");
      });
      if(!is_active){
        $(this).addClass("active");
      }
    });
  }
  function RoomMasterEvent(data){
    $("#CattingUserlist > ul li").on("mouseenter",function(){
      if($(this).find("i").text().indexOf(data.nickname) != -1){ // 자기 자신일 경우
        return false;
      }
      $("#CattingUserlist > ul li > div").each(function(){
        $(this).remove();
        $(this).parent().removeClass("master");
      });
      if($(this).find("i").html() != data.new_user){
        if(parseInt(data.level) >= 4 && data.is_master) { // 관리자인지 방장인지
          $(this).append("<div><button class='kick'>강퇴하기</button><button class='add_master'>방장추가</button><button class='remove_master'>방장삭제</button></div>");
        }else if(data.level == '0' && data.is_master) {
          $(this).append("<div><button class='kick'>강퇴하기</button></div>");
          $(this).addClass("master");
        }
      }
      $(this).find('.kick').on("click",function(){
        socket.emit('kicked_out',{
          kick_nickname: $(this).parent().parent().find("i").html(),
          type: 'master_kick'
        });
      });
      $(this).find('.add_master').on("click",function(){
        socket.emit('roommaster_add',{
          add_master_nickname: $(this).parent().parent().find("i").html()
        });
      });
      $(this).find('.remove_master').on("click",function(){
        socket.emit('roommaster_remove',{
          remove_master_nickname: $(this).parent().parent().find("i").html()
        });
      });
    });
    $("#CattingUserlist > ul li").on("mouseleave",function(){
      $("#CattingUserlist > ul li").each(function(){
        $(this).find("div").remove();
        $(this).removeClass("master");
      });
    });
  };
  $("#AddNewCattingRoomButton").click(function(){ // 방 추가 버튼 클릭 시
    var CreateDate = new Date();
    CreateDate = CreateDate.getFullYear()+''+CreateDate.getMonth()+''+CreateDate.getDate()+''+CreateDate.getHours()+''+CreateDate.getMinutes()+''+CreateDate.getSeconds()+''+CreateDate.getMilliseconds();

    CattingListLoadListEvent($("#AddNewCattingRoomTitle").val(),CreateDate);
    var newRoom = "<li><div>"+
      "<h3>"+$("#AddNewCattingRoomTitle").val()+"</h3>"+
      "<strong class='participate'>참여인원 : 0명</strong>"+
      "<button data-roomid='"+$("#UserId").val()+CreateDate+"' class='linebutton small' role='button'>입장하기</button>"+
    "</div></li>";
    $("#TotalRoomList > ul").append(newRoom);
    $("#TotalRoomList .room_list > li ").onMovingFllowingItem();

    AddNewCattingRoomButtonEvent(); // 방 추가 후 입장하기 이벤트 추가
  });

  socket.on('render_addedroom',function(data){ // 서버가 각 클라이언트에 소켓 연결을 발생한걸 먼저 받아야함...
    var newRoom = "<li><div>"+
      "<h3>"+data.room_title+"</h3>"+
      "<strong class='participate'>참여인원 : 0명</strong>"+
      "<button data-roomid='"+data.room_id+"' class='linebutton small' role='button'>입장하기</button>"+
    "</div></li>";
    $("#TotalRoomList > ul").append(newRoom);
    $("#TotalRoomList .room_list > li ").onMovingFllowingItem();
    AddNewCattingRoomButtonEvent(); // 방 추가 후 입장하기 이벤트 추가
  });
  socket.on('render_userlist',function(data){
    if(data.is_master == true){
      RoomMasterEvent(data); // 방장이벤트
    }else{
      $("#CattingUserlist > ul li").off("mouseenter");
    };
  });
  socket.on('render_mastermark',function(data){
    $("#CattingUserlist > ul > li").each(function(index){
      if($("#CattingUserlist > ul > li").eq(index).find("i").hasClass("master")){
        $("#CattingUserlist > ul > li").eq(index).find("i").removeClass("master");
      }
      for(var i = 0; i <= data.masterlist.length-1; i++){
        if($(this).find("i").html() == data.masterlist[i]){
          $("#CattingUserlist > ul > li").eq(index).find("i").addClass("master");
        }
      }
    });
  });
  socket.on('render_userlist_all',function(data){ // 접속중인 유저
    $("#CattingUserlist > ul").html("");
    outside :
    for(var i = 0; i <= data.user_list.length-1; i++){
      var newUser = "<li>"+
      "<i>"+data.user_list[i]+"</i>"+
      "</li>";
      $("#CattingUserlist > ul").append(newUser);
      if(i == data.user_list.length-1){
        UpdatingCattingContentsWhisper(); // 귓속말
        $("#CattingDialog > ul").append("<li>"+data.new_user+"님이 입장하셨습니다.</li>");
        $("#TotalRoomList .room_list > li > div > .active").parent().find(".participate").html("참여인원 : "+data.participate.length+"명");
      }
    }
    socket.emit('master_account',{});
  });
  socket.on('logout_user',function(data){
    $("#CattingDialog > ul").append("<li>"+data.user+"님이 나가셨습니다.</li>");
    $("#CattingUserlist > ul li i").each(function(){
      if($(this).text() == data.user){
        $(this).parent().remove();
        $("#TotalRoomList .room_list > li > div > .active").parent().find(".participate").html("참여인원 : "+data.participate.length+"명");
        return;
      }
    });
  });
  socket.on('logouted_user',function(data){
    $("#TotalRoomList .room_list > li > div > .linebutton").each(function(){
      if($(this).attr('data-roomid') == data.now_room){
        $(this).parent().find(".participate").html("참여인원 : "+data.participate_length+"명");
      }
    });
  });
  socket.on('kicked_user',function(data){ // 강퇴당한 유저
    $("#CattingDialog > ul").html("");
    $("#CattingUserlist > ul").html("");
    $("#TotalRoomList .room_list > li > div > .linebutton").each(function(){
      if($(this).attr('data-roomid') == data.now_room){
        $(this).parent().find(".participate").html("참여인원 : "+data.participate_length+"명");
      }
    });
    alert("관리자에 의해 강제 퇴장되셨습니다");
    socket.emit('kicked_connect',{});
  });
  socket.on('render_cattingcontents',function(data){ // 귓속말 기능 및 채팅입력
    var whisper = false;
    if(data.is_whisper){
      whisper = data.user_nickname+"</i>"+'님의 귓속말';
    }else{
      whisper = data.user_nickname+"</i>";
    }
    if(data.is_whisper && ($("#UserNickname").val() != data.to_user)){
      whisper =  data.to_user+"</i>"+'님에게 보낸 귓속말';
    }
    var contents = "<li>"+
      "<strong class='nickname'>"+
        "<i class='member'>"+whisper+
      "</strong>"+
      "<div class='contents'>"+data.catting_contents+
      "</div>"+
    "</li>";
    $("#CattingDialog > ul").append(contents);
  });
  socket.on('loading_user',function(data){ // DB에 맞춰서 채팅방 강제 참여
    $("#TotalRoomList .room_list > li > div > button").each(function(){
      if($(this).attr("data-roomid") == data.room_id){
        $(this).click();
      }
    });
  });
  AddNewCattingRoomButtonEvent(); // 방 렌더링 후 입장하기 이벤트 추가
  AddNewCattingContentsEvent(); // 대화 내용 입력 이벤트
  AddNewCattingCheckSecretEvent(); // 비밀대화방 체크
});

$(window).bind('beforeunload', function(){ // 페이지 이동시 로그아웃 처리
  var value = e.returnValue;
  if(value){
    var data = {
      "user_nickname": $("#UserNickname").val()
    };
    socket.emit('kicked_out',data);
  }
});
