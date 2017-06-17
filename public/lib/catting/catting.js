module.exports.catting_con = function(app,socketio){
  global.CATTING_SERVICE = require('./catting_service.js');
  app.get('/catting/list/:result_type', function(request, response) {
    var request_data;
    if(!request.params){
      request_data = request.body;
    }else{
      request_data = request.params;
    }

    global.CATTING_SERVICE.CattingListLoadView(request, response); // 처음 로드 시 렌더링처리
  });

  socketio.sockets.on('connection', function(socket){
    //socket.emit('catting_socket', { will: 'be received by everyone'}); // 서버가 먼저 각 클라이언트에 소켓 연결을 발생해 줘야 함...
    socket.on('add_addedroom', function(data){
      global.CATTING_SERVICE.CattingListAddList(data,socket);
    });
    //socket.on('disconnect', function(){ console.log('disconnected'); });
  });
}
