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
  var window_width;
  var item_size = options['xs_size'];
  var position_check_array = [];
  var item_length;

  function PositionCheckArraySetting(item_length,item_size){
    var row_count = -1; // 열 번호.
    var col_count; // 행 번호.
    var row_height;
    var col_width;
    var p_height;
    for(var i = 0; i < item_length; i++){ // 행 및 열번호 생성
      obj.eq(i).width((obj.eq(i).parent().width()-(15*(item_size-1)))/item_size);
      col_count = i%item_size;
      col_count == 0 ? row_count+=1 : '';
      if(row_count == 0){
        row_height = 0;
      }else{
        row_height = (function(){
          var pattern = /(\d+)/g;
          var height = position_check_array[(i-item_size)].y_point+parseInt(obj.eq((i-item_size)).height());
          return height;

        })();
      }
      if(col_count == 0){
        col_width = 0;
      }else{
        col_width = (function(){
          var pattern = /\d+/g;
          var width = position_check_array[(i-1)].x_point+parseInt(obj.eq((i-1)).width());
          return width;
        })();
      }
      position_check_array[i] = {
        'row': row_count,
        'col': col_count,
        'x_point': col_width,
        'y_point': row_height
      }
      if(i == item_length-1){ // 맨 마지막 줄일 때
        p_height = parseInt(position_check_array[i].y_point)+obj.eq(i).height();
        var count = 0;
        for(var j = (i-item_size); j < item_length; j++){
          if(j < 0){
            j = 0;
          }
          var height = parseInt(position_check_array[j].y_point)+obj.eq(j).height();
          if(p_height < height){
            p_height = height;
          }
          if(j == item_length-1){
            obj.parent().height(p_height+(15*parseInt(position_check_array[j].row)));
          }
        }
      }
    }
  }

  this.check_item_width = function(){
    window_width = viewport().width;
    item_length = this.size();
    if(window_width <= 499){
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

    PositionCheckArraySetting(item_length,item_size);
    obj.each(function(index){
      $(this).attr('data-row',position_check_array[index].row);
      $(this).attr('data-col',position_check_array[index].col);

      var position_y = position_check_array[index].y_point;
      var position_x = position_check_array[index].x_point;

      if($(this).attr('data-col')!=0 && item_size != 1){
        position_x += (15*parseInt($(this).attr('data-col')));
      }
      if($(this).attr('data-row')!=0){
        position_y += (15*parseInt($(this).attr('data-row')));
      }
      $(this).css({
        'transform': 'matrix(1, 0, 0, 1, '+position_x+', '+position_y+')',
        '-ms-transform': 'matrix(1, 0, 0, 1, '+position_x+', '+position_y+')',
        'transition': 'transform 1s 0s'
      });
    });
  }

  obj.check_item_width();

  $(window).resize(function(){
    window_width = viewport().width;
    obj.check_item_width();
  });
};

$(document).ready(function(){
  $("#TotalRoomList .room_list > li ").onMovingFllowingItem();
});
