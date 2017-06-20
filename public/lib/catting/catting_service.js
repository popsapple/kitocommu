exports = module.exports = {CattingRoomDbSetting  : function (mongoose,socketio,callback){
    var obj = this;
    var Schema = mongoose.Schema;
console.log("콜백실행00");
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
          console.log("콜백실행01");
          callback();
        }
      });
    });
  },CattingListAddList  : function(data,socket,socketio,user_id,user_nickname){
    data.room_id = data.user_id+data.time;
    var AddedRoomInfo = {
      'is_secret' : 'no',
      'room_title' : data.room_title,
      'room_id' : data.room_id,
      'participate' : [],
      'room_master': data.user_nickname,
      'user_list': []
    }
    global.catting_room_list.room_list.push(AddedRoomInfo);

    var AddedRoomInfo = new global.CATTING_SERVICE_DB(AddedRoomInfo);
    AddedRoomInfo.save({});
    console.log("render_addedroom");
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
    var room_id = data.room_id;
    var now_room = data.now_room;
    var user_nickname = data.user_nickname;
    socket.leave(now_room);
    Object.keys(global.catting_room_list.room_list).forEach(function(element,index){
      var ele = global.catting_room_list.room_list[index];
      var data = {user: user_nickname}
      if(ele.room_id == now_room){
        room_obj = ele;
        room_index = index;
        room_obj.user_list.forEach(function(element,idx){
          if(element == user_nickname){
            room_obj.user_list.splice(idx,1);

              var search_room_id = now_room;
              global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
                 { room_id: search_room_id },
                 {
                   $set: {
                     user_list: global.catting_room_list.room_list[room_index].user_list,
                     participate: global.catting_room_list.room_list[room_index].user_list
                   }
                 }
              ,{ multi: true },function (error, user){});
              socketio.of('/catting/list').in(now_room).emit('logout_user',data);
          }
        });
      }
    });
  },CattingUserlist  : function(data,socket,socketio){
    var room_id = data.room_id;
    var now_room = data.now_room;
    var user_nickname = socket.request.session.nickname;
    var is_double = false;
    var room_obj;
    var that = this;
    var room_index;
    console.log("기존 접속 방 :: "+data.now_room);
    if(room_id != now_room && data.now_room != undefined){ //기존에 접속한 방이 있었다면
      global.CATTING_SERVICE.LogoutUserList(data,socket,socketio);
    }
    socket.join(room_id);
    //socket.join(user_nickname);

    that.AddUser = function(room_index,is_double){
      room_obj = global.catting_room_list.room_list[room_index];
      var search_room_id = room_id;
      var data = {
        list: room_obj.user_list,
        new_user: user_nickname,
        master_user: room_obj.room_master
      };
      if(is_double != true){
        room_obj.user_list.push(user_nickname);
      }
      console.log('render_userlist');
      socketio.of('/catting/list').in(room_id).emit('render_userlist',data);
      //to  - 나를 제외 한
      //in - 나를 포함한

      room_obj.user_list.forEach(function(ele_,index_){
        if(ele_ == undefined || JSON.stringify(ele_) == "[]"){
        //  console.log("널값");
          room_obj.user_list.splice(index_,1);
        }
        if(index_ == (room_obj.user_list.length-1)){
          global.CATTING_SERVICE_DB.update( // DB에 방 접속자 수정
             { room_id: search_room_id },
             {
               $set: {
                 user_list: global.catting_room_list.room_list[room_index].user_list,
                 participate: global.catting_room_list.room_list[room_index].user_list
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
        console.log("render_userlist0000");
        room_obj = ele;
        room_index = index;
        if(JSON.stringify(room_obj.user_list) == "[]" || room_obj.user_list == undefined){
          that.AddUser(room_index,'');
        }else{
          console.log("render_userlist1111");
          room_obj.user_list.forEach(function(element,idx){
            var ele = room_obj.user_list[idx];
            if(ele == user_nickname){
              is_double = true; // 이미 있던 사람인지 체크
            }
            if(idx == (room_obj.user_list.length-1)){
              console.log("render_userlist222222");
              that.AddUser(room_index,is_double);
            }
          });
        }
      }
    });
  },UpdatingCattingContents  : function(data,socket,socketio){
    if(data.is_whisper){
      var id = data.to_user;
      var me = data.user_nickname;
      socketio.of('/catting/list').in(me).emit('render_cattingcontents',data);
    }else{
      var id = data.room_id;
    }
    socketio.of('/catting/list').in(id).emit('render_cattingcontents',data);
  }
}
