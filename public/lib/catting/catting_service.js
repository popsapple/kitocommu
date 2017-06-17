exports = module.exports = {CattingListAddList  : function(data,socket){
    var AddedRoomInfo = {
      'room_title' : data.room_title,
      'room_id' : 'saysun3420170617115203', // 웹소켓 작업 전 임의로 추가
      'participate' : 0
    }
    global.catting_room_list.room_list.push(AddedRoomInfo);
    socket.broadcast.emit('render_addedroom',data);
  },CattingListLoadView  : function(request, response){
    var request_data;
    if(!request.query.room_title){
      request_data = request.body;
    }else{
      request_data = request.query;
    }
    if(global.catting_room_list == undefined){ // 서버가 꺼지거나 아님 기존에 방이 없을 때.
      global.catting_room_list = {
        room_list : []
      };
    }
    return response.render('catting/list',global.catting_room_list);
  }
}
