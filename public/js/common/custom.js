$(document).ready(function() {
  if($('.main_visual.flexslider')){
    $('.main_visual.flexslider').flexslider({
      animation: "slide",
      customDirectionNav : "#MainSliderButtons button"
    });
  }

  if($(".navbar > .container > .navbar-collapse.in")){
    $(".navbar > .container > .navbar-collapse.in").on('click',function(){
      $(this).removeClass('in');
    });
  }
});
