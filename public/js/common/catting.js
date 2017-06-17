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
  var window_width = viewport();
  var item_size = options['xs_size'];
  var position_check_array = [];
  var item_length = this.size();

  function PositionCheckArraySetting(item_length,item_size){
    var row_count; // 열 번호.
    var col_count; // 행 번호.
    for(var i = 0; i < item_length; i++){ // 행 및 열번호 생성
      row_count =
      position_check_array[i] = {
        'row':
        'col':
      }
    }
  }

  this.check_item_width = function(){
    if(window_width >= 320){
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
    obj.each(function(index){
      obj.width = (obj.parent().width()-(15*(item_size-1)))/item_size;
    });
  }
};

$(document).ready(function(){
  $("#MakeNewRoom #TotalRoomList .room_list > li ").onMovingFllowingItem();
});
