module.exports.catting_con = function(app,socketio,mongoose){
  global.CATTING_SERVICE = require('./catting_service.js');
  global.CATTING_SERVICE.CattingRoomDbSetting(mongoose,socketio,function(){
    app.get('/catting/list', function(request, response) {
      if(!request.session.userid || !request.session.nickname){ // 비로그인 사용자 접근불가
        return response.redirect('/member/plz_login'); //
      }
      var request_data;
      if(!request.params){
        request_data = request.body;
      }else{
        request_data = request.params;
      }
      global.CATTING_SERVICE.CattingListLoadView(request, response,socketio,mongoose); // 처음 로드 시 렌더링처리
    });
  });
  socketio.of('/catting/list').on('connection', function(socket){
    if(socket.request.session){
    /*  console.log("세션 아이디 :: "+socket.request.session.userid);
      console.log("세션 닉네임 :: "+socket.request.session.nickname);
      console.log("이동할 방 or 이동 한 방 :: "+socket.request.session.room_id);
      console.log("이동 전의 방 :: "+socket.request.session.now_room);*/
      var user_nickname = socket.request.session.nickname;
      socket.join(user_nickname);
      var Firstfunction = function(data){ // DB에 있던 대로 참여자별 소켓 생성 STEP02
        if(typeof user_nickname == 'string') {
          global.CATTING_SERVICE_DB.find({}, function(err,room_info){
            room_info.forEach(function(arr,index){
              arr.user_list.forEach(function(arr_,index_){
                if(arr_ == user_nickname){
                  var data = {
                    room_id: arr.room_id
                  }
                  socketio.of('/catting/list').in(user_nickname).emit('loading_user',data); // DB에 있던 대로 방 참여
                }
              });
            });
          });
        }
      };
      Firstfunction();
    }

    socket.on('add_addedroom', function(data){
      global.CATTING_SERVICE.CattingListAddList(data,socket,socketio);
    });
    socket.on('join_catting', function(data){
      global.CATTING_SERVICE.CattingUserlist(data,socket,socketio);
    });
    socket.on('update_catting', function(data){
      global.CATTING_SERVICE.UpdatingCattingContents(data,socket,socketio);
    });
    socket.on('kicked_out', function(data){
      global.CATTING_SERVICE.LogoutUserList(data,socket,socketio);
    });
    socket.on('kicked_connect', function(){
      global.CATTING_SERVICE.KickedUserConnect(socket,socketio);
    });
    socket.on('master_account', function(data){
      global.CATTING_SERVICE.CheckMasterAccount(data,socket,socketio);
    });
    socket.on('roommaster_add', function(data){
      global.CATTING_SERVICE.AddRemoveMasterAccount(data,socket,socketio,'add');
    });
    socket.on('roommaster_remove', function(data){
      global.CATTING_SERVICE.AddRemoveMasterAccount(data,socket,socketio,'remove');
    });
    //socket.on('disconnect', function(){ console.log('disconnected'); });
  });
}
