if (!window.console) {
    console = {};
    console.log = function(){};
}

$.fn.MovingFollowMouse = function(options) {
  console.log("플러그인 불러오기");
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
      console.log("X1 좌표 :: "+x_point+" :: Y1 좌표 :: "+y_point);
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
  $.ajax({
      type:"GET",
      url:$(location).attr('href'),
      success:function(res){
      },
      beforeSend:function(){
        $('.loading_div').show();
      },
      complete:function(){
        setTimeout(function(){
          $('.loading_div').fadeOut(500);
        },2000);
      },
      error:function(e){
        console.log("에러");
      }
  });
}


function DisableGnbDropdown(){ // PC판 이상일때 드롭다운 중지
  if($(window).width() > 1199){
    $(".gnb_navbar .dropdown").each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
    });
  }
  if($(window).width() > 1199){
    $(".gnb_navbar .dropdown").unbind("click focus");
    $(".gnb_navbar .dropdown > a").unbind("click focus");
    $(".gnb_navbar .dropdown").each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
      $(this).addClass('open');
    });
    $(".gnb_navbar .dropdown > a").each(function(){
      $(this).attr('data-toggle','');
      $(this).attr('aria-expanded','true');
    });
  }else{
    $(".gnb_navbar .dropdown").bind("click focus");
    $(".gnb_navbar .dropdown > a").bind("click focus");
    $(".gnb_navbar .dropdown").each(function(){
      $(this).attr('data-toggle','dropdown');
      $(this).attr('aria-expanded','false');
      $(this).removeClass('open');
    });
    $(".gnb_navbar .dropdown > a").each(function(){
      $(this).attr('data-toggle','dropdown');
      $(this).attr('aria-expanded','false');
    });
  }
}


$(document).ready(function() {
  LoadingPage();
  DisableGnbDropdown();
  if($('.main_visual')){
    $('.main_visual').flexslider({
      animation: "slide",
      start: function(slider){
        var slider = $('.main_visual').data('flexslider');
            slider.resize();
            slider.addClass('active');
      },
      manualControls: ".carousel_buttons button",
      directionNav: false,
      direction:'horizontal'
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

  if($('.main_recipe .event_obj')){
    $('.main_recipe .event_obj').MovingFollowMouse();
  }
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
  DisableGnbDropdown();
});
