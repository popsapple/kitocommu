if (!window.console) {
    console = {};
    console.log = function(){};
}

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

  if(obj.find("img").length != 0){
    var img = new Image();
    var img_src;
    obj.each(function(index){
      if($(this).find("img")){
        img_src = $(this).find("img").attr("src");
      }
    });
    img.src = img_src;
    img.onload = function(){
      setTimeout(function(){
        obj.check_item_width();
      },1000);
    };
  }else{
    obj.check_item_width();
  }

  $(window).resize(function(){
    window_width = viewport().width;
    obj.check_item_width();
  });
};

$.fn.onSliderQna = function(options)
{
	var obj = this;
	var defult = {
		'item_wrapper_wrapper' : '.slides_wrapper',
		'item_wrapper' : '.slides',
		'items' : '.slides li',
		'prev_btn' : '.prev',
		'next_btn' : '.next',
    'control_button' : '.carousel_buttons button',
		'item_length' : 1,
		'item_length2' : 0,
		'first_left': 0,
    'item_id' : 'index'
	};
	var options = $.extend({}, defult, options);
  var item_last_index = parseInt($(options['items']).length-1);

  this.SettingItem = function() {
		var item_length;
    $(options['items']).width($(options['item_wrapper_wrapper']).width());
		var width = $(options['items']).width();
		$(options['item_wrapper']).width(width*$(options['items']).size());
	};

	$(window).resize(function() {
		obj.SettingItem();
	});

  $(document).ready(function() {
    $(options['items']).each(function(index){
      $(this).attr('id',options['item_id']+index);
    });
	});

	this.MoveItem = function(desc,index) {
		var loadImage = setTimeout(function()
		{
			var move_width = parseInt($(options['items']).width());
			if(desc == 'next') {
				var clone_item = $(options['items']).eq(0).clone();
				var clone_item2 = $(options['items']).eq(0).clone().addClass('temp');
				$(options['items']).eq(0).remove();
				$(options['item_wrapper']).prepend(clone_item2);
				$(options['item_wrapper']).animate({
						'left' : (options['first_left']-=move_width)
				},1000,function()
				{
					$(options['item_wrapper']).find(' .temp').remove();
					$(options['item_wrapper']).css('left',(options['first_left']+=move_width));
					$(options['item_wrapper']).append(clone_item);

          var index = parseInt($(options['items']).eq(0).attr('id').replace(options['item_id'],''));
          $(options['control_button']).each(function(){
            $(this).attr("aria-selected","false");
            $(this).removeClass("active");
          });
          $(options['control_button']).eq(index).attr("aria-selected","true");
          $(options['control_button']).eq(index).addClass("active");

          $(options['items']).each(function(){
            $(this).attr("aria-hidden","true");
          });
          $(options['items']).eq(0).attr("aria-hidden","false");
          $(options['items']).eq(0).click();
				});
			}
			if(desc == 'prev') {
				var clone_item = $(options['items']).eq(item_last_index).clone();
				$(options['items']).eq(item_last_index).remove();
				$(options['item_wrapper']).prepend(clone_item);
				$(options['item_wrapper']).css('left',(options['first_left']-=move_width));
				$(options['item_wrapper']).animate({
						'left' : (options['first_left']+=move_width)
				},1000,function()
				{
						$(options['item_wrapper']).find(' .temp').remove();

            var index = parseInt($(options['items']).eq(0).attr('id').replace(options['item_id'],''));
            $(options['control_button']).each(function(){
              $(this).attr("aria-selected","false");
              $(this).removeClass("active");
            });
            $(options['control_button']).eq(index).attr("aria-selected","true");
            $(options['control_button']).eq(index).addClass("active");

            $(options['items']).each(function(){
              $(this).attr("aria-hidden","true");
            });
            $(options['items']).eq(0).attr("aria-hidden","false");
            $(options['items']).eq(0).click();
				});
			}
			if(desc == 'num') {
        var clone_item = [];
        var dir = false;
        var now_index = parseInt($(options['items']).eq(0).attr('id').replace(options['item_id'],''));
        var move_width1;
        var move_width2;
        var count = (now_index+1)-(index+1);
        count > 0 ? dir = true : false;
        if(now_index == item_last_index){
          count = (now_index+1)-(index+1);
        }
        if(index == now_index){
          return;
        }
        if(dir){ // 기존것 보다 숫자가 작은 걸로 이동
          $(options['items']).each(function(idx){
            var idx_ = parseInt($(this).attr('id').replace(options['item_id'],''));
            if(now_index > idx_ && idx_ >= index){
              clone_item.push($(this).clone());
              $(this).addClass('temp');
            }
          });

          function sortList(a, b) {
            var a_idx = parseInt(a.attr('id').replace(options['item_id'],''));
            var b_idx = parseInt(b.attr('id').replace(options['item_id'],''));
            if(a_idx == b_idx){ return 0} return  a_idx > b_idx ? -1 : 1;
          }
          clone_item.sort(sortList);

          move_width1 = options['first_left']-$(options['items']).width()*(clone_item.length);

          for(var i = 0; i < clone_item.length; i++){
            $(options['item_wrapper']).prepend(clone_item[i]);
          }
          $(options['item_wrapper']).css('left',move_width1);

          $(options['item_wrapper']).animate({
  						'left' : options['first_left']
  				},1000,function()
  				{
  					$(options['item_wrapper']).find('.temp').remove();
            $(options['control_button']).each(function(){
              $(this).attr("aria-selected","false");
              $(this).removeClass("active");
            });
            $(options['control_button']).eq(index).attr("aria-selected","true");
            $(options['control_button']).eq(index).addClass("active");

            $(options['items']).each(function(){
              $(this).attr("aria-hidden","true");
            });
            $(options['items']).eq(0).attr("aria-hidden","false");
            $(options['items']).eq(0).click();
  				});

        }else{ // 기존것 보다 숫자가 높은 걸로 이동
          $(options['items']).each(function(idx){
            var temp;
            var idx_ = parseInt($(this).attr('id').replace(options['item_id'],''));
            if(now_index <= idx_ && idx_ < index){
              clone_item.push($(this).clone());
              $(this).addClass('temp');
            }
          });

          function sortList(a, b) {
            var a_idx = parseInt(a.attr('id').replace(options['item_id'],''));
            var b_idx = parseInt(b.attr('id').replace(options['item_id'],''));
            if(a_idx == b_idx){ return 0} return  a_idx > b_idx ? -1 : 1;
          }
          clone_item.sort(sortList);

          move_width1 = options['first_left']-$(options['items']).width()*(clone_item.length);
          $(options['item_wrapper']).animate({
  						'left' : move_width1
  				},1000,function()
  				{
            for(var i = (clone_item.length-1); i >= 0; i--){
              $(options['item_wrapper']).append(clone_item[i]);
            }
            $(options['item_wrapper']).css('left',options['first_left']);
            $(options['item_wrapper']).find('.temp').remove();
            $(options['control_button']).each(function(){
              $(this).attr("aria-selected","false");
              $(this).removeClass("active");
            });
            $(options['control_button']).eq(index).attr("aria-selected","true");
            $(options['control_button']).eq(index).addClass("active");

            $(options['items']).each(function(){
              $(this).attr("aria-hidden","true");
            });
            $(options['items']).eq(0).attr("aria-hidden","false");
            $(options['items']).eq(0).click();
          });
        }
			}
		},100);
	};

	$(options['next_btn']).on("click",function(){
		obj.MoveItem('next');
	});
	$(options['prev_btn']).on("click",function(){
		obj.MoveItem('prev');
	});
  $(options['control_button']).on("click",function(){

    var index = $(this).parent().index();
		obj.MoveItem('num',(index));
	});
};

