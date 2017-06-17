exports = module.exports = {CattingListLoadList  : function(request, response){
    console.log("CattingListLoadList 실행");
    var data = {};
    return response.send('catting/list',global.catting_room_list);
  },CattingListLoadView  : function(request, response){
    global.catting_room_list =[
      {
        'room_title' : '새로운 방에 들어오신걸 환영합니다 ^^',
        'room_id' : 'saysun3420170617115103' // 생성자아이디 + 시간(년,일,월,시,분,초)
      },
      {
        'room_title' : '새로운 방에 들어오신걸 환영합니다~~~~ ^^',
        'room_id' : 'saysun3420170617115203' // 생성자아이디 + 시간(년,일,월,시,분,초)
      },
      {
        'room_title' : '우리 모두 환영해요 ^^',
        'room_id' : 'saysun3420170617115459' // 생성자아이디 + 시간(년,일,월,시,분,초)
      }
    ];
    return response.render('catting/list',global.catting_room_list);
  }
}
