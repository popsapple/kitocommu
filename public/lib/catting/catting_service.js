exports = module.exports = {CattingRoomDbSetting  : function (mongoose,socketio,callback){
    var obj = this;
    var Schema = mongoose.Schema;
    var CattingRoomschema = new Schema({
      is_secret: String,
      room_master: Array,
      participate: Array,
      user_list: Array,
      room_id: String,
      room_title:  String
    }, { collection: 'Catting_RoomList' });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    global.CATTING_SERVICE_DB = mongoose.model('cattingroom_db', CattingRoomschema);

    if(global.catting_room_list == undefined){ // 채팅방 리스트 초기화
      global.catting_room_list = {
        room_list : []
      };
    }
    global.CATTING_SERVICE_DB.find({}, function(err,room_info){
      room_info.forEach(function(arr,index){
        global.catting_room_list.room_list.push(arr);
        if(index == (room_info.length-1) && typeof callback == 'function'){
          callback();
        }
      });
    });
  },CattingListAddList  : function(data,socket,socketio,user_id,user_nickname){
    var user_id = socket.request.session.userid;
    var user_nickname = socket.request.session.nickname;
    data.room_id = user_id+data.time;
    var AddedRoomInfo = {
      'is_secret' : 'no',
      'room_title' : data.room_title,
      'room_id' : data.room_id,
      'participate' : [],
      'room_master': user_nickname,
      'user_list': []
    }
    global.catting_room_list.room_list.push(AddedRoomInfo);

    var AddedRoomInfo = new global.CATTING_SERVICE_DB(AddedRoomInfo);
    AddedRoomInfo.save({});
    socket.broadcast.emit('render_addedroom',data);
  },CattingListLoadView  : function(request, response,socketio,mongoose){
    var request_data;
    if(!request.query.room_title){
      request_data = request.body;
    }else{
      request_data = request.query;
    }
    response.render('catting/list',global.catting_room_list);
  },LogoutUserList  : function(data,socket,socketio){
    var room_id = socket.request.session.room_id;
    var now_room = socket.request.session.now_room;
    var now_room_ = socket.request.session.now_room;
    var user_nickname = socket.request.session.nickname;
    var user_nickname_ = socket.request.session.nickname;
    var roommaster_nickname;
    var level;
    var is_roommaster = false;
    if(data.type == 'master_kick'){ // 방장이 강퇴시킨 경우
      level = 4;
      user_nickname = data.kick_nickname;
      roommaster_nickname = socket.request.session.nickname;
      now_room = socket.request.session.room_id;
      global.MEMBERLIB.CheckAuthenfication('',socket.request.session.userid,'','',function(value_){
        Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
          var ele = global.catting_room_list.room_list[index];
          if(ele.room_id == now_room){
            room_obj = ele;
            room_index = index;
            room_obj.room_master.forEach(function(ele_,index_){
              if(ele_ == roommaster_nickname) { // 관리자일 경우 마스터리스트에 추가
                is_roommaster = true;
              }
              if(index_ == (room_obj.room_master.length-1) && is_roommaster){
                room_obj.user_list.forEach(function(element,idx){
                  if(element == user_nickname){
                    room_obj.user_list.splice(idx,1);
                    socketio.of('/catting/list').to(user_nickname).emit('kicked_user',{now_room:now_room_,participate_length:room_obj.user_list.length});
                    // 강퇴당한 사람 외의 룸 전원한테 메세지를 보내도록
                    socketio.of('/catting/list').to(user_nickname).clients(function(error, clients){
                      var kicked_user_id = clients;
                      socketio.of('/catting/list').in(room_id).clients(function(error, clients){
                        if (error) throw error;
                        clients.forEach(function(client_ele,index){
                          if(client_ele != kicked_user_id) {
                            socketio.of('/catting/list').to(client_ele).emit('logout_user',{user: user_nickname,user_list: room_obj.user_list,participate: room_obj.user_list});
                          }
                        });
                      });
                    });

                    var search_room_id = now_room;
                    global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
                       { room_id: search_room_id },
                       {
                         $set: {
                           user_list: room_obj.user_list,
                           participate: room_obj.user_list
                         }
                       }
                    ,{ multi: true },function (error, user){});
                  }
                });
              }
            });
          }
        });
      },'check_admin',level);
    }else{ // 방이 바뀌거나 사이트를 나가서 로그아웃
      Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
        var ele = global.catting_room_list.room_list[index];
        var data = {user: user_nickname,user_list: room_obj.user_list,participate: room_obj.user_list};
        if(ele.room_id == now_room){
          room_obj = ele;
          room_index = index;
          room_obj.user_list.forEach(function(element,idx){
            if(element == user_nickname){
              room_obj.user_list.splice(idx,1);
              //room_obj.room_master.splice(idx,1);
              socket.leave(now_room);
              var search_room_id = now_room;
              global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
                 { room_id: search_room_id },
                 {
                   $set: {
                     user_list: room_obj.user_list,
                     participate: room_obj.user_list,
                     room_master: room_obj.room_master
                   }
                 }
              ,{ multi: true },function (error, user){});
              socket.request.session.now_room = socket.request.session.room_id; // 나간 담에 기존 방을 업데이트
              socketio.of('/catting/list').in(now_room).emit('logout_user',data);
              socketio.of('/catting/list').to(user_nickname).emit('logouted_user',{now_room:now_room_,participate_length:room_obj.user_list.length});
            }
          });
        }
      });
    }
  },KickedUserConnect : function(socket,socketio){
    var user_nickname = socket.request.session.nickname;
    var room_id = socket.request.session.room_id;
    socket.request.session.room_id = undefined; // 접속중인 방 정보 초기화
    socket.request.session.now_room = undefined;
    socket.leave(room_id,function(){/**/});
    socket.leave(user_nickname);
  },CattingUserlist  : function(data,socket,socketio){
    var now_room = socket.request.session.now_room; // 세션에 기존 방 체크
    var room_id = socket.request.session.room_id = data.room_id; // 세션에 어드 방으로 들어갔는지 체크

    if(now_room == undefined){ // 세션에 기존 방 체크
      now_room = socket.request.session.now_room = data.room_id;
    }

    var user_nickname = socket.request.session.nickname;
    var is_double = false;
    var is_double_admin = false;
    var room_obj;
    var that = this;
    var room_index;

    if(room_id != now_room){ //기존에 접속한 방이 있었다면
      global.CATTING_SERVICE.LogoutUserList(data,socket,socketio);
    }

    that.AddUser = function(room_index,is_double){
      socket.join(room_id);
      room_obj = global.catting_room_list.room_list[room_index];
      var user_nickname = socket.request.session.nickname;
      // 클라이언트에다가 유저 리스트 넘김
      var search_room_id = room_id;
      var data = {
        user_list: room_obj.user_list,
        participate: room_obj.user_list,
        new_user: user_nickname,
        master_user: room_obj.room_master
      };
      if(is_double != true){
        room_obj.user_list.push(user_nickname);
      }
      //broadcast.to()  - 나를 제외 한
      //in() - 나를 포함한
      //**** 중요 -- room 이름 같은 연결은 각자 같은 값을 보내야 하는지 다른 값을 보내야 하는지
      // 소켓 단위로 구분되므로 이 점을 명시하자.
      // 예를 들어 관리자 혹은 특정인한테만 다른 정보가 가야 한다면 to(user_nickname) 대로 써야한다.

      room_obj.user_list.forEach(function(ele_,index_){
        if(ele_ == undefined || JSON.stringify(ele_) == "[]"){
          room_obj.user_list.splice(index_,1);
        }
        if(ele_ == socket.request.session.nickname){
          socketio.of('/catting/list').in(room_id).clients(function(error, clients){
            data.user_list = []; // 실 접속중인 유저만 표시하기 위해 따로 이렇게 함.
            clients.forEach(function(client_ele,index){ // 현재 접속중인 유저만 표시
              if(socketio.of('/catting/list').connected[client_ele].request.session.nickname){
                data.user_list.push(socketio.of('/catting/list').connected[client_ele].request.session.nickname);
              }
              if(index == (clients.length-1)){
                socketio.of('/catting/list').in(room_id).emit('render_userlist_all',data);
              }
            });
          });
          // 만약에 방장이 없음 바로 DB에 추가 및 소켓작업
          if(room_obj.room_master == undefined || JSON.stringify(room_obj.room_master) == "[]"){
            global.MEMBERLIB.CheckAuthenfication('',socket.request.session.userid,'','',function(value_){
              if(value_){ // 관리자일 경우 마스터리스트에 추가
                room_obj.room_master.push(user_nickname);
              }
              global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
                 { room_id: search_room_id },
                 {
                   $set: {
                     user_list: room_obj.user_list,
                     participate: room_obj.user_list,
                     room_master: room_obj.room_master
                   }
                 }
                 ,{ multi: true },function (error, user){
              });
            },'check_admin',4);
          }
        }
        if(index_ == (room_obj.user_list.length-1)){
          socketio.of('/catting/list').in(room_id).emit('render_mastermark',{masterlist: room_obj.room_master});
          global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
             { room_id: search_room_id },
             {
               $set: {
                 user_list: room_obj.user_list,
                 participate: room_obj.user_list,
                 room_master: room_obj.room_master
               }
             }
          ,{ multi: true },function (error, user){});
        }
      });
    }

    Object.keys(global.catting_room_list.room_list).forEach(function(element,index){

      var ele = global.catting_room_list.room_list[index];
      var ele_room_id = ele.room_id;

      if(ele_room_id == room_id){
        room_obj = ele;
        room_index = index;
        if(JSON.stringify(room_obj.user_list) == "[]" || room_obj.user_list == undefined){
          that.AddUser(room_index,'');
        }else{
          room_obj.user_list.forEach(function(element,idx){
            var ele = room_obj.user_list[idx];
            if(ele == user_nickname){
              is_double = true; // 이미 있던 사람인지 체크
            }
            if(idx == (room_obj.user_list.length-1)){
              that.AddUser(room_index,is_double);
            }
          });
        }
      }
    });
  },UpdatingCattingContents  : function(data,socket,socketio){
    data.user_nickname = socket.request.session.nickname;
    if(data.is_whisper){
      var id = data.to_user;
      var me = socket.request.session.nickname;
      var me_data = {
        to_user:  data.to_user,
        is_whisper: true,
        catting_contents:  data.catting_contents
      };
      me_data.user_nickname = socket.request.session.nickname;
        socketio.of('/catting/list').to(id).emit('render_cattingcontents',data);
      if(id != me){
        socketio.of('/catting/list').to(me).emit('render_cattingcontents',me_data);
      }
    }else{
      var id = socket.request.session.room_id;
      if(id != undefined) { // 현재 접속중인 방이 있다면..
        socketio.of('/catting/list').in(id).emit('render_cattingcontents',data);
      }
    }
  },CheckMasterAccount : function(data,socket,socketio){
    var room_id = socket.request.session.room_id;
    var user_nickname = socket.request.session.nickname;
    Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
      var ele_room_id = global.catting_room_list.room_list[index].room_id;
      if(ele_room_id == room_id){
        room_obj = global.catting_room_list.room_list[index];
        room_obj.user_list.forEach(function(ele_,index_){
          if(ele_ == user_nickname){
            var level = 4;
            global.MEMBERLIB.CheckAuthenfication('',socket.request.session.userid,'','',function(value_){
              room_obj.room_master.forEach(function(master_ele,index_){
                if(ele_ == master_ele){
                  is_double_admin = true; // 이미 목록에 있던 사람인지 체크 및 일반 관리자의 경우 체크
                  if(value_ && (!is_double_admin)){ // 관리자일 경우 마스터리스트에 추가
                    room_obj.room_master.push(user_nickname);
                  }
                  if(value_){ // 관리자일 경우 마스터리스트에 추가
                    data.is_master = true;
                    data.new_user = user_nickname;
                    data.level = 4;
                    socketio.of('/catting/list').to(ele_).emit('render_userlist',data);
                  }
                  if(!value_){ // 일반 방장일경우 추가
                    data.is_master = true;
                    data.new_user = user_nickname;
                    data.level = '0';
                    socketio.of('/catting/list').to(ele_).emit('render_userlist',data);
                  }
                }
              });
            },'check_admin',level);
          };
        });
      }
    });
  },AddRemoveMasterAccount : function(data,socket,socketio,type){
    var room_id = socket.request.session.room_id, search_room_id = socket.request.session.room_id;
    var add_master_nickname = data.add_master_nickname;
    var remove_master_nickname = data.remove_master_nickname;
    var level = 4;
    global.MEMBERLIB.CheckAuthenfication('',socket.request.session.userid,'','',function(value_){
      if(value_){ // 관리자일 경우
        Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
          var ele_room_id = global.catting_room_list.room_list[index].room_id;
          if(ele_room_id == room_id){
            room_obj = global.catting_room_list.room_list[index];
            if(type == 'add'){
              room_obj.room_master.push(add_master_nickname);
            }else{
              room_obj.room_master.forEach(function(ele,index){
                if(ele == remove_master_nickname){
                  room_obj.room_master.splice(index,1);
                }
              });
            }
            global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
             { room_id: search_room_id },
             {
               $set: {
                 room_master: room_obj.room_master
               }
             }
             ,{ multi: true },function (error, user){
               socketio.of('/catting/list').in(room_id).emit('render_mastermark',{masterlist: room_obj.room_master});
               if(type == 'add'){
                socketio.of('/catting/list').to(add_master_nickname).emit('render_userlist',{is_master: true,nickname: add_master_nickname,new_user: add_master_nickname,level: '0'});
              }else{
                socketio.of('/catting/list').to(remove_master_nickname).emit('render_userlist',{is_master: false});
              }
            });
          }
        });
      }
    },'check_admin',level);
  }
}
