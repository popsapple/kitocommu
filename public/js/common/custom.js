if (!window.console) {
    console = {};
    console.log = function(){};
}
$(document).ready(function() {
  LoadingPage();
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