$.fn.MovingFollowMouse = function(options) {
  var defalut = {
    "follow_item_p" : ".event_obj",
    "follow_item" : " .meal_icon > img",
    "dir" : 40
  };
  var obj = this;

  function move_obj(){
    this.moving = function(mouse_event,move_img){
      var move_img_p = move_img.parent();
      if(!mouse_event){
        mouse_event = {};
        mouse_event.pageX = move_img_p.offset().left;
        mouse_event.pageY = move_img_p.offset().top;
      }

      var x_point = (mouse_event.pageX - move_img_p.offset().left)/5;
      var y_point = (mouse_event.pageY - move_img_p.offset().top)/5;
      if(x_point > options.dir) {x_point = options.dir;}
      if(x_point < (0-options.dir)) {x_point = (0-options.dir);}
      if(y_point > options.dir) {y_point = options.dir;}
      if(y_point < (0-options.dir)) {y_point = (0-options.dir);}
      if(x_point == 0 && x_point == 0){
        move_img.animate({
          'left':x_point,
          'top':y_point
        },1000);
      }else{
        if(!move_img.is(":animated")){
          if(x_point == 40 && x_point == 40){
            move_img.animate({
              'left':x_point,
              'top':y_point
            },400);
          }else{
            move_img.animate({
              'left':x_point,
              'top':y_point
            },50);
          }
        }
      }
    };

    return this;
  };

  if(options == null || options == undefined) {
    options = {};
  }

  for(var key in defalut) {
    if(defalut.hasOwnProperty(key)){
      if(!options[key]){
        options[key] = defalut[key];
      }
    }
  }

  this.mousemove(function(event){
    if(!$(event.target).hasClass('meal_icon')){
      var that = move_obj.apply($(this),[]);
      that.moving(event,$(this).find(options.follow_item));
    }
  });

  this.mouseleave(function(event){
      var that = move_obj.apply($(this),[]);
      that.moving('',$(this).find(options.follow_item));
  });
};

