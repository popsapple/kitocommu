exports = module.exports = {CattingRoomDbSetting  : function (mongoose,socketio,callback){
    var obj = this;
    var Schema = mongoose.Schema;
    var CattingRoomschema = new Schema({
      is_secret: String,
      room_master: Array,
      participate: Array,
      user_list: Array,
      room_id: String,
      room_password: String,
      room_is_secret: String,
      room_title:  String,
      hash:  String
    }, { collection: 'Catting_RoomList' });

    mongoose.models = {};
    mongoose.modelSchemas = {};

    global.CATTING_SERVICE_DB = mongoose.model('cattingroom_db', CattingRoomschema);

    if(global.catting_room_list == undefined){ // 채팅방 리스트 초기화
      global.catting_room_list = {
        room_list : []
      };
      global.CATTING_SERVICE_DB.update(
         {},
         {
           $set: {
             user_list: [], // 서버 초기화시 비워버리기
             participate: [] // 서버 초기화시 비워버리기
           }
         }
      ,{ multi: true },function (error, user){
        global.CATTING_SERVICE_DB.find({}, function(err,room_info){
          room_info.forEach(function(arr,index){
            global.catting_room_list.room_list.push(arr);
            if(index == (room_info.length-1) && typeof callback == 'function'){
              callback();
            }
          });
        });
      });
    }
  },CattingListAddList  : function(data,socket,socketio,user_id,user_nickname){
    var user_id = socket.request.session.userid;
    var user_nickname = socket.request.session.nickname;
    data.room_id = user_id+data.time;
    var AddedRoomInfo = {
      'is_secret' : 'no',
      'room_title' : data.room_title,
      'room_id' : data.room_id,
      'room_password' : data.room_password,
      'room_is_secret' : data.room_is_secret,
      'participate' : [],
      'room_master': user_nickname,
      'user_list': []
    }
    global.catting_room_list.room_list.push(AddedRoomInfo);

    var AddedRoomInfo = new global.CATTING_SERVICE_DB(AddedRoomInfo);
    global.CATTING_SERVICE.RoomSerectPassword(AddedRoomInfo,data.room_password);
    if(data.room_is_secret == 'true'){
      AddedRoomInfo.settingPassword();
    }
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
                    room_obj.participate.splice(idx,1);
                    var client_all = [];
                    var client_room = [];
                    global.CATTING_SERVICE_SOCKETLIST.forEach(function(clients, index){
                      client_all[index] = clients;
                      client_all[index].nickname = clients.request.session.nickname;
                      if(index == (global.CATTING_SERVICE_SOCKETLIST.length -1)){
                        socketio.of('/catting/list').in(room_id).clients(function(error, client_rooms){
                          client_rooms.forEach(function(ele, idx){
                            for(var i = 0; i < client_all.length; i++){
                              if(client_all[i].id == ele){
                                if(client_all[i].request.session.nickname == user_nickname){
                                  socketio.of('/catting/list').to(user_nickname).emit('kicked_user',{now_room:now_room_,participate_length:room_obj.user_list.length});
                                }else{
                                  client_room.push(ele);
                                }
                                client_all.splice(i,1);
                                i--;
                              }
                              if(i == (client_all.length-1) && idx == (client_rooms.length-1)){
                                console.log("client_all length :: "+client_all.length);
                                for(var all = 0; all < client_all.length; all++){
                                  data.leave_user = 'true';
                                  data.room_id = now_room_;
                                  data.participate = room_obj.user_list;
                                  socketio.of('/catting/list').to(client_all[all].id).emit('logout_user_participate',data);
                                };
                                for(var j = 0; j < client_room.length; j++){
                                  data.leave_user = 'false';
                                  data.room_id = now_room_;
                                  data.participate = room_obj.user_list;
                                  data.user = user_nickname;
                                  socketio.of('/catting/list').to(client_room[j]).emit('logout_user_participate',data);
                                };
                              }
                            }
                          });
                        });
                      }
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
      console.log("AAAAAAAAA");
      Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
        var ele = global.catting_room_list.room_list[index];
        if(ele.room_id == now_room){
          room_obj = ele;
          var data = {user: user_nickname,user_list: room_obj.user_list,room_id: now_room_,participate: room_obj.user_list,leave_user:'false'};
          room_index = index;
          room_obj.user_list.forEach(function(element,idx){
            console.log("BBBBBBBBBB");
            if(element == user_nickname){
              room_obj.user_list.splice(idx,1);
              room_obj.participate.splice(idx,1);
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
                var client_all = [];
                var client_room = [];
                global.CATTING_SERVICE_SOCKETLIST.forEach(function(clients, index){
                  client_all[index] = clients;
                  if(index == (global.CATTING_SERVICE_SOCKETLIST.length -1)){

                    socketio.of('/catting/list').in(now_room_).clients(function(error, client_rooms){
                      if(client_rooms.length == 0){
                        for(var all = 0; all < client_all.length; all++){
                          data.leave_user = 'true';
                          data.room_id = now_room_;
                          data.participate = room_obj.user_list;
                          socketio.of('/catting/list').to(client_all[all].id).emit('logout_user_participate',data);
                        };
                      }
                      client_rooms.forEach(function(ele, idx){
                        for(var i = 0; i < client_all.length; i++){
                          if(client_all[i].id == ele){
                            client_room.push(ele);
                            client_all.splice(i,1);
                            i--;
                          }
                          if(i == (client_all.length-1) && idx == (client_rooms.length-1)){
                            for(var all = 0; all < client_all.length; all++){
                              data.leave_user = 'true';
                              data.room_id = now_room_;
                              data.participate = room_obj.user_list;
                              socketio.of('/catting/list').to(client_all[all].id).emit('logout_user_participate',data);
                            };
                            for(var j = 0; j < client_room.length; j++){
                              data.leave_user = 'false';
                              data.room_id = now_room_;
                              data.participate = room_obj.user_list;
                              data.user = user_nickname;
                              socketio.of('/catting/list').to(client_room[j]).emit('logout_user_participate',data);
                            };
                          }
                        }
                      });
                    });
                  }
                });
            }
          });
        }
      });
    }
  },KickedUserConnect : function(socket,socketio){
    var user_nickname = socket.request.session.nickname;
    var room_id = socket.request.session.room_id;
    socket.leave(room_id);
    socket.leave(user_nickname);
    socket.request.session.room_id = undefined; // 접속중인 방 정보 초기화
    socket.request.session.now_room = undefined;
  //  global.CATTING_SERVICE_SOCKETLIST.push(socket);
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
      room_obj = global.catting_room_list.room_list[room_index];
      var user_nickname = socket.request.session.nickname;
      socket.join(room_id);
      socket.join(user_nickname); // 강퇴되었다가 재접한 유저를 위해서 추가...
      // 클라이언트에다가 유저 리스트 넘김
      var search_room_id = room_id;
      var data = {
        user_list: room_obj.user_list,
        participate: room_obj.user_list,
        new_user: user_nickname,
        room_id: room_id,
        master_user: room_obj.room_master
      };
      if(is_double != true){
        room_obj.user_list.push(user_nickname);
        room_obj.participate.push(user_nickname);
      }
      //broadcast.to()  - 나를 제외 한
      //in() - 나를 포함한

      room_obj.user_list.forEach(function(ele_,index_){
        if(ele_ == undefined || JSON.stringify(ele_) == "[]"){
          room_obj.user_list.splice(index_,1);
        }
        if(ele_ == socket.request.session.nickname){
          var client_all = [];
          var client_room = [];
          global.CATTING_SERVICE_SOCKETLIST.forEach(function(clients, index){
            client_all[index] = clients;
            if(index == (global.CATTING_SERVICE_SOCKETLIST.length -1)){
              socketio.of('/catting/list').in(room_id).clients(function(error, client_rooms){
                client_rooms.forEach(function(ele, idx){
                  for(var i = 0; i < client_all.length; i++){
                    if(client_all[i].id == ele){
                      client_room.push(ele);
                      data.in_user = 'true';
                      socketio.of('/catting/list').to(ele).emit('render_userlist_all',data);
                      client_all.splice(i,1);
                      i--;
                    }
                    if(i == (client_all.length-1) && idx == (client_rooms.length-1)){
                      for(var j = 0; j < client_all.length; j++){
                        data.in_user = 'false';
                        socketio.of('/catting/list').to(client_all[j].id).emit('render_userlist_all',data);
                      };
                    }
                  }
                });
              });
            }
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
                    socketio.of('/catting/list').in(room_id).emit('render_mastermark',{masterlist: room_obj.room_master});
                    socketio.of('/catting/list').to(ele_).emit('render_userlist',data);
                  }
                  if(!value_){ // 일반 방장일경우 추가
                    data.is_master = true;
                    data.new_user = user_nickname;
                    data.level = '0';
                    socketio.of('/catting/list').in(room_id).emit('render_mastermark',{masterlist: room_obj.room_master});
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
  },RoomSerectPassword : function(obj,password){
    // 여기서 obj는 db에서 찾아오는 데이터 or 저장할 데이터의 객체
    var pw = password;
    var crypto = global.crypto;
    // 비밀번호 암호화저장
    // hash 값
    obj.makingHash = function(){
      var dump = Math.round(new Date().valueOf()*Math.random());
      return dump;
    };

    // 비밀번호 암호화
    obj.encryptPassword = function(pw,isHash){
      var dump = pw;
      var shasum;
      // Hash가 아닌 Salt 인데... 이걸 치는 이유는 특정한 패턴의 비밀번호를 입력했을 때 해킹당하지 않게끔
      // 임의의 값을 넣어두는 것
      if(!isHash) {
        shasum = crypto.createHash('sha256',obj.hash);
      }else {
        shasum = crypto.createHash('sha256',isHash);
      }
      shasum.update(dump);
      var output = shasum.digest('hex');
      return output;
    };

    // 비밀번호 체크 시 사용
    obj.checkloginPassword = function(pw_text,pw){
      var is_true = false;
      var input = obj.encryptPassword(pw_text,obj.hash);
      input == pw ? is_true = true : is_true = false ;
      return is_true;
    };

    // 스키마 가져오기
    var Schmea_ = require('mongoose').model('member').schema;
    // 비밀번호 저장 시 사용
    obj.settingPassword = function(){
      obj.hash = obj.makingHash(); // 사용자정의 메소드 호출
      obj.room_password = obj.encryptPassword(pw); // 사용자정의 메소드 호출
    }
  },AuthSecretRoom : function(data,socket,socketio){ // 비밀글 인증
    var room_id_key = data.room_id;
    var user_nickname = socket.request.session.nickname;
    //관리자의 경우 로그인 필요 없게...
    global.MEMBERLIB.CheckAuthenfication('',socket.request.session.userid,'','',function(value_){
      if(value_){
        global.CATTING_SERVICE.CattingUserlist(data,socket,socketio);
      }else{
        global.CATTING_SERVICE_DB.findOne({room_id: room_id_key},function(err,room_info){
          if(room_info.room_is_secret != 'true'){
            global.CATTING_SERVICE.CattingUserlist(data,socket,socketio);
          }else{ // 비밀글인 경우
            var is_passed = false;
            global.CATTING_SERVICE.RoomSerectPassword(room_info,data.room_password);
            is_passed = room_info.checkloginPassword(data.room_password,room_info.room_password);
            if(is_passed){
              global.CATTING_SERVICE.CattingUserlist(data,socket,socketio);
            }else{
              socketio.of('/catting/list').in(user_nickname).emit('passed_error');
            }
          }
        });
      }
    },'check_admin',4);
  }
}
