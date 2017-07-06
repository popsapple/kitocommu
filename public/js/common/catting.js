function viewport() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
}

$(document).ready(function(){
  $("#TotalRoomList .room_list > li ").onMovingFllowingItem();
});




/***** 채팅 웹소켓 ******/

$(document).ready(function(){
  console.log("접속주소 ::"+$(location).attr('href'));
  var url = 'http://kitocommu.herokuapp.com/catting/list'
  if($(location).attr('href').indexOf('192') != -1){
    url = $(location).attr('href');
  }
  var socket = io.connect(url);
  function AddNewCattingCheckSecretEvent(){ //비밀 대화방 이벤트
    $("#CheckSecretCattingRoom").on("change",function(){
      $("#MakeNewRoom #AddNewCattingRoom > * > label .lock").toggleClass("active");
      if($(this).is(":checked")){
        if($("body > .modal.add").size() == 0) {
          var modal_ele = $("<div class='modal add catting_dialog'><div><div><label for='PasswordSecretCattingRoom' class='blind'>비밀번호 입력</label><input id='PasswordSecretCattingRoom' type='password' autocomplete='off' placeholder='만드실 방의 비밀번호를 추가해주세요.'  value='' /><button class='close linebutton middle'>확인</button></div></div></div>");
          $("body").append(modal_ele);
        }
        $("body > .modal.add").fadeIn(1500);
        $("body > .modal.add input").val("");
        $("body > .modal.add .close").off('click'); // 이벤트가 중복되지 않게 기존거 삭제
        $("body > .modal.add .close").on('click',function(){
          $(this).closest('.modal').fadeOut(1500);
        });
      }else{
        $(this).fadeOut(1500);
      }
    });
  }
  function AddNewCattingRoomButtonEvent(){ // 채팅방 입장 소켓이벤트
    $("#TotalRoomList .room_list > li > div > button").click(function(){
      var obj = $(this);
      if($(this).hasClass('active')){ // 입장중일 때
        return false;
      }
      if($(this).parent().find("i").attr('class').indexOf('true') != -1){
        if($("body > .modal.secret").size() == 0) {
          var modal_ele = $("<div class='modal secret catting_dialog'><div><div><label for='PasswordCheckSecretCattingRoom' class='blind'>비밀번호 입력</label><input id='PasswordCheckSecretCattingRoom' type='password' autocomplete='off' placeholder='들어가실 방의 비밀번호를 입력해주세요.'  value='' /><button class='close linebutton middle'>입장하기</button>"+
          "<button class='dont linebutton middle'>입장하지 않기</button>"+"</div></div></div>");
          $("body").append(modal_ele);
        }
        $("body > .modal.secret").fadeIn(1500);
        $("body > .modal.secret input").val("");
        $("body > .modal.secret .close").off('click'); // 이벤트가 중복되지 않게 기존거 삭제
        $("body > .modal.secret .close").on('click',function(){
          $(this).closest('.modal.secret').fadeOut(1500);
          var data = {
            "room_id": obj.attr("data-roomid"),
            "room_password": $("#PasswordCheckSecretCattingRoom").val()
          };
          socket.emit('join_catting',data);
          $("#TotalRoomList .room_list > li > div > button.active").html("입장하기").attr('class','linebutton small');
          obj.html("입장대기중").addClass('active');
          $("#CattingDialog > ul").html(""); // 채팅방 입장시 컨텐츠 비우기
        });
        $("body > .modal.secret .dont").on('click',function(){
          $(this).closest('.modal.secret').fadeOut(1500);
        });
      }else{
        var data = {
          "room_id": $(this).attr("data-roomid"),
          "room_password": $("#PasswordCheckSecretCattingRoom").val()
        };
        socket.emit('join_catting',data);
        $("#TotalRoomList .room_list > li > div > button.active").html("입장하기").attr('class','linebutton small');
        $(this).html("참여중").addClass('active');
        $("#CattingDialog > ul").html(""); // 채팅방 입장시 컨텐츠 비우기
      }
    });
  }
  function CattingListLoadListEvent(title_value,CreateDate){ // 채팅방 목록 소켓이벤트
    var is_checked = 'false';
    is_checked = $("#CheckSecretCattingRoom").is(":checked") ? 'true' : 'false';
    var data = {
      "room_title": $("#AddNewCattingRoomTitle").val(),
      "room_password": $("#PasswordSecretCattingRoom").val(),
      "room_is_secret": is_checked,
      "time": CreateDate
    };
    socket.emit('add_addedroom', data);
  }
  function AddNewCattingContentsEvent(){ // 채팅내용 글 등록 소켓이벤트
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
      $(this).parent().find("textarea").val("");
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
          $(this).append("<div><button class='kick'>강퇴하기</button><button class='add_master'>방장추가</button><button class='remove_master'>방장삭제</button><button class='remove_room'>채팅방삭제</button></div>");
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
      $(this).find('.remove_room').on("click",function(){
        var message_data = prompt('방 삭제 사유를 입력하세요', '관리자 권한으로 방이 삭제되었습니다');
        socket.emit('roommaster_remove',{
          message: message_data
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
    var room_is_secret = $("#CheckSecretCattingRoom").is(":checked") ? 'true' : 'false';
    CattingListLoadListEvent($("#AddNewCattingRoomTitle").val(),CreateDate);
    var newRoom = "<li><div>"+
      "<h3>"+$("#AddNewCattingRoomTitle").val()+"</h3>"+
      "<strong class='participate'>참여인원 : 0명</strong>"+
      "<i class='"+room_is_secret+"'></i>"+
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
      "<i class='"+data.room_is_secret+"'></i>"+
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
  socket.on('render_mastermark',function(data){ // 방장 및 관리자 체크
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
    if(data.in_user == 'true'){
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
    }
    $("#TotalRoomList .room_list > li > div > button").each(function(){
      if($(this).attr('data-roomid') == data.room_id){
        $(this).parent().find(".participate").html("참여인원 : "+data.participate.length+"명");
      }
    });
  });
  socket.on('logout_user_participate',function(data){
    if(data.leave_user == 'false') {
      $("#CattingDialog > ul").append("<li>"+data.user+"님이 나가셨습니다.</li>");
      $("#CattingUserlist > ul li i").each(function(){
        if($(this).text() == data.user){
          $(this).parent().remove();
        }
      });
    }
    $("#TotalRoomList .room_list > li > div > button").each(function(){
      if($(this).attr('data-roomid') == data.room_id){
        $(this).parent().find(".participate").html("참여인원 : "+data.participate.length+"명");
      }
    });
  });
  socket.on('kicked_user',function(data){ // 강퇴당한 유저
    $("#CattingDialog > ul").html("");
    $("#CattingUserlist > ul").html("");
    $("#TotalRoomList .room_list > li > div > button.active").html("입장하기").attr('class','linebutton small');
    $("#TotalRoomList .room_list > li > div > .linebutton").each(function(){
      if($(this).attr('data-roomid') == data.now_room){
        $(this).parent().find(".participate").html("참여인원 : "+data.participate_length+"명");
      }
    });
    socket.emit('kicked_connect',{});
    alert("관리자에 의해 강제 퇴장되셨습니다");
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
  socket.on('room_removed',function(data){ // 0명시 방 삭제
    console.log("삭제이벤트 받음 :: "+data.room_id);
    var RemoveRoomElment = function(){
      $("#TotalRoomList .room_list > li > div > button").each(function(){
        if($(this).attr('data-roomid') == data.room_id){
          $(this).parent().parent().remove();
          if($("#TotalRoomList .room_list > li > div > button").length != 0) {
            $("#TotalRoomList .room_list > li ").onMovingFllowingItem();
          }else{
            $("#TotalRoomList .room_list").height(0);
          }
        }
      });
    }
    if($("#TotalRoomList .room_list > li > div > button").length == 0){
      setTimeout(function(){
        RemoveRoomElment();
      },500);
    }
  });
  socket.on('passed_error',function(data){ // 비밀방 로그인 실패
    $("#TotalRoomList .room_list > li > div > button.active").html("입장하기").removeClass('active');
    alert("입장에 실패하셨습니다. 비밀번호를 확인해주세요");
  });
  AddNewCattingRoomButtonEvent(); // 방 렌더링 후 입장하기 이벤트 추가
  AddNewCattingContentsEvent(); // 대화 내용 입력 이벤트
  AddNewCattingCheckSecretEvent(); // 비밀대화방 체크
  $(window).bind('beforeunload', function(event){
    if($("#TotalRoomList .room_list > li > div > button.active")){
      socket.emit('kicked_out',{
        type: 'unload'
      });
    }
  });
});