function LoadingPage(){
  if($(location).attr('href') == 'http://192.168.219.104:5000'){
    $.ajax({
        type:"GET",
        cache:false,
        url:'http://192.168.219.104:5000',
        async: true,
        success:function(res){
        },
        beforeSend:function(){
          $('.loading_div').show();
        },
        complete:function(){
          setTimeout(function(){
            $('.loading_div').fadeOut(500);
            $('.loading_complete').addClass('active');
          },1000);
        },
        error:function(e){
          console.log("에러");
        }
    });
  }else{
    $('.loading_div').fadeOut(1500);
    if($('.loading_complete')){$('.loading_complete').addClass('active');}
    return false;
  }
}


function DisableGnbDropdown(obj,callback,callback02){ // PC판 이상일때 드롭다운 중지
  var width_check = viewport().width;
  if(width_check > 1199){
    $(obj).each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
    });
  }
  if(width_check > 1199){
    $(obj).unbind("click");
    $(obj+" > a").unbind("click");
    $(obj).each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
      $(this).addClass('open');
    });
    $(obj+" > a").each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
    });
    callback ? callback() : '';
  }else{
    $(obj).bind("click");
    $(obj+" > a").bind("click");
    $(obj).each(function(){
      $(this).attr('data-toggle','dropdown');
      $(this).attr('aria-expanded','false');
      $(this).removeClass('open');
    });
    $(obj+" > a").each(function(){
      $(this).attr('data-toggle','dropdown');
      $(this).attr('aria-expanded','false');
    });

    $('li.dropdown ul li').on('click', function() {
        var $el = $(this);
        var $a = $el.children('a');
        if ($a.length && $a.attr('href')) {
            location.href = $a.attr('href');
        }
    });
    callback02 ? callback02() : '';
  }
}

$(document).ready(function() {
  if($("#boardList.recipe_list > ul > li")){
    $("#boardList.recipe_list > ul > li").onMovingFllowingItem();
  }
  $(".gnb-navbar-brand").focus();
  LoadingPage();
  DisableGnbDropdown(".gnb_navbar .dropdown");
  if($('.main_kito_faq')){
    $(".main_kito_faq").onSliderQna({
      'item_wrapper_wrapper' : '.main_kito_faq',
      'item_wrapper' : '.main_kito_faq > ul',
      'items' : '.main_kito_faq > ul > li',
      'prev_btn' : '.main_kito_faq .carousel_buttons button.prev',
      'next_btn' : '.main_kito_faq .carousel_buttons button.next',
      'control_button' : '.main_kito_faq .carousel_buttons div button',
      'item_length' : 1,
      'item_length2' : 0,
      'first_left': 0,
      'item_id': 'FaqSlideritem'
    });
    DisableGnbDropdown(".main_kito_faq > ul > li");
  }
  if($('.main_visual')){
    $('.main_visual').flexslider({
      animation: "slide",
      slideshow: false,
      start: function(slider){
        if(slider.hasClass('active')){
          $(".main_visual").attr("aria-live","polite");
        }
        var slider = $('.main_visual').data('flexslider');
            slider.resize();
            slider.addClass('active');
      },
      manualControls: ".carousel_buttons div button",
      directionNav: false,
      direction:'horizontal',
      after: function(){
        $(".main_visual .slides li").each(function(){
          $(this).attr("aria-hidden","true");
        });
        $(".main_visual .slides li.flex-active-slide").attr("aria-hidden","false");

        $("#MainVisualSliderStop").click(function(){
          $('.main_visual').flexslider('pause');
        });
        $("#MainVisualSliderPlay").click(function(){
          $('.flex-slider').flexslider('play');
        });
      }
    });
  }

  if($(".designcustom .navbar-collapse")){
    $(".designcustom .navbar-collapse").on('click',function(event){
      if($(event.target).hasClass("navbar-collapse") || $(event.target).hasClass("close_btn")){
        $(this).removeClass('in');
        return false;
      }
    });
  }

  $(".gnb_close_btn").on('click',function(event){
    $('#navbar').trigger("hide.bs.dropdown");
    return false;
  });

  if($('.main_recipe .event_obj')){
    $('.main_recipe .event_obj').MovingFollowMouse();
  }

});

$('#navbar').on('shown.bs.collapse', function () {
  $('.gnb_navbar').attr('aria-hidden','false');
  var newHeight = $('body').height();
  $('html .gnb_navbarcall').css({
    'min-height': newHeight
  });
});
$('#navbar').on('hidden.bs.collapse', function () {
  $('.gnb_navbar').attr('aria-hidden','true');
  var newHeight = 0;
  $('html .gnb_navbarcall').css({
    'min-height': newHeight
  });
});
$(window).scroll(function(event) {
  if($(".designcustom .navbar-default")){
    if($(window).scrollTop() > $(".designcustom .navbar-default").height()){
      $(".designcustom .navbar-default").addClass("scroll");
    }else if($(window).scrollTop() == 0){
      $(".designcustom .navbar-default").removeClass("scroll");
    }
  }
});

$(window).resize(function(event){
  DisableGnbDropdown(".gnb_navbar .dropdown");
  DisableGnbDropdown(".main_kito_faq > ul > li");
});
