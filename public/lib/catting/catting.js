module.exports.catting = function(app){
  global.CATTING_SERVICE = require('./catting_service.js');
  global.catting_room_list;
  app.all('/catting/list/:type', function(request, response) {
    var request_data;
    if(!request.params){
      request_data = request.body;
    }else{
      request_data = request.params;
    }

    if(request_data.result_type == 'roomlist_load'){
      global.CATTING_SERVICE.CattingListLoadView(request, response); // 처음 로드 시 렌더링처리
    }
    if(request_data.result_type == 'roomlist_add'){
      global.CATTING_SERVICE.CattingListLoadList(request, response); //ajax로 방 add 처리.
    }
  });
}
